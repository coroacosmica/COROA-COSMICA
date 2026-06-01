"""Link every product to an image file when a match exists on disk."""
import json
import re
from pathlib import Path

ROOT = Path(r"c:\Website")
PRODUCTS_PATH = ROOT / "src" / "data" / "products.json"
IMAGES_DIR = ROOT / "public" / "images" / "products"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def slug(code: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", code.strip()).strip("-").lower()
    return s[:120] or "product"


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    files = [f for f in IMAGES_DIR.iterdir() if f.suffix.lower() in IMAGE_EXTS]

    by_slug: dict[str, Path] = {}
    by_norm: dict[str, Path] = {}
    for f in files:
        by_slug[f.stem.lower()] = f
        by_norm[norm(f.stem)] = f

    linked = 0
    for p in products:
        if p.get("image"):
            continue
        code = p["code"]
        candidates = [
            slug(code),
            norm(code),
            slug(code.replace(" ", "")),
        ]

        path: Path | None = None
        for c in candidates:
            if c in by_slug:
                path = by_slug[c]
                break
            if c in by_norm:
                path = by_norm[c]
                break

        if not path:
            nc = norm(code)
            if len(nc) >= 5:
                for stem, f in by_slug.items():
                    ns = norm(stem)
                    if nc in ns or ns in nc:
                        path = f
                        break
                if not path:
                    for stem, f in by_slug.items():
                        if stem.startswith(slug(code)[:10]) or slug(code)[:10] in stem:
                            path = f
                            break

        if path:
            p["image"] = f"/images/products/{path.name}"
            linked += 1

    PRODUCTS_PATH.write_text(
        json.dumps(products, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with_img = sum(1 for p in products if p.get("image"))
    print(f"Newly linked: {linked}")
    print(f"Total with images: {with_img} / {len(products)}")


if __name__ == "__main__":
    main()
