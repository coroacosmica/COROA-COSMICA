import pdfplumber
import pandas as pd
import json
import urllib.request

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
        return 0.0177 # Fallback rate

def process_pdf():
    pdf_path = "price_list.pdf"
    csv_path = "price_list_updated.csv"
    excel_path = "price_list_updated.xlsx"
    
    egp_to_eur = fetch_exchange_rate()
    
    all_data = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            # Skip the first few pages if they don't contain the actual price list
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    # Clean the row
                    cleaned_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                    
                    # We are looking for rows that have a Price column. 
                    # The price is usually in the second to last or last column before SOCIAL MEDIA.
                    # Based on the OCR, headers were: PIC, CODE, عبده, الفرىع, السكة, QTY, Price, SOCIAL MEDIA
                    
                    if len(cleaned_row) >= 5:
                        all_data.append(cleaned_row)

    # Let's save the raw data to see what it looks like
    df = pd.DataFrame(all_data)
    df.to_csv("price_list_raw_extracted.csv", index=False)
    print(f"Raw data extracted: {len(all_data)} rows. Check price_list_raw_extracted.csv")

if __name__ == "__main__":
    process_pdf()
