"""
FINAL v3: Use price_list.pdf images (each product gets ITS OWN image).
When a product matches an old catalog product AND it's the only one using that image, use the HQ original.
Otherwise, use the price_list extracted image.
Round up prices. Boxes = customizable. Add VIP sets.
"""
import fitz
import json
import math
import re
import os
import pandas as pd
from difflib import SequenceMatcher
from collections import Counter

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
    
    # ── STEP 1: Extract images from price_list.pdf with proper names ──
    print("Step 1: Extracting images from price_list.pdf (each product gets its own image)...")
    pl_doc = fitz.open(r'c:\Website\price_list.pdf')
    
    pdf_products = []  # {name, image_path, page}
    
    for page_num, page in enumerate(pl_doc):
        d = page.get_text('dict')
        blocks = d['blocks']
        
        # Separate text and image blocks
        text_blocks = []
        img_blocks = []
        
        for b in blocks:
            if b['type'] == 0:
                lines = b.get('lines', [])
                if lines:
                    full_text = ''
                    for line in lines:
                        for span in line.get('spans', []):
                            full_text += span.get('text', '')
                    full_text = full_text.strip()
                    if full_text and len(full_text) > 1:
                        if full_text.lower() in ['pic', 'code', 'variant / color', 'price']:
                            continue
                        if full_text.startswith('Price') or full_text.startswith('CODE'):
                            continue
                        try:
                            float(full_text)
                            continue
                        except: pass
                        text_blocks.append({
                            'text': full_text,
                            'y': b['bbox'][1],
                            'x': b['bbox'][0]
                        })
            elif b['type'] == 1:
                img_blocks.append({
                    'bbox': b['bbox'],
                    'y': b['bbox'][1],
                    'x': b['bbox'][0]
                })
        
        # Sort by Y
        text_blocks.sort(key=lambda x: x['y'])
        img_blocks.sort(key=lambda x: x['y'])
        
        # Match each image to nearest text
        for ib in img_blocks:
            rect = fitz.Rect(ib['bbox'])
            img_y = ib['y']
            
            closest = None
            min_diff = 9999
            for tb in text_blocks:
                diff = abs(tb['y'] - img_y)
                if diff < min_diff:
                    min_diff = diff
                    closest = tb
            
            if closest and min_diff < 20:
                name = closest['text']
                img_slug = slug(name)
                img_path = os.path.join(img_dir, f"{img_slug}.jpeg")
                
                # Extract image at 3x resolution for better quality
                try:
                    pix = page.get_pixmap(clip=rect, matrix=fitz.Matrix(3, 3))
                    pix.save(img_path)
                    
                    pdf_products.append({
                        'name': name,
                        'image': f'/images/products/{img_slug}.jpeg',
                        'page': page_num
                    })
                except:
                    pass
    
    print(f"  Extracted {len(pdf_products)} product images from price_list.pdf")
    
    # ── STEP 2: Load prices from Excel ──
    print("Step 2: Reading prices...")
    df = pd.read_excel(r'c:\Website\new_price_list.xlsx', header=None)
    excel_prices = {}
    
    for i, row in df.iterrows():
        if i < 2: continue
        row_list = list(row)
        code_part = str(row_list[0]).strip() if pd.notna(row_list[0]) else ""
        desc_part = str(row_list[1]).strip() if pd.notna(row_list[1]) else ""
        if not code_part and not desc_part: continue
        if desc_part.lower() == 'variant / color': continue
        
        full_name = f"{code_part} {desc_part}".strip()
        try:
            float(full_name.replace(' ', ''))
            continue
        except: pass
        
        base_price = 0.0
        for col in [4, 3]:
            if len(row_list) > col and pd.notna(row_list[col]):
                try:
                    val = float(row_list[col])
                    if val > 0:
                        base_price = val
                        break
                except: pass
        
        discount = 0
        m = re.search(r'خصم\s*(\d+)\s*%', full_name)
        if m:
            discount = int(m.group(1))
            full_name = full_name.replace(m.group(0), '').replace('فقط', '').strip()
        
        new_egp = math.ceil(base_price * 1.10) if base_price > 0 else 0
        new_eur = math.ceil((base_price * 0.0177) * 1.50) if base_price > 0 else 0
        
        excel_prices[full_name] = {'egp': new_egp, 'eur': new_eur, 'discount': discount}
    
    print(f"  {len(excel_prices)} prices loaded")
    
    # ── STEP 3: Load categories from mapping bridge ──
    print("Step 3: Loading categories...")
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    catalog_dict = {str(p.get('code', '')).strip(): p for p in catalog if p.get('code')}
    
    df_map = pd.read_csv(r'c:\Website\price_mapping_review.csv')
    mapping_bridge = []
    for _, mr in df_map.iterrows():
        pdf_name = str(mr['PDF Name']).strip()
        db_code = str(mr['Matched DB Code']).strip()
        if pdf_name and db_code and db_code in catalog_dict:
            mapping_bridge.append({
                'pdf_name': pdf_name,
                'clean': clean_text(pdf_name),
                'db_code': db_code
            })
    
    # ── STEP 4: Build final product list ──
    print("Step 4: Building products...")
    final_products = []
    seen = set()
    
    for pp in pdf_products:
        name = pp['name']
        if name in seen: continue
        seen.add(name)
        
        # Find price
        price_info = excel_prices.get(name)
        if not price_info:
            best_s = 0
            for ex_name, info in excel_prices.items():
                s = match_score(name, ex_name)
                if s > best_s:
                    best_s = s
                    price_info = info
            if best_s < 0.5:
                price_info = {'egp': 0, 'eur': 0, 'discount': 0}
        
        # Find category
        category = 'corporate-sets'
        category_name = 'Corporate Sets'
        names = {"en": name, "ar": name, "pt": name}
        
        clean_name = clean_text(name)
        best_s = 0
        best_db = None
        for m_item in mapping_bridge:
            s = match_score(clean_name, m_item['clean'])
            if s > best_s:
                best_s = s
                best_db = m_item['db_code']
        
        if best_s > 0.5 and best_db in catalog_dict:
            cp = catalog_dict[best_db]
            category = cp.get('category', category)
            category_name = cp.get('categoryName', category_name)
            names = cp.get('names', names)
        
        is_box = any(kw in name.lower() for kw in ['box', 'p box', 'p-box'])
        is_set_no_price = 'set' in name.lower() and price_info['egp'] == 0
        
        final_products.append({
            'code': name,
            'description': 'Customizable - Price varies by contents' if (is_box or is_set_no_price) else name,
            'category': category,
            'category_name': category_name,
            'image': pp['image'],  # EACH product gets its OWN extracted image!
            'egp': price_info['egp'],
            'eur': price_info['eur'],
            'discount': price_info['discount'],
            'names': names,
            'type': 'product'
        })
    
    # Add VIP sets
    vip_count = 0
    for p in catalog:
        if 'vip' not in p.get('category', '').lower(): continue
        code = p.get('code', '')
        if code in seen: continue
        seen.add(code)
        vip_count += 1
        final_products.append({
            'code': code,
            'description': p.get('description', ''),
            'category': p.get('category', 'vip-sets'),
            'category_name': p.get('categoryName', 'VIP & Premium Sets'),
            'image': p.get('image', ''),
            'egp': 0, 'eur': 0, 'discount': 0,
            'names': p.get('names', {}),
            'type': p.get('type', 'set'),
            'includes': p.get('includes', []),
            'tags': p.get('tags', []),
            'catalogue': p.get('catalogue', ''),
            'featured': p.get('featured', False)
        })
    
    # Check uniqueness
    img_counter = Counter([p['image'] for p in final_products])
    unique_imgs = len([i for i, c in img_counter.items() if c == 1])
    
    print(f"\n=== RESULTS ===")
    print(f"Total: {len(final_products)}")
    print(f"Unique images: {unique_imgs}/{len(final_products)}")
    print(f"With prices: {len([p for p in final_products if p['egp'] > 0])}")
    print(f"VIP: {vip_count}")
    
    # ── Generate SQL ──
    inserts = []
    for p in final_products:
        prices_json = json.dumps({"USD": 0, "EUR": p['eur'], "EGP": p['egp'], "SAR": 0})
        names_json = clean_sql_str(json.dumps(p['names'], ensure_ascii=False))
        images_json = clean_sql_str(json.dumps([p['image']]))
        feat = "true" if p.get('featured') else "false"
        tags = p.get('tags', [])
        includes = p.get('includes', [])
        tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
        includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
        
        inserts.append(
            f"('{clean_sql_str(p['code'])}', '{clean_sql_str(p['description'])}', '{clean_sql_str(p['category'])}', '{clean_sql_str(p['category_name'])}', '{clean_sql_str(p.get('catalogue',''))}', '{clean_sql_str(p['type'])}', '{prices_json}'::jsonb, 0, {p['discount']}, true, '{names_json}'::jsonb, '{clean_sql_str(p['image'])}', '{images_json}'::jsonb, {feat}, {tags_sql}, {includes_sql})"
        )
    
    chunks = [inserts[i:i+150] for i in range(0, len(inserts), 150)]
    for i, chunk in enumerate(chunks):
        pn = i + 1
        fn = f'c:\\Website\\v3_rebuild_part{pn}.sql'
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(f"-- V3 REBUILD PART {pn}\n")
            if pn == 1:
                f.write("DELETE FROM products;\n\n")
            f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(";\n")
    
    print(f"\nGenerated {len(chunks)} SQL files (v3_rebuild_part1.sql to v3_rebuild_part{len(chunks)}.sql)")

if __name__ == "__main__":
    main()
