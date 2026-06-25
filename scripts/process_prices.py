import csv
import pandas as pd
import json
import urllib.request
import re

def fetch_exchange_rate():
    try:
        url = 'https://api.exchangerate-api.com/v4/latest/EGP'
        response = urllib.request.urlopen(url)
        data = json.loads(response.read().decode('utf-8'))
        egp_to_eur = data['rates']['EUR']
        print(f"1 EGP = {egp_to_eur} EUR")
        print(f"1 EUR = {1/egp_to_eur} EGP")
        return egp_to_eur
    except Exception as e:
        print(f"Error fetching rate: {e}")
        return 0.0177

def process_csv():
    egp_to_eur = fetch_exchange_rate()
    
    input_csv = "price_list_raw_extracted.csv"
    output_excel = "price_list_updated.xlsx"
    
    all_rows = []
    price_index = -1
    
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if 'Price' in row:
                price_index = row.index('Price')
                row.insert(price_index + 1, "Price EGP (+10%)")
                row.insert(price_index + 2, "Price EUR (+50%)")
                all_rows.append(row)
                continue
            
            # If price_index is not yet found, just append the row
            if price_index == -1:
                all_rows.append(row)
                continue
                
            # Pad row if it's too short
            if len(row) <= price_index:
                row.extend([""] * (price_index - len(row) + 1))
                
            price_str = row[price_index].replace(',', '').strip()
            
            # Check if it's a number
            try:
                if price_str == '':
                    raise ValueError
                price_val = float(price_str)
                new_egp = round(price_val * 1.10, 2)
                # Convert to EUR using exchange rate, then +50%
                new_eur = round((price_val * egp_to_eur) * 1.50, 2)
                
                row.insert(price_index + 1, str(new_egp))
                row.insert(price_index + 2, str(new_eur))
            except ValueError:
                # Not a number, maybe empty or some text
                row.insert(price_index + 1, "")
                row.insert(price_index + 2, "")
                
            all_rows.append(row)
            
    # Write to Excel
    df = pd.DataFrame(all_rows)
    # Remove rows that are entirely empty
    df.dropna(how='all', inplace=True)
    df.to_excel(output_excel, index=False, header=False)
    print(f"Processed file saved to {output_excel}")

if __name__ == "__main__":
    process_csv()
