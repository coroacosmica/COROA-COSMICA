"""Extract product images from PDFs and generate friendly names (PT/EN/AR)."""
import fitz
import os
import re
import json
from pathlib import Path

BASE = r"c:\Users\fares\AppData\Roaming\Cursor\User\workspaceStorage\06e1d00462f7fe92cd2da88838dc6f9b\pdfs"
PRODUCTS_IN = r"c:\Website\src\data\products.json"
PRODUCTS_OUT = r"c:\Website\src\data\products.json"
IMAGES_DIR = r"c:\Website\public\images\products"

CODE_RE = re.compile(
    r"(?:Code|Cod)[:\s]*([A-Za-z0-9][A-Za-z0-9\-\s]*[A-Za-z0-9])",
    re.I,
)
CODE_RE_ALT = re.compile(
    r"Code[:\s]*([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)?)",
    re.I,
)
MIN_IMAGE_AREA = 25_000


def slug(code: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", code.strip()).strip("-").lower()
    return s[:120] or "product"


def clean_desc(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > 100 or re.search(r"[\u0400-\u4fff\u0600-\u06ff]{3}", text):
        return ""
    return text


def extract_title_near_code(page_text: str, code: str) -> str:
    idx = page_text.lower().find(code.lower())
    if idx < 0:
        return ""
    before = page_text[:idx].strip().split("\n")
    candidates = []
    for line in reversed(before[-8:]):
        line = line.strip()
        if not line or re.match(r"^(Code|Cod|Size|The Set)", line, re.I):
            continue
        if re.match(r"^[A-Za-z0-9\-]{3,}$", line) and "-" in line:
            continue
        if len(line) > 3:
            candidates.append(line)
    return clean_desc(candidates[0]) if candidates else ""


def page_codes(text: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for pattern in (CODE_RE, CODE_RE_ALT):
        for raw in pattern.findall(text):
            code = raw.strip().split("\n")[0].strip()
            if len(code) < 3 or code.lower() in seen:
                continue
            seen.add(code.lower())
            found.append(code)
    return found


def friendly_names(code: str, desc: str, category: str, includes: list) -> dict:
    c = code.lower().replace(" ", "-")
    d = (desc or "").lower()
    n = len(includes)

    def pack(pt, en, ar):
        return {"pt": pt, "en": en, "ar": ar}

    if category == "vip-sets" or "vip" in c or c.startswith("premium"):
        if "power" in c:
            return pack(
                "Conjunto VIP com power bank e acessórios",
                "VIP gift set with power bank & accessories",
                "مجموعة VIP مع باور بانك وإكسسوارات",
            )
        if "premium" in c:
            return pack(
                f"Conjunto premium corporativo ({n} peças)" if n else "Conjunto premium corporativo",
                f"Premium corporate gift set ({n} items)" if n else "Premium corporate gift set",
                f"مجموعة هدايا فاخرة ({n} قطع)" if n else "مجموعة هدايا فاخرة",
            )
        if "buss" in c or "business" in c:
            return pack(
                "Conjunto de negócios para empresas",
                "Business corporate gift set",
                "مجموعة هدايا أعمال للشركات",
            )
        return pack(
            f"Conjunto VIP de presentes ({n} peças)" if n else "Conjunto VIP de presentes",
            f"VIP corporate gift set ({n} items)" if n else "VIP corporate gift set",
            f"مجموعة VIP هدايا شركات ({n} قطع)" if n else "مجموعة VIP هدايا شركات",
        )

    if category == "cork-eco" or "cork" in c or "cortica" in d:
        return pack(
            "Produto em cortiça portuguesa",
            "Portuguese cork gift item",
            "منتج فلين برتغالي",
        )

    if "notebook" in c or "nb-" in c or category.startswith("notebook"):
        return pack(
            "Caderno corporativo premium",
            "Premium corporate notebook",
            "دفتر شركات فاخر",
        )

    if category == "tech-gifts" or "usb" in c or "power" in c:
        return pack(
            "Brinde tecnológico",
            "Tech promotional gift",
            "هدية تقنية دعائية",
        )

    if "pen" in c or category == "pens-writing":
        return pack(
            "Caneta promocional",
            "Promotional pen",
            "قلم دعائي",
        )

    if desc and len(desc) > 4:
        simple = desc[:70]
        return pack(simple, simple, simple)

    readable = re.sub(r"[-_]+", " ", code).title()
    return pack(
        f"Brinde {readable}",
        f"Promotional gift — {readable}",
        f"هدية دعائية — {readable}",
    )


def page_images(page) -> list[dict]:
    imgs: list[tuple[int, dict]] = []
    for img in page.get_images(full=True):
        xref = img[0]
        try:
            info = page.parent.extract_image(xref)
            area = info.get("width", 0) * info.get("height", 0)
            if area >= MIN_IMAGE_AREA:
                imgs.append((area, info))
        except Exception:
            continue
    imgs.sort(key=lambda x: -x[0])
    return [info for _, info in imgs]


def save_image(info: dict, code: str) -> str:
    ext = info.get("ext", "jpeg")
    if ext == "jpg":
        ext = "jpeg"
    out_name = f"{slug(code)}.{ext}"
    out_path = os.path.join(IMAGES_DIR, out_name)
    with open(out_path, "wb") as imgf:
        imgf.write(info["image"])
    return f"/images/products/{out_name}"


def assign_page_images(codes: list[str], images: list[dict], code_to_image: dict) -> None:
    if not codes or not images:
        return
    if len(images) == 1:
        for code in codes:
            if code not in code_to_image:
                code_to_image[code] = save_image(images[0], code)
        return
    for i, code in enumerate(codes):
        if code in code_to_image:
            continue
        img = images[min(i, len(images) - 1)]
        code_to_image[code] = save_image(img, code)


def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    with open(PRODUCTS_IN, encoding="utf-8") as f:
        products = json.load(f)

    code_to_image: dict[str, str] = {}
    code_to_page_desc: dict[str, str] = {}

    for root, _, files in os.walk(BASE):
        for fname in files:
            if not fname.endswith(".pdf"):
                continue
            path = os.path.join(root, fname)
            doc = fitz.open(path)
            for page in doc:
                text = page.get_text()
                codes = page_codes(text)
                images = page_images(page)
                page_desc = ""

                for code in codes:
                    if not page_desc:
                        page_desc = extract_title_near_code(text, code)
                    code_to_page_desc.setdefault(code, page_desc)

                assign_page_images(codes, images, code_to_image)
            doc.close()

    enriched = []
    images_count = 0
    for p in products:
        code = p["code"]
        desc = clean_desc(p.get("description") or code_to_page_desc.get(code, ""))
        names = friendly_names(code, desc, p.get("category", ""), p.get("includes", []))
        image = code_to_image.get(code)
        if image:
            images_count += 1
        enriched.append(
            {**p, "description": desc or p.get("description", ""), "names": names, "image": image}
        )

    with open(PRODUCTS_OUT, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(enriched)} products, {images_count} with images from PDFs")
    print(f"Images dir: {IMAGES_DIR}")


if __name__ == "__main__":
    main()
