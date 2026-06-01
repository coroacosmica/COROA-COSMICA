"""Assign a real product image from the same category when no image exists."""
import json
from pathlib import Path

PRODUCTS_PATH = Path(r"c:\Website\src\data\products.json")


def main():
    products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    by_category: dict[str, str] = {}
    for p in products:
        if p.get("image") and p["category"] not in by_category:
            by_category[p["category"]] = p["image"]

    assigned = 0
    for p in products:
        if p.get("image"):
            continue
        fallback = by_category.get(p["category"])
        if fallback:
            p["image"] = fallback
            p["imageFallback"] = True
            assigned += 1

    PRODUCTS_PATH.write_text(
        json.dumps(products, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with_img = sum(1 for p in products if p.get("image"))
    print(f"Category fallback assigned: {assigned}")
    print(f"Total with images: {with_img} / {len(products)}")


if __name__ == "__main__":
    main()
