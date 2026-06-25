import json
import re

transcript_path = r"C:\Users\fares\.gemini\antigravity-ide\brain\bb73fc9e-1a29-44af-8253-fdcb7a63a9a5\.system_generated\logs\transcript_full.jsonl"

ocr_blocks = []
current_block = []
in_ocr = False

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'content' in data:
                text = data['content']
                if "==Start of PDF==" in text:
                    # We might have multiple PDFs, we want the last one
                    ocr_blocks.append(text)
        except:
            pass

if not ocr_blocks:
    print("No PDF found in transcript.")
else:
    latest_pdf = ocr_blocks[-1]
    
    products = []
    
    # Simple extraction logic: each page has ==Start of OCR for page X== ... ==End of OCR for page X==
    # The lines inside usually contain: CODE PRICE or CODE
    
    lines = latest_pdf.split('\n')
    for l in lines:
        l = l.strip()
        if not l or l.startswith("==") or "PIC CODE" in l:
            continue
            
        # find the price at the end of the line
        price_match = re.search(r'([\d,]+\.\d)$', l)
        price = 0.0
        code = l
        if price_match:
            price_str = price_match.group(1).replace(',', '')
            price = float(price_str)
            code = l[:price_match.start()].strip()
            
        # check for discount
        discount_match = re.search(r'خصم\s*(\d+)\s*%', l)
        discount = 0
        if discount_match:
            discount = int(discount_match.group(1))
            code = code.replace(discount_match.group(0), "").replace("فقط", "").strip()
            
        if code:
            products.append({"pdf_code": code, "original_price": price, "discount_percentage": discount})
            
    with open('pdf_extracted_products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"Extracted {len(products)} products from PDF OCR.")
