"""Extract product data from catalogue PDFs."""
import fitz
import os
import re
import json

BASE = r"c:\Users\fares\AppData\Roaming\Cursor\User\workspaceStorage\06e1d00462f7fe92cd2da88838dc6f9b\pdfs"
OUT = r"c:\Website\src\data\products-raw.json"

CATALOGUE_THEMES = {
    "catalogue 2026-4.pdf": {"id": "cat-4", "theme": "notebooks-usb", "name": "Notebooks & USB"},
    "catalogue 2026-5.pdf": {"id": "cat-5", "theme": "tech-gifts", "name": "Tech Gifts"},
    "catalogue 2026-9.pdf": {"id": "cat-9", "theme": "notebooks-premium", "name": "Premium Notebooks"},
    "catalogue 2026 - 2.pdf": {"id": "cat-2", "theme": "vip-sets", "name": "VIP & Premium Sets"},
    "catalogue 2026-3.pdf": {"id": "cat-3", "theme": "cork-eco", "name": "Cork & Eco Gifts"},
    "catalogue 2026-8.pdf": {"id": "cat-8", "theme": "business-gifts", "name": "Business Gifts"},
    "Catalogue 2026 -7.pdf": {"id": "cat-7", "theme": "corporate-sets", "name": "Corporate Sets"},
    "catalogue 2026-11.pdf": {"id": "cat-11", "theme": "promotional", "name": "Promotional Items"},
    "catalogue 2026-10.pdf": {"id": "cat-10", "theme": "accessories", "name": "Accessories"},
    "catalogue 2026-6.pdf": {"id": "cat-6", "theme": "pens-writing", "name": "Pens & Writing"},
    "catalogue 2026-12.pdf": {"id": "cat-12", "theme": "seasonal", "name": "Seasonal & Special"},
}

def extract_codes(text):
    codes = re.findall(r'Code[:\s]*([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)?)', text, re.I)
    return list(dict.fromkeys(c.strip() for c in codes if len(c.strip()) > 2))

def extract_sets(text):
    sets = []
    blocks = re.split(r'Code[:\s]*', text, flags=re.I)
    for block in blocks[1:]:
        lines = block.strip().split('\n')
        if not lines:
            continue
        code = lines[0].strip().split()[0] if lines[0] else ''
        if not code or len(code) < 2:
            continue
        includes = []
        in_set = False
        desc_parts = []
        for line in lines[1:20]:
            line = line.strip()
            if re.match(r'The\s+Set\s+includes', line, re.I):
                in_set = True
                continue
            if in_set and line.startswith('-'):
                includes.append(line.lstrip('- ').strip())
            elif not in_set and line and not line.startswith('Code'):
                desc_parts.append(line)
        sets.append({
            "code": code,
            "description": ' '.join(desc_parts[:3])[:200] if desc_parts else "",
            "includes": includes[:12],
            "type": "set" if includes else "product"
        })
    return sets

all_products = []
seen = set()

for root, _, files in os.walk(BASE):
    for fname in files:
        if not fname.endswith('.pdf'):
            continue
        path = os.path.join(root, fname)
        meta = CATALOGUE_THEMES.get(fname, {"id": "misc", "theme": "general", "name": fname})
        doc = fitz.open(path)
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n"
        doc.close()

        items = extract_sets(full_text)
        codes_only = extract_codes(full_text)

        for item in items:
            key = item["code"].lower()
            if key in seen:
                continue
            seen.add(key)
            all_products.append({
                **item,
                "catalogue": meta["id"],
                "category": meta["theme"],
                "categoryName": meta["name"],
            })

        for code in codes_only:
            key = code.lower()
            if key not in seen:
                seen.add(key)
                all_products.append({
                    "code": code,
                    "description": "",
                    "includes": [],
                    "type": "product",
                    "catalogue": meta["id"],
                    "category": meta["theme"],
                    "categoryName": meta["name"],
                })

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(all_products, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(all_products)} products to {OUT}")
