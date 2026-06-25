"""
FINAL rebuild: Use ORIGINAL HQ images from products.json, 
new codes from price_list, new prices from Excel.
Round up all prices. Mark boxes as customizable.
"""
import json
import math
import re
import os
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

    # ── Load original catalog (has HQ images + correct categories) ──
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    catalog_dict = {str(p.get('code', '')).strip(): p for p in catalog if p.get('code')}
    print(f"Loaded {len(catalog)} products from original catalog")

    # ── Load mapping bridge (PDF name → DB code) ──
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
    print(f"Loaded {len(mapping_bridge)} mappings from bridge")

    # ── Read prices from Excel ──
    df = pd.read_excel(r'c:\Website\new_price_list.xlsx', header=None)
    excel_products = []
    
    for i, row in df.iterrows():
        if i < 2: continue
        row_list = list(row)
        code_part = str(row_list[0]).strip() if pd.notna(row_list[0]) else ""
        desc_part = str(row_list[1]).strip() if pd.notna(row_list[1]) else ""
        if not code_part and not desc_part: continue
        if desc_part.lower() == 'variant / color': continue
        
        full_name = f"{code_part} {desc_part}".strip()
        
        # Skip pure numbers or section headers
        try:
            float(full_name.replace(' ', ''))
            continue
        except: pass
        if full_name.startswith('  ') or 'nan' in full_name.lower():
            continue
        
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
        
        # Round UP prices  
        new_egp = math.ceil(base_price * 1.10) if base_price > 0 else 0
        new_eur = math.ceil((base_price * 0.0177) * 1.50) if base_price > 0 else 0
        
        excel_products.append({
            'name': full_name,
            'egp': new_egp,
            'eur': new_eur,
            'discount': discount,
            'base': base_price
        })
    
    print(f"Loaded {len(excel_products)} products from Excel")

    # ── Build final product list ──
    final_products = []
    seen_codes = set()
    matched_with_hq = 0
    no_image = 0
    
    for ep in excel_products:
        name = ep['name']
        if name in seen_codes: continue
        seen_codes.add(name)
        
        # Find best match in mapping bridge to get original catalog product
        clean_name = clean_text(name)
        best_score = 0
        best_db_code = None
        
        for m_item in mapping_bridge:
            s = match_score(clean_name, m_item['clean'])
            if s > best_score:
                best_score = s
                best_db_code = m_item['db_code']
        
        # Get original catalog product info
        cat_product = catalog_dict.get(best_db_code) if best_score > 0.5 else None
        
        if cat_product:
            image = cat_product.get('image', '')
            category = cat_product.get('category', 'corporate-sets')
            category_name = cat_product.get('categoryName', 'Corporate Sets')
            names = cat_product.get('names', {"en": name, "ar": name, "pt": name})
            
            # Check if original image file exists
            img_path = os.path.join(r'c:\Website\public', image.lstrip('/'))
            if os.path.exists(img_path):
                matched_with_hq += 1
            else:
                # Fall back to the low-res extracted image
                fallback = f'/images/products/{slug(name)}.jpeg'
                if os.path.exists(os.path.join(img_dir, f'{slug(name)}.jpeg')):
                    image = fallback
                else:
                    image = '/images/products/product.jpeg'
                    no_image += 1
        else:
            # No match in catalog - use extracted image or placeholder
            fallback = f'/images/products/{slug(name)}.jpeg'
            if os.path.exists(os.path.join(img_dir, f'{slug(name)}.jpeg')):
                image = fallback
            else:
                image = '/images/products/product.jpeg'
                no_image += 1
            category = 'corporate-sets'
            category_name = 'Corporate Sets'
            names = {"en": name, "ar": name, "pt": name}
        
        # Determine if box/customizable
        is_box = any(kw in name.lower() for kw in ['box', 'p box', 'p-box'])
        is_set_no_price = 'set' in name.lower() and ep['egp'] == 0
        
        if is_box or is_set_no_price:
            description = 'Customizable - Price varies by contents'
        else:
            description = name
        
        final_products.append({
            'code': name,
            'description': description,
            'category': category,
            'category_name': category_name,
            'image': image,
            'egp': ep['egp'],
            'eur': ep['eur'],
            'discount': ep['discount'],
            'names': names,
            'type': 'product'
        })
    
    # Add VIP products from original catalog
    vip_count = 0
    for p in catalog:
        if 'vip' not in p.get('category', '').lower():
            continue
        code = p.get('code', '')
        if code in seen_codes: continue
        seen_codes.add(code)
        vip_count += 1
        
        final_products.append({
            'code': code,
            'description': p.get('description', ''),
            'category': p.get('category', 'vip-sets'),
            'category_name': p.get('categoryName', 'VIP & Premium Sets'),
            'image': p.get('image', ''),
            'egp': 0,
            'eur': 0,
            'discount': 0,
            'names': p.get('names', {}),
            'type': p.get('type', 'set'),
            'includes': p.get('includes', []),
            'tags': p.get('tags', []),
            'catalogue': p.get('catalogue', ''),
            'featured': p.get('featured', False)
        })
    
    print(f"\n=== RESULTS ===")
    print(f"Total products: {len(final_products)}")
    print(f"Matched with HQ original images: {matched_with_hq}")
    print(f"Products without images (placeholder): {no_image}")
    print(f"VIP Sets added: {vip_count}")
    print(f"With prices: {len([p for p in final_products if p['egp'] > 0])}")
    print(f"Boxes/Customizable: {len([p for p in final_products if 'Customizable' in p['description']])}")

    # ── Generate SQL ──
    inserts = []
    for p in final_products:
        code = p['code']
        desc = p['description']
        cat = p['category']
        cat_name = p['category_name']
        catalogue = p.get('catalogue', '')
        type_val = p.get('type', 'product')
        image = p['image']
        
        prices_json = json.dumps({"USD": 0, "EUR": p['eur'], "EGP": p['egp'], "SAR": 0})
        names_json = clean_sql_str(json.dumps(p['names'], ensure_ascii=False))
        images_json = clean_sql_str(json.dumps([image]))
        
        feat = "true" if p.get('featured') else "false"
        tags = p.get('tags', [])
        includes = p.get('includes', [])
        tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
        includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
        
        inserts.append(
            f"('{clean_sql_str(code)}', '{clean_sql_str(desc)}', '{clean_sql_str(cat)}', '{clean_sql_str(cat_name)}', '{clean_sql_str(catalogue)}', '{clean_sql_str(type_val)}', '{prices_json}'::jsonb, 0, {p['discount']}, true, '{names_json}'::jsonb, '{clean_sql_str(image)}', '{images_json}'::jsonb, {feat}, {tags_sql}, {includes_sql})"
        )
    
    chunks = [inserts[i:i + 150] for i in range(0, len(inserts), 150)]
    for i, chunk in enumerate(chunks):
        part_num = i + 1
        filename = f'c:\\Website\\hq_rebuild_part{part_num}.sql'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- HQ REBUILD PART {part_num}\n")
            if part_num == 1:
                f.write("DELETE FROM products;\n\n")
            f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(";\n")
    
    print(f"\nGenerated {len(chunks)} SQL files (hq_rebuild_part1.sql to hq_rebuild_part{len(chunks)}.sql)")

if __name__ == "__main__":
    main()
