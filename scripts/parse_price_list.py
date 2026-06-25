import json
import os
import re
import csv

transcript_path = r"C:\Users\fares\.gemini\antigravity-ide\brain\bb73fc9e-1a29-44af-8253-fdcb7a63a9a5\.system_generated\logs\transcript_full.jsonl"
output_csv = r"c:\Website\price_list_updated.csv"
exchange_rate_egp_to_eur = 0.0177

def extract_ocr_text():
    ocr_text = ""
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '==Start of PDF==' in line:
                start_idx = line.find('==Start of PDF==')
                end_idx = line.find('==End of PDF==', start_idx)
                if end_idx != -1:
                    ocr_text = line[start_idx:end_idx]
                else:
                    ocr_text = line[start_idx:]
                break
    return ocr_text

def parse_and_process():
    ocr_text = extract_ocr_text()
    # Decode escaped newlines because the line is JSON encoded
    ocr_text = ocr_text.replace('\\n', '\n')
    
    if not ocr_text:
        print("No OCR text found.")
        return

    # Process page by page
    pages = ocr_text.split('==Start of OCR for page')
    
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Code/Description', 'Original Price (EGP)', 'New Price (+10%) (EGP)', 'Price in EUR (+50%)'])
        
        for page in pages[1:]:
            end_marker = '==End of OCR for page'
            end_idx = page.find(end_marker)
            if end_idx == -1: continue
            
            page_content = page[:end_idx]
            lines = page_content.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith('PIC') or line.startswith('==') or line.startswith('MEDIA'):
                    continue
                
                tokens = line.split()
                if len(tokens) >= 5:
                    try:
                        price = float(tokens[-2])
                        if price > 0:
                            desc = " ".join(tokens[:-2])
                            new_egp = round(price * 1.10, 2)
                            new_eur = round((price * exchange_rate_egp_to_eur) * 1.50, 2)
                            writer.writerow([desc, price, new_egp, new_eur])
                    except ValueError:
                        pass

if __name__ == '__main__':
    parse_and_process()
    print(f"Done. Saved to {output_csv}")
