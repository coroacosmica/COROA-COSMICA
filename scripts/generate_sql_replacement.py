import pandas as pd
import json
import math
import re
import urllib.request
import os

def get_eur_rate():
    try:
        url = 'https://api.exchangerate-api.com/v4/latest/EGP'
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode('utf-8'))
        return data['rates']['EUR']
    except:
        return 0.0177

def main():
    rate = get_eur_rate()
    print(f"Using EGP to EUR rate: {rate}")

    df = pd.read_excel('price_list_updated.xlsx', header=None)
    
    new_products = []
    seen_codes = set()
    
    for i, row in df.iterrows():
        if i < 2:
            continue
            
        row_list = list(row)
        if len(row_list) < 7: continue
        
        pdf_name = str(row_list[1])
        if pd.isna(row_list[1]) or pdf_name.strip() == "" or pdf_name.strip() == "CODE":
            continue
            
        base_price = 0
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
            
        new_egp = round(base_price * 1.10, 2)
        new_eur = round((base_price * rate) * 1.50, 2)
        
        code_key = pdf_name.strip()
        if code_key in seen_codes:
            continue
        seen_codes.add(code_key)
        
        safe_name = pdf_name.replace("'", "''")
        
        prices_json = json.dumps({
            "USD": 0,
            "EUR": new_eur,
            "EGP": new_egp,
            "SAR": 0
        })
        
        names_json = json.dumps({
            "en": pdf_name,
            "ar": pdf_name,
            "pt": pdf_name
        }).replace("'", "''")
        
        new_products.append(f"('{safe_name}', '{safe_name}', 'corporate-sets', '{prices_json}'::jsonb, {discount}, true, '{names_json}'::jsonb, 'product', 0, false, ARRAY[]::text[], ARRAY[]::text[])")

    # Clean up old parts
    for i in range(1, 20):
        fname = f"part{i}_insert.sql"
        if i == 1: fname = "part1_delete_and_insert.sql"
        if os.path.exists(fname):
            os.remove(fname)

    if len(new_products) > 0:
        chunk_size = 150
        part_idx = 1
        for i in range(0, len(new_products), chunk_size):
            chunk = new_products[i:i+chunk_size]
            
            fname = f"part{part_idx}_insert.sql"
            if part_idx == 1:
                fname = "part1_delete_and_insert.sql"
                
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(f"-- RUN THIS FILE PART {part_idx}\n")
                if part_idx == 1:
                    f.write("DELETE FROM products;\n\n")
                    
                f.write("INSERT INTO products (code, description, category, prices, discount_percentage, is_active, names, type, price, featured, tags, includes) VALUES\n")
                f.write(",\n".join(chunk))
                f.write(";\n")
                
            print(f"Generated {fname} with {len(chunk)} products.")
            part_idx += 1
            
        print(f"Total products: {len(new_products)}")
    else:
        print("No products found.")

if __name__ == "__main__":
    main()
