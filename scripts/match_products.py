import pandas as pd
import json
import math
import re
from difflib import SequenceMatcher
import urllib.request

def get_eur_rate():
    try:
        url = 'https://api.exchangerate-api.com/v4/latest/EGP'
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode('utf-8'))
        return data['rates']['EUR']
    except:
        return 0.019 # Fallback rate if network fails

def clean_text(t):
    if not isinstance(t, str): return ""
    t = t.lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return ' '.join(t.split())

def match_score(a, b):
    a = clean_text(a)
    b = clean_text(b)
    if not a or not b: return 0
    # Jaccard index on words
    words_a = set(a.split())
    words_b = set(b.split())
    if not words_a or not words_b: return 0
    intersection = words_a.intersection(words_b)
    union = words_a.union(words_b)
    jaccard = len(intersection) / len(union)
    
    # Substring match if one is much smaller
    if len(words_a) <= 3 and words_a.issubset(words_b):
        return 0.9 + (jaccard * 0.1)
    if len(words_b) <= 3 and words_b.issubset(words_a):
        return 0.9 + (jaccard * 0.1)
        
    seq_match = SequenceMatcher(None, a, b).ratio()
    return max(jaccard, seq_match)

def main():
    rate = get_eur_rate()
    print(f"EGP to EUR rate: {rate}")
    
    # Load DB products
    with open('db_products_detailed.json', 'r', encoding='utf-8') as f:
        db_products = json.load(f)
        
    for p in db_products:
        # Precompute matching corpus for each product
        corpus = p.get('code', '') + " " + p.get('description', '')
        names = p.get('names', {})
        if isinstance(names, dict):
            corpus += " " + " ".join(str(v) for v in names.values() if v)
        p['corpus'] = corpus
        p['clean_corpus'] = clean_text(corpus)

    df = pd.read_excel('price_list_updated.xlsx', header=None)
    
    results = []
    
    for i, row in df.iterrows():
        row_list = list(row)
        pdf_name = str(row_list[1]) if len(row_list) > 1 else ""
        if pd.isna(row_list[1]) or str(row_list[1]).strip() == "" or str(row_list[1]).strip() == "CODE":
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
                
            # Find best match in DB
            best_match = None
            best_score = 0
            
            # Simple heuristic: exact prefix match on code
            words = pdf_name.split()
            prefix = ""
            if len(words) >= 2:
                prefix = f"{words[0]} {words[1]}"
                
            for p in db_products:
                score = match_score(pdf_name, p['corpus'])
                
                # Check for code prefix exact match
                if prefix and clean_text(p['code']).startswith(clean_text(prefix)):
                    score += 0.5 # massive boost
                elif clean_text(p['code']) in clean_text(pdf_name):
                    score += 0.3
                    
                if score > best_score:
                    best_score = score
                    best_match = p
                    
            if best_match:
                new_egp = round(price * 1.10, 2)
                new_eur = round((price * rate) * 1.50, 2)
                
                results.append({
                    "PDF Name": pdf_name,
                    "Matched DB Code": best_match['code'],
                    "Match Confidence": round(best_score, 2),
                    "Original Price": price,
                    "New EGP": new_egp,
                    "New EUR": new_eur,
                    "Discount %": discount
                })

    res_df = pd.DataFrame(results)
    res_df.to_csv('price_mapping_review.csv', index=False, encoding='utf-8-sig')
    print(f"Generated mapping for {len(results)} products.")

if __name__ == "__main__":
    main()
