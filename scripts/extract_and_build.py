import fitz
import os
import re
import json
import pandas as pd
from difflib import SequenceMatcher

def clean_sql_str(s):
    if not s: return ""
    return str(s).replace("'", "''")

def clean_text(t):
    if not isinstance(t, str): return ""
    t = t.lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return ' '.join(t.split())

def slug(code):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", str(code).strip()).strip("-").lower()
    return s[:120] or "product"

def match_score(a, b):
    a = clean_text(a)
    b = clean_text(b)
    if not a or not b: return 0
    words_a = set(a.split())
    words_b = set(b.split())
    if not words_a or not words_b: return 0
    
    intersection = words_a.intersection(words_b)
    union = words_a.union(words_b)
    jaccard = len(intersection) / len(union)
    
    if len(words_a) <= 3 and words_a.issubset(words_b):
        return 0.9 + (jaccard * 0.1)
    if len(words_b) <= 3 and words_b.issubset(words_a):
        return 0.9 + (jaccard * 0.1)
        
    seq_match = SequenceMatcher(None, a, b).ratio()
    return max(jaccard, seq_match)

def main():
    img_dir = r'c:\Website\public\images\products'
    os.makedirs(img_dir, exist_ok=True)
    
    # 1. Parse PDF to extract images and link to text codes
    doc = fitz.open(r'c:\Website\price_list.pdf')
    pdf_products = [] # list of dicts: {'code': ..., 'image': ...}
    
    for page_num, page in enumerate(doc):
        d = page.get_text('dict')
        blocks = d['blocks']
        
        text_blocks = []
        for b in blocks:
            if b['type'] == 0:
                lines = b.get('lines', [])
                if lines:
                    spans = lines[0].get('spans', [])
                    if spans:
                        text = spans[0].get('text', '').strip()
                        if text and text.lower() != 'pic' and text.lower() != 'code' and text.lower() != 'variant / color' and not text.startswith('Price'):
                            text_blocks.append({
                                'text': text,
                                'y0': b['bbox'][1],
                                'y1': b['bbox'][3]
                            })
                            
        # Sort text blocks by Y coordinate
        text_blocks = sorted(text_blocks, key=lambda x: x['y0'])
        
        images = page.get_images(full=True)
        img_rects = [b for b in blocks if b['type'] == 1]
        
        # In fitz, page.get_images() might not be ordered the same as blocks.
        # But we can extract images from img_rects using page.get_pixmap(clip=rect)
        # However, that rasterizes. Let's try to match images by index or just use pixmap.
        
        for b in img_rects:
            rect = fitz.Rect(b['bbox'])
            # rasterize the image at high DPI to keep quality
            try:
                pix = page.get_pixmap(clip=rect, matrix=fitz.Matrix(2, 2))
                
                # find closest text block
                img_y0 = b['bbox'][1]
                closest_text = None
                min_diff = 9999
                
                for tb in text_blocks:
                    diff = abs(tb['y0'] - img_y0)
                    if diff < min_diff:
                        min_diff = diff
                        closest_text = tb['text']
                        
                if closest_text and min_diff < 15: # must be roughly on the same line
                    img_slug = slug(closest_text)
                    img_path = os.path.join(img_dir, f"{img_slug}.jpeg")
                    # Save image
                    pix.save(img_path)
                    
                    pdf_products.append({
                        'code': closest_text,
                        'image': f'/images/products/{img_slug}.jpeg'
                    })
            except Exception as e:
                print(f"Failed to extract image on page {page_num}: {e}")

    print(f"Extracted {len(pdf_products)} images linked to codes from PDF.")
    
    # 2. Read new Excel for Prices
    df = pd.read_excel(r'c:\Website\new_price_list.xlsx', header=None)
    excel_prices = {}
    
    for i, row in df.iterrows():
        if i < 2: continue
        row_list = list(row)
        
        code_part = str(row_list[0]).strip() if pd.notna(row_list[0]) else ""
        desc_part = str(row_list[1]).strip() if pd.notna(row_list[1]) else ""
        if not code_part and not desc_part: continue
        if desc_part.lower() == 'variant / color': continue
            
        full_excel_name = f"{code_part} {desc_part}".strip()
        
        base_price = 0.0
        if len(row_list) > 3 and pd.notna(row_list[3]):
            try:
                base_price = float(row_list[3])
            except: pass
            
        discount = 0
        m = re.search(r'خصم\s*(\d+)\s*%', full_excel_name)
        if m:
            discount = int(m.group(1))
            full_excel_name = full_excel_name.replace(m.group(0), '').replace('فقط', '').strip()
            
        new_egp = round(base_price * 1.10, 2)
        new_eur = round((base_price * 0.0177) * 1.50, 2)
        
        excel_prices[full_excel_name] = {
            'egp': new_egp,
            'eur': new_eur,
            'discount': discount
        }

    # 3. Read mapping bridge to get OLD categories
    df_map = pd.read_csv(r'c:\Website\price_mapping_review.csv')
    mapping_list = []
    for _, mr in df_map.iterrows():
        pdf_name = str(mr['PDF Name']).strip()
        db_code = str(mr['Matched DB Code']).strip()
        if pdf_name and db_code:
            mapping_list.append({
                'pdf_name': pdf_name,
                'clean_pdf_name': clean_text(pdf_name),
                'db_code': db_code
            })

    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    catalog_dict = {str(p.get('code')).strip(): p for p in catalog if p.get('code')}

    # 4. Generate SQL products
    final_inserts = []
    seen_codes = set()
    
    for pp in pdf_products:
        code = pp['code']
        if code in seen_codes: continue
        seen_codes.add(code)
        
        image = pp['image']
        
        # Find price
        # Exact match or fuzzy match with excel_prices
        price_info = excel_prices.get(code)
        if not price_info:
            best_score = 0
            for ex_code, info in excel_prices.items():
                s = match_score(code, ex_code)
                if s > best_score:
                    best_score = s
                    price_info = info
            if best_score < 0.6:
                price_info = {'egp': 0.0, 'eur': 0.0, 'discount': 0}
                
        # Find category
        category = 'corporate-sets'
        category_name = 'Corporate Sets'
        
        best_score = 0
        best_db_code = None
        clean_code = clean_text(code)
        for m_item in mapping_list:
            s = match_score(clean_code, m_item['clean_pdf_name'])
            if s > best_score:
                best_score = s
                best_db_code = m_item['db_code']
                
        if best_score > 0.6 and best_db_code in catalog_dict:
            cp = catalog_dict[best_db_code]
            category = cp.get('category', category)
            category_name = cp.get('categoryName', category_name)
            
        prices_json = json.dumps({
            "USD": 0,
            "EUR": price_info['eur'],
            "EGP": price_info['egp'],
            "SAR": 0
        })
        discount = price_info['discount']
        
        names_json = clean_sql_str(json.dumps({
            "en": code,
            "ar": code,
            "pt": code
        }, ensure_ascii=False))
        
        images_json = clean_sql_str(json.dumps([image]))
        
        final_inserts.append(
            f"('{clean_sql_str(code)}', '{clean_sql_str(code)}', '{clean_sql_str(category)}', '{clean_sql_str(category_name)}', '', 'product', '{prices_json}'::jsonb, 0, {discount}, true, '{names_json}'::jsonb, '{clean_sql_str(image)}', '{images_json}'::jsonb, false, ARRAY[]::text[], ARRAY[]::text[])"
        )
        
    chunks = [final_inserts[i:i + 150] for i in range(0, len(final_inserts), 150)]
    for i, chunk in enumerate(chunks):
        part_num = i + 1
        filename = f'c:\\Website\\final_scrape_rebuild_part{part_num}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- FINAL SCRAPE REBUILD PART {part_num}\n")
            if part_num == 1:
                f.write("DELETE FROM products;\n\n")
                
            f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(";\n")
            
    print(f"Generated {len(chunks)} final scrape rebuild SQL files.")
    print(f"Total products inserted: {len(final_inserts)}")

if __name__ == "__main__":
    main()
