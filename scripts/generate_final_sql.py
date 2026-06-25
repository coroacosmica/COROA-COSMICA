import json
import pandas as pd
import os
import math
import re

def clean_sql_str(s):
    if not s:
        return ""
    return str(s).replace("'", "''")

def main():
    # 1. Load original products
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        original_products_list = json.load(f)
        
    old_products = {p['code']: p for p in original_products_list if 'code' in p}

    # 2. Load mapping
    df_map = pd.read_csv(r'c:\Website\price_mapping_review.csv')
    mapping = {}
    for _, row in df_map.iterrows():
        excel_code = str(row['PDF Name']).strip()
        old_code = str(row['Matched DB Code']).strip()
        conf = float(row['Match Confidence'])
        # Only use decent matches
        if True:
            if excel_code not in mapping or conf > mapping[excel_code]['conf']:
                mapping[excel_code] = {
                    'old_code': old_code,
                    'conf': conf
                }

    # 3. Process Excel file
    df_excel = pd.read_excel(r'c:\Website\price_list_updated.xlsx', header=None)
    
    final_products = []
    seen_codes = set()
    mapped_old_codes = set()
    
    # Extract prices
    for i, row in df_excel.iterrows():
        if i < 2: continue
        row_list = list(row)
        if len(row_list) < 7: continue
        
        pdf_name = str(row_list[1]).strip()
        if pd.isna(row_list[1]) or pdf_name == "" or pdf_name == "CODE":
            continue
            
        if pdf_name in seen_codes:
            continue
        seen_codes.add(pdf_name)
        
        base_price = 0.0
        try:
            val = float(row_list[6])
            if not math.isnan(val):
                base_price = val
        except:
            pass
            
        discount = 0
        m = re.search(r'خصم\s*(\d+)\s*%', pdf_name)
        if m:
            discount = int(m.group(1))
            pdf_name = pdf_name.replace(m.group(0), '').replace('فقط', '').strip()
            
        # Calculate EGP/EUR
        new_egp = round(base_price * 1.10, 2)
        new_eur = round((base_price * 0.0177) * 1.50, 2)
        
        prices_json = json.dumps({"USD": 0, "EUR": new_eur, "EGP": new_egp, "SAR": 0})
        
        # Look up old product for images/categories
        old_code = mapping.get(pdf_name, {}).get('old_code')
        
        if old_code and old_code in old_products:
            op = old_products[old_code]
            category = clean_sql_str(op.get('category', 'corporate-sets'))
            category_name = clean_sql_str(op.get('categoryName', 'Corporate Sets'))
            catalogue = clean_sql_str(op.get('catalogue', ''))
            image = clean_sql_str(op.get('image', ''))
            images_arr = [op.get('image')] if op.get('image') else []
            images_json = clean_sql_str(json.dumps(images_arr))
            names_json = clean_sql_str(json.dumps(op.get('names', {"en": pdf_name, "ar": pdf_name, "pt": pdf_name}), ensure_ascii=False))
            tags = op.get('tags', [])
            includes = op.get('includes', [])
            mapped_old_codes.add(old_code)
        else:
            category = 'corporate-sets'
            category_name = 'Corporate Sets'
            catalogue = ''
            image = ''
            images_json = '[]'
            names_json = clean_sql_str(json.dumps({"en": pdf_name, "ar": pdf_name, "pt": pdf_name}, ensure_ascii=False))
            tags = []
            includes = []
            
        tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
        includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
        
        code_sql = clean_sql_str(pdf_name)
        
        final_products.append(
            f"('{code_sql}', '{code_sql}', '{category}', '{category_name}', '{catalogue}', 'product', '{prices_json}'::jsonb, 0, {discount}, true, '{names_json}'::jsonb, '{image}', '{images_json}'::jsonb, false, {tags_sql}, {includes_sql})"
        )

    # 4. Add remaining old products that were not matched
    for old_code, op in old_products.items():
        if old_code not in mapped_old_codes and old_code not in seen_codes:
            seen_codes.add(old_code)
            
            code_sql = clean_sql_str(old_code)
            desc_sql = clean_sql_str(op.get('description', old_code))
            category = clean_sql_str(op.get('category', 'corporate-sets'))
            category_name = clean_sql_str(op.get('categoryName', 'Corporate Sets'))
            catalogue = clean_sql_str(op.get('catalogue', ''))
            image = clean_sql_str(op.get('image', ''))
            images_arr = [op.get('image')] if op.get('image') else []
            images_json = clean_sql_str(json.dumps(images_arr))
            names_json = clean_sql_str(json.dumps(op.get('names', {"en": old_code, "ar": old_code, "pt": old_code}), ensure_ascii=False))
            tags = op.get('tags', [])
            includes = op.get('includes', [])
            
            tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
            includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
            
            prices_json = '{"USD": 0, "EUR": 0.0, "EGP": 0.0, "SAR": 0}'
            
            final_products.append(
                f"('{code_sql}', '{desc_sql}', '{category}', '{category_name}', '{catalogue}', 'product', '{prices_json}'::jsonb, 0, 0, true, '{names_json}'::jsonb, '{image}', '{images_json}'::jsonb, false, {tags_sql}, {includes_sql})"
            )

    # 5. Write SQL chunks
    chunks = [final_products[i:i + 150] for i in range(0, len(final_products), 150)]
    
    for i, chunk in enumerate(chunks):
        part_num = i + 1
        filename = f'c:\\Website\\final_part{part_num}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- FINAL COMPLETE PART {part_num}\n")
            if part_num == 1:
                f.write("DELETE FROM products;\n\n")
                
            f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(";\n")
            
    print(f"Successfully generated {len(chunks)} final SQL files. Total products: {len(final_products)}")

if __name__ == "__main__":
    main()
