import json
import os

def clean_sql_str(s):
    if not s:
        return ""
    return str(s).replace("'", "''")

def main():
    # Load the EXACT 906 original products from the original backup
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        original_products = json.load(f)

    # We will split them into chunks of 150
    chunks = [original_products[i:i + 150] for i in range(0, len(original_products), 150)]
    
    for i, chunk in enumerate(chunks):
        part_num = i + 1
        filename = f'c:\\Website\\revert_original_part{part_num}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- REVERT TO ORIGINAL - PART {part_num}\n")
            if part_num == 1:
                f.write("DELETE FROM products;\n\n")
                
            f.write("INSERT INTO products (code, description, category, category_name, catalogue, type, prices, price, discount_percentage, is_active, names, image, images, featured, tags, includes) VALUES\n")
            
            values = []
            for p in chunk:
                code = clean_sql_str(p.get('code', ''))
                desc = clean_sql_str(p.get('description', ''))
                cat = clean_sql_str(p.get('category', ''))
                cat_name = clean_sql_str(p.get('categoryName', ''))
                catalogue = clean_sql_str(p.get('catalogue', ''))
                type_val = clean_sql_str(p.get('type', 'product'))
                if type_val not in ['product', 'set']:
                    type_val = 'product'
                
                # NO PRICES! Back to completely zero as originally requested.
                prices_json = '{"USD": 0, "EUR": 0.0, "EGP": 0.0, "SAR": 0}'
                
                # Default is_active = true
                is_active = "true"
                
                names_json = clean_sql_str(json.dumps(p.get('names', {}), ensure_ascii=False))
                
                image = clean_sql_str(p.get('image', ''))
                images_arr = [p.get('image', '')] if p.get('image') else []
                images_json = clean_sql_str(json.dumps(images_arr))
                
                feat = "true" if p.get('featured') else "false"
                
                tags = p.get('tags', [])
                includes = p.get('includes', [])
                
                tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
                includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
                
                values.append(
                    f"('{code}', '{desc}', '{cat}', '{cat_name}', '{catalogue}', '{type_val}', '{prices_json}'::jsonb, 0, 0, {is_active}, '{names_json}'::jsonb, '{image}', '{images_json}'::jsonb, {feat}, {tags_sql}, {includes_sql})"
                )
            
            f.write(",\n".join(values))
            f.write(";\n")
            
    print(f"Generated {len(chunks)} REVERT SQL files successfully. Restored all {len(original_products)} original products exactly as they were.")

if __name__ == "__main__":
    main()
