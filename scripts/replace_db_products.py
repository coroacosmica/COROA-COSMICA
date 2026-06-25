import pandas as pd
import json
import math
import re
import urllib.request
import urllib.error

SUPABASE_URL = "https://pydqqidnbmvycwcsmvmd.supabase.co/rest/v1/products"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHFxaWRuYm12eWN3Y3Ntdm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjYzMzgsImV4cCI6MjA5NjAwMjMzOH0.LH4SCY8W-2W4zQfNoeheXKTJ_7PUxq4IuQEl7vkAAHw"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def get_eur_rate():
    try:
        url = 'https://api.exchangerate-api.com/v4/latest/EGP'
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode('utf-8'))
        return data['rates']['EUR']
    except:
        return 0.0177 # Fallback rate if network fails

def delete_all_products():
    print("Deleting existing products...")
    req = urllib.request.Request(f"{SUPABASE_URL}?code=not.is.null", headers=headers, method="DELETE")
    try:
        urllib.request.urlopen(req)
        print("Successfully deleted all products.")
    except urllib.error.HTTPError as e:
        print(f"Error deleting products: {e.read().decode()}")

def insert_products(products):
    print(f"Inserting {len(products)} products...")
    # chunk into 500 max per request
    chunk_size = 500
    for i in range(0, len(products), chunk_size):
        chunk = products[i:i+chunk_size]
        data = json.dumps(chunk).encode('utf-8')
        req = urllib.request.Request(SUPABASE_URL, data=data, headers=headers, method="POST")
        try:
            urllib.request.urlopen(req)
            print(f"Inserted batch {i//chunk_size + 1}")
        except urllib.error.HTTPError as e:
            print(f"Error inserting products: {e.read().decode()}")

def main():
    rate = get_eur_rate()
    print(f"Using EGP to EUR rate: {rate}")

    df = pd.read_excel('price_list_updated.xlsx', header=None)
    
    new_products = []
    
    for i, row in df.iterrows():
        row_list = list(row)
        if len(row_list) < 2: continue
        
        pdf_name = str(row_list[1])
        if pd.isna(row_list[1]) or pdf_name.strip() == "" or pdf_name.strip() == "CODE":
            continue
            
        floats = []
        for cell in row_list:
            try:
                if str(cell).strip() != "":
                    val = float(cell)
                    if not math.isnan(val):
                        floats.append(val)
            except ValueError:
                pass
                
        if len(floats) >= 1:
            price = floats[-1]
            if len(floats) >= 3:
                price = floats[-2] # usually price is 2nd to last, last is SOCIAL MEDIA
                
            discount = 0
            m = re.search(r'خصم\s*(\d+)\s*%', pdf_name)
            if m:
                discount = int(m.group(1))
                pdf_name = pdf_name.replace(m.group(0), '').replace('فقط', '').strip()
                
            new_egp = round(price * 1.10, 2)
            new_eur = round((price * rate) * 1.50, 2)
            
            # create product payload
            product = {
                "code": pdf_name,
                "description": pdf_name,
                "category": "corporate-sets", # Assign all to corporate gifts as requested
                "prices": {
                    "USD": 0,
                    "EUR": new_eur,
                    "EGP": new_egp,
                    "SAR": 0
                },
                "discount_percentage": discount,
                "is_active": True,
                "names": {
                    "en": pdf_name,
                    "ar": pdf_name,
                    "pt": pdf_name
                },
                "image": None,
                "images": []
            }
            new_products.append(product)

    print(f"Parsed {len(new_products)} products from Excel.")
    
    if len(new_products) > 0:
        delete_all_products()
        insert_products(new_products)
        print("Done!")
    else:
        print("No products found to insert.")

if __name__ == "__main__":
    main()
