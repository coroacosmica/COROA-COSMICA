import json
import pandas as pd
import math
import re
from difflib import SequenceMatcher
import os

def clean_sql_str(s):
    if not s: return ""
    return str(s).replace("'", "''")

def clean_text(t):
    if not isinstance(t, str): return ""
    t = t.lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return ' '.join(t.split())

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
    # 1. Load catalog source of truth
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
        
    for p in catalog:
        corpus = p.get('code', '') + " " + p.get('description', '')
        names = p.get('names', {})
        if isinstance(names, dict):
            corpus += " " + " ".join(str(v) for v in names.values() if v)
        p['corpus'] = corpus
        p['clean_corpus'] = clean_text(corpus)

    # 2. Read new Excel
    df = pd.read_excel(r'c:\Website\new_price_list.xlsx', header=None)
    
    # Read mapping bridge
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
    
    # Store mappings: catalog_code -> new_prices
    mapped_prices = {}
    
    for i, row in df.iterrows():
        if i < 2: continue
        row_list = list(row)
        
        # In new Excel, col 0 is code, col 1 is description
        code_part = str(row_list[0]).strip() if pd.notna(row_list[0]) else ""
        desc_part = str(row_list[1]).strip() if pd.notna(row_list[1]) else ""
        
        if not code_part and not desc_part:
            continue
        if desc_part.lower() == 'variant / color':
            continue
            
        full_excel_name = f"{code_part} {desc_part}".strip()
        
        # Extract base price from column 3
        base_price = 0.0
        if len(row_list) > 3 and pd.notna(row_list[3]):
            try:
                base_price = float(row_list[3])
            except:
                pass
                
        discount = 0
        m = re.search(r'خصم\s*(\d+)\s*%', full_excel_name)
        if m:
            discount = int(m.group(1))
            full_excel_name = full_excel_name.replace(m.group(0), '').replace('فقط', '').strip()
            
        # Match against mapping bridge
        best_match = None
        best_score = 0
        
        clean_excel = clean_text(full_excel_name)
        
        for m_item in mapping_list:
            score = match_score(clean_excel, m_item['clean_pdf_name'])
            if score > best_score:
                best_score = score
                best_match = m_item['db_code']
                
        if best_match and best_score > 0.6:
            # Found a decent match! Apply pricing rules
            new_egp = round(base_price * 1.10, 2)
            new_eur = round((base_price * 0.0177) * 1.50, 2)
            
            if best_match not in mapped_prices or best_score > mapped_prices[best_match]['score']:
                mapped_prices[best_match] = {
                    'egp': new_egp,
                    'eur': new_eur,
                    'discount': discount,
                    'score': best_score,
                    'excel_name': full_excel_name
                }
                
    # 3. Generate SQL for ALL catalog products
    final_inserts = []
    for p in catalog:
        code = p.get('code', '')
        desc = p.get('description', '')
        cat = p.get('category', 'corporate-sets')
        cat_name = p.get('categoryName', 'Corporate Sets')
        catalogue = p.get('catalogue', '')
        type_val = p.get('type', 'product')
        
        mapping = mapped_prices.get(code)
        if mapping:
            prices_json = json.dumps({
                "USD": 0,
                "EUR": mapping['eur'],
                "EGP": mapping['egp'],
                "SAR": 0
            })
            discount = mapping['discount']
        else:
            prices_json = '{"USD": 0, "EUR": 0.0, "EGP": 0.0, "SAR": 0}'
            discount = 0
            
        names_json = clean_sql_str(json.dumps(p.get('names', {}), ensure_ascii=False))
        image = clean_sql_str(p.get('image', ''))
        images_arr = [p.get('image', '')] if p.get('image') else []
        images_json = clean_sql_str(json.dumps(images_arr))
        
        feat = "true" if p.get('featured') else "false"
        tags = p.get('tags', [])
        includes = p.get('includes', [])
        
        tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
        includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
        
        final_inserts.append(
            f"('{clean_sql_str(code)}', '{clean_sql_str(desc)}', '{clean_sql_str(cat)}', '{clean_sql_str(cat_name)}', '{clean_sql_str(catalogue)}', '{clean_sql_str(type_val)}', '{prices_json}'::jsonb, 0, {discount}, true, '{names_json}'::jsonb, '{image}', '{images_json}'::jsonb, {feat}, {tags_sql}, {includes_sql})"
        )
        
    # 4. Write to files
    chunks = [final_inserts[i:i + 150] for i in range(0, len(final_inserts), 150)]
    for i, chunk in enumerate(chunks):
        part_num = i + 1
        filename = f'c:\\Website\\perfect_rebuild_part{part_num}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- PERFECT REBUILD PART {part_num}\n")
            if part_num == 1:
                f.write("DELETE FROM products;\n\n")
                
            f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(";\n")
            
    print(f"Generated {len(chunks)} perfect rebuild SQL files.")
    print(f"Total products: {len(final_inserts)}")
    print(f"Successfully applied new prices to {len(mapped_prices)} products.")

if __name__ == "__main__":
    main()
