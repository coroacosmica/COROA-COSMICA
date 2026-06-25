import json
import math
import re

def clean_sql_str(s):
    if not s: return ""
    return str(s).replace("'", "''")

def main():
    # 1. Load original catalog to get VIP products
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    vip_products = [p for p in catalog if 'vip' in p.get('category', '').lower()]
    print(f"Found {len(vip_products)} VIP products in original catalog")
    
    statements = []
    
    # 2. Round up ALL existing prices
    statements.append("""
UPDATE products SET prices = jsonb_set(
  jsonb_set(prices, '{EGP}', to_jsonb(ceil((prices->>'EGP')::numeric))),
  '{EUR}', to_jsonb(ceil((prices->>'EUR')::numeric))
)
WHERE (prices->>'EGP')::numeric > 0 OR (prices->>'EUR')::numeric > 0;
""")
    
    # 3. Add VIP products
    inserts = []
    seen_codes = set()
    for p in vip_products:
        code = p.get('code', '')
        if not code or code in seen_codes:
            continue
        seen_codes.add(code)
        
        desc = p.get('description', '')
        cat = p.get('category', 'vip-sets')
        cat_name = p.get('categoryName', 'VIP Sets')
        catalogue = p.get('catalogue', '')
        type_val = p.get('type', 'product')
        
        # VIP sets don't have prices in the new excel, set to 0
        prices_json = '{"USD": 0, "EUR": 0, "EGP": 0, "SAR": 0}'
        
        names = p.get('names', {})
        names_json = clean_sql_str(json.dumps(names, ensure_ascii=False))
        image = clean_sql_str(p.get('image', ''))
        images_arr = [p.get('image', '')] if p.get('image') else []
        images_json = clean_sql_str(json.dumps(images_arr))
        
        feat = "true" if p.get('featured') else "false"
        tags = p.get('tags', [])
        includes = p.get('includes', [])
        
        tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
        includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
        
        inserts.append(
            f"('{clean_sql_str(code)}', '{clean_sql_str(desc)}', '{clean_sql_str(cat)}', '{clean_sql_str(cat_name)}', '{clean_sql_str(catalogue)}', '{clean_sql_str(type_val)}', '{prices_json}'::jsonb, 0, 0, true, '{names_json}'::jsonb, '{image}', '{images_json}'::jsonb, {feat}, {tags_sql}, {includes_sql})"
        )
    
    with open(r'c:\Website\fix_vip_and_prices.sql', 'w', encoding='utf-8') as f:
        f.write("-- FIX: Round up prices + Add VIP Sets\n\n")
        f.write("-- Step 1: Round up all EGP and EUR prices to nearest integer\n")
        f.write(statements[0])
        f.write("\n\n-- Step 2: Add VIP Sets from original catalog\n")
        f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
        f.write(",\n".join(inserts))
        f.write(";\n")
    
    print(f"Generated fix_vip_and_prices.sql with {len(inserts)} VIP products + price rounding")

if __name__ == "__main__":
    main()
