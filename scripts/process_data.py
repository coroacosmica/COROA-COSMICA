import os
import pandas as pd
import json
import re
import asyncio
from PIL import Image, ImageEnhance

try:
    import winsdk.windows.media.ocr as ocr
    import winsdk.windows.graphics.imaging as imaging
    import winsdk.windows.storage.streams as streams
    from winsdk.windows.storage import StorageFile
except ImportError:
    print("winsdk not installed yet")

async def get_ocr_text(image_path):
    file = await StorageFile.get_file_from_path_async(os.path.abspath(image_path))
    stream = await file.open_async(streams.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    software_bitmap = await decoder.get_software_bitmap_async()
    
    engine = ocr.OcrEngine.try_create_from_user_profile_languages()
    if not engine:
        engine = ocr.OcrEngine.try_create_from_language(ocr.Language("en-US"))
        
    result = await engine.recognize_async(software_bitmap)
    return result.text

def enhance_image(input_path, output_path):
    with Image.open(input_path) as img:
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        width, height = img.size
        # upscale if too small
        if width < 800:
            ratio = 800.0 / width
            new_size = (800, int(height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
        
        color_enhancer = ImageEnhance.Color(img)
        img = color_enhancer.enhance(1.1)
        
        img.save(output_path, "PNG", quality=95)

async def main():
    os.makedirs('c:/Website/data', exist_ok=True)
    
    print("Parsing Excel...")
    df = pd.read_excel('c:/Website/final_price.xlsx', header=1)
    
    df['Code'] = df['Code'].ffill()
    
    products_dict = {}
    valid_codes = set()
    
    last_price = 0
    for index, row in df.iterrows():
        code = str(row['Code']).strip()
        if pd.isna(row['Code']) or code.upper() == 'CODE' or code == 'nan':
            continue
            
        variant = str(row['Variant / Color']).strip()
        if variant == 'nan':
            variant = "Standard"
            
        price_val = row.get('Price (EGP)', row.iloc[2])
        if pd.notna(price_val) and str(price_val).strip() != 'nan':
            try:
                price = float(str(price_val).replace(',', '').strip())
                last_price = price
            except ValueError:
                price = last_price
        else:
            price = last_price
            
        if price == 0 and variant == "Standard":
            continue
            
        code_upper = code.upper()
        valid_codes.add(code_upper)
        
        if code_upper not in products_dict:
            products_dict[code_upper] = {
                'code': code,
                'variations': []
            }
        
        products_dict[code_upper]['variations'].append({
            'color': variant,
            'price': price
        })
        
    with open('c:/Website/data/new_products.json', 'w', encoding='utf-8') as f:
        json.dump(list(products_dict.values()), f, indent=2, ensure_ascii=False)
        
    print(f"Saved {len(products_dict)} products to new_products.json")
    
    print("Processing Images...")
    import_dir = "c:/Website/import_data"
    output_dir = "c:/Website/public/images/products"
    os.makedirs(output_dir, exist_ok=True)
    
    sorted_codes = sorted(list(valid_codes), key=len, reverse=True)
    
    count = 0
    for filename in os.listdir(import_dir):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
            
        input_path = os.path.join(import_dir, filename)
        assigned_code = None
        
        name_no_ext = os.path.splitext(filename)[0].upper()
        if name_no_ext in valid_codes:
            assigned_code = name_no_ext
        else:
            try:
                ocr_text = await get_ocr_text(input_path)
                ocr_upper = ocr_text.upper()
                
                for code in sorted_codes:
                    if re.search(r'\b' + re.escape(code) + r'\b', ocr_upper):
                        assigned_code = code
                        break
                        
                if not assigned_code:
                    ocr_no_space = ocr_upper.replace(" ", "")
                    for code in sorted_codes:
                        if code.replace(" ", "") in ocr_no_space:
                            assigned_code = code
                            break
            except Exception as e:
                print(f"OCR failed for {filename}: {e}")
                
        if assigned_code:
            output_path = os.path.join(output_dir, f"{assigned_code}.png")
            enhance_image(input_path, output_path)
            print(f"[{count}] Saved {filename} as {assigned_code}.png")
            count += 1
        else:
            print(f"Could not identify code for {filename}")

    print("Generating SQL...")
    sql_statements = [
        "DELETE FROM products;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb;"
    ]
    
    for p in products_dict.values():
        code = p['code']
        vars_json = json.dumps(p['variations']).replace("'", "''")
        base_price = p['variations'][0]['price'] if p['variations'] else 0
        prices_json = json.dumps({"EGP": base_price, "USD": 0}).replace("'", "''")
        
        sql = f"INSERT INTO products (code, description, type, image, prices, variations) VALUES ('{code}', 'Product {code}', 'product', '/images/products/{code}.png', '{prices_json}'::jsonb, '{vars_json}'::jsonb);"
        sql_statements.append(sql)

    with open('c:/Website/rebuild_products.sql', 'w', encoding='utf-8') as f:
        f.write("\\n".join(sql_statements))
        
    print("SQL generation complete. Output at c:/Website/rebuild_products.sql")

if __name__ == '__main__':
    asyncio.run(main())
