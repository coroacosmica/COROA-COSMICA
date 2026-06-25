import json
import pandas as pd
import os
import math

def clean_sql_str(s):
    if not s:
        return ""
    return str(s).replace("'", "''")

def main():
    # Load the 906 original products
    with open(r'c:\Website\src\data\products.json', 'r', encoding='utf-8') as f:
        original_products = json.load(f)

    # Load the mapping to get the new prices
    df = pd.read_csv(r'c:\Website\price_mapping_review.csv')
    
    # Create a dictionary of db_code -> pricing info
    # We keep the highest confidence match for each db_code
    pricing_map = {}
    
    for _, row in df.iterrows():
        db_code = str(row['Matched DB Code']).strip()
        conf = float(row['Match Confidence'])
        egp = float(row['New EGP']) if not pd.isna(row['New EGP']) else 0.0
        eur = float(row['New EUR']) if not pd.isna(row['New EUR']) else 0.0
        disc = int(row['Discount %']) if not pd.isna(row['Discount %']) else 0
        
        # Only use decent matches or keep best
        if db_code not in pricing_map or conf > pricing_map[db_code]['conf']:
            pricing_map[db_code] = {
                'egp': egp,
                'eur': eur,
                'disc': disc,
                'conf': conf
            }

    # Now we build the INSERT statements for the 906 products
    
    # We will split them into chunks of 150
    chunks = [original_products[i:i + 150] for i in range(0, len(original_products), 150)]
    
    for i, chunk in enumerate(chunks):
        part_num = i + 1
        filename = f'c:\\Website\\restore_part{part_num}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- RECOVERY PART {part_num}\n")
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
                
                # Prices
                egp, eur, disc = 0.0, 0.0, 0
                if code in pricing_map:
                    egp = pricing_map[code]['egp']
                    eur = pricing_map[code]['eur']
                    disc = pricing_map[code]['disc']
                
                prices_json = json.dumps({"USD": 0, "EUR": eur, "EGP": egp, "SAR": 0})
                
                # Default is_active = true
                is_active = "true"
                
                names_json = clean_sql_str(json.dumps(p.get('names', {}), ensure_ascii=False))
                
                image = clean_sql_str(p.get('image', ''))
                # Build images array
                images_arr = [p.get('image', '')] if p.get('image') else []
                images_json = clean_sql_str(json.dumps(images_arr))
                
                feat = "true" if p.get('featured') else "false"
                
                # Text Arrays
                tags = p.get('tags', [])
                includes = p.get('includes', [])
                
                tags_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(t)}'" for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
                includes_sql = "ARRAY[" + ",".join([f"'{clean_sql_str(i)}'" for i in includes]) + "]::text[]" if includes else "ARRAY[]::text[]"
                
                values.append(
                    f"('{code}', '{desc}', '{cat}', '{cat_name}', '{catalogue}', '{type_val}', '{prices_json}'::jsonb, 0, {disc}, {is_active}, '{names_json}'::jsonb, '{image}', '{images_json}'::jsonb, {feat}, {tags_sql}, {includes_sql})"
                )
            
            f.write(",\n".join(values))
            f.write(";\n")
            
    print(f"Generated {len(chunks)} recovery SQL files successfully.")

if __name__ == "__main__":
    main()
