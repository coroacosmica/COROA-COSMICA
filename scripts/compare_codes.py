import fitz
import re
import pandas as pd
import math

def main():
    # 1. Get codes from Excel
    df = pd.read_excel(r'c:\Website\new_price_list.xlsx', header=None)
    excel_codes = []
    for i, row in df.iterrows():
        if i < 2: continue
        row_list = list(row)
        if len(row_list) > 1 and pd.notna(row_list[1]):
            val = str(row_list[1]).strip()
            if val and val.lower() != 'code':
                excel_codes.append(val)
                
    print(f"Total codes in Excel: {len(excel_codes)}")
    
    # 2. Get codes from PDF
    pdf_path = r'c:\Website\price_list.pdf'
    doc = fitz.open(pdf_path)
    
    pdf_codes = set()
    code_re = re.compile(r"(?:Code|Cod)[:\s]*([A-Za-z0-9][A-Za-z0-9\-\s]*[A-Za-z0-9])", re.I)
    code_alt_re = re.compile(r"Code[:\s]*([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)?)", re.I)
    
    for page in doc:
        text = page.get_text()
        for m in code_re.finditer(text):
            c = m.group(1).strip()
            if len(c) > 2 and len(c) < 30:
                pdf_codes.add(c.lower())
        for m in code_alt_re.finditer(text):
            c = m.group(1).strip()
            if len(c) > 2 and len(c) < 30:
                pdf_codes.add(c.lower())
                
    print(f"Total unique codes found in PDF: {len(pdf_codes)}")
    
    # 3. Compare them
    exact_matches = 0
    partial_matches = 0
    unmatched = []
    
    for exc in excel_codes:
        exc_clean = exc.lower()
        if exc_clean in pdf_codes:
            exact_matches += 1
        else:
            # Check for partial match
            found_partial = False
            for pc in pdf_codes:
                if exc_clean in pc or pc in exc_clean:
                    found_partial = True
                    partial_matches += 1
                    break
            if not found_partial:
                unmatched.append(exc)
                
    print(f"\n--- MATCHING RESULTS ---")
    print(f"Exact Matches: {exact_matches}")
    print(f"Partial Matches (substrings): {partial_matches}")
    print(f"Unmatched in Excel: {len(unmatched)}")
    
    if len(unmatched) > 0:
        print("\nSample of Unmatched Excel Codes:")
        for u in unmatched[:10]:
            print(f" - {u}")
            
    if len(pdf_codes) > 0:
        print("\nSample of PDF Codes:")
        for p in list(pdf_codes)[:10]:
            print(f" - {p}")

if __name__ == "__main__":
    main()
