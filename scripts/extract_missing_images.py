"""Extract images from PDFs only for products that still have no image."""
import json
import os
import re

import fitz

from extract_images_names import (
    BASE,
    IMAGES_DIR,
    assign_page_images,
    page_codes,
    page_images,
    slug,
)

PRODUCTS_PATH = r"c:\Website\src\data\products.json"


def main():
    with open(PRODUCTS_PATH, encoding="utf-8") as f:
        products = json.load(f)

    need = {p["code"] for p in products if not p.get("image")}
    if not need:
        print("All products already have images.")
        return

    code_to_image: dict[str, str] = {}

    for root, _, files in os.walk(BASE):
        for fname in files:
            if not fname.endswith(".pdf"):
                continue
            doc = fitz.open(os.path.join(root, fname))
            for page in doc:
                codes = [c for c in page_codes(page.get_text()) if c in need]
                images = page_images(page)
                assign_page_images(codes, images, code_to_image)
            doc.close()

    added = 0
    for p in products:
        if p.get("image"):
            continue
        img = code_to_image.get(p["code"])
        if img:
            p["image"] = img
            added += 1

    with open(PRODUCTS_PATH, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    with_img = sum(1 for p in products if p.get("image"))
    print(f"Added {added} images from PDFs")
    print(f"Total with images: {with_img} / {len(products)}")


if __name__ == "__main__":
    main()
