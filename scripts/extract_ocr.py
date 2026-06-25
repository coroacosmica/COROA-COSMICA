import re
import json

transcript_path = r'C:\Users\fares\.gemini\antigravity-ide\brain\bb73fc9e-1a29-44af-8253-fdcb7a63a9a5\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    text = f.read()

# find the very last occurrence
idx = text.rfind('==Start of PDF==')
if idx == -1:
    print('No PDF found.')
    exit()

pdf_section = text[idx:]
blocks = re.findall(r'==Start of OCR for page \d+==(.*?)==End of OCR', pdf_section, re.DOTALL)
products = []

for b in blocks:
    # We might have literal \n or escaped \\n depending on if it's raw text or JSON string
    if '\\n' in b and '\n' not in b:
        lines = b.split('\\n')
    else:
        lines = b.split('\n')
        
    for line in lines:
        # replace escaped unicode chars
        if '\\u' in line:
            try:
                line = line.encode('utf-8').decode('unicode_escape')
            except:
                pass
                
        line = line.strip()
        if not line or 'PIC ' in line or 'CODE ' in line or 'Price ' in line or line.startswith('PIC') or line.startswith('CODE') or line.startswith('Price'):
            continue
            
        # extract price
        price_match = re.search(r'([\d,]+\.\d+)$', line)
        price = 0.0
        code = line
        
        if price_match:
            price_str = price_match.group(1).replace(',', '')
            try:
                price = float(price_str)
                code = line[:price_match.start()].strip()
            except ValueError:
                pass
                
        # discount extraction
        discount_match = re.search(r'خصم\s*(\d+)\s*%', code)
        discount = 0
        if discount_match:
            discount = int(discount_match.group(1))
            code = code.replace(discount_match.group(0), '').replace('فقط', '').strip()
            
        if code and price > 0:
            products.append({'pdf_code': code, 'original_price': price, 'discount_percentage': discount})

with open('pdf_extracted_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f'Extracted {len(products)} products from PDF.')
