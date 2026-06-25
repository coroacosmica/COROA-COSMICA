import pandas as pd
import requests
import json
import math
from concurrent.futures import ThreadPoolExecutor

url = "https://pydqqidnbmvycwcsmvmd.supabase.co/rest/v1/products"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHFxaWRuYm12eWN3Y3Ntdm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjYzMzgsImV4cCI6MjA5NjAwMjMzOH0.LH4SCY8W-2W4zQfNoeheXKTJ_7PUxq4IuQEl7vkAAHw"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def update_product(code, new_egp, new_eur):
    payload = {
        "prices": {
            "EGP": new_egp,
            "EUR": new_eur,
            "USD": 0,
            "SAR": 0
        }
    }
    try:
        res = requests.patch(f"{url}?code=eq.{code}", headers=headers, json=payload, timeout=5)
        if res.status_code in [200, 204]:
            return True
        print(f"Error {code}: {res.status_code} {res.text}")
        return False
    except Exception as e:
        print(f"Exception {code}: {e}")
        return False

def upload_prices():
    df = pd.read_excel('price_list_updated.xlsx', header=None)
    
    tasks = []
    
    for i, row in df.iterrows():
        row_list = list(row)
        code_val = row_list[1] if len(row_list) > 1 else None
        
        floats = []
        for cell in row_list:
            try:
                if str(cell).strip() != "":
                    val = float(cell)
                    if not math.isnan(val):
                        floats.append(val)
            except ValueError:
                pass
                
        if len(floats) >= 3 and str(code_val).strip() != "nan" and str(code_val).strip() != "":
            code = str(code_val).strip()
            new_egp = floats[-2]
            new_eur = floats[-1]
            tasks.append((code, new_egp, new_eur))
            
    print(f"Total tasks: {len(tasks)}")
    
    updates_count = 0
    errors_count = 0
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = executor.map(lambda p: update_product(*p), tasks[:10])
        for r in results:
            if r:
                updates_count += 1
            else:
                errors_count += 1

    print(f"Updates successful: {updates_count}")
    print(f"Errors: {errors_count}")

if __name__ == '__main__':
    upload_prices()
