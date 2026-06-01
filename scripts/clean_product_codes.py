"""Fix product codes polluted with newlines from PDF extraction."""
import json
import re
from pathlib import Path

PRODUCTS_PATH = Path(r"c:\Website\src\data\products.json")


def normalize_code(code: str) -> str:
    line = code.replace("\r", "\n").split("\n")[0].strip()
    line = re.sub(r"\s+", " ", line)
    return line[:80] if line else "unknown"


def main():
    products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    seen: set[str] = set()
    cleaned = []
    fixed = 0
    dropped = 0

    for p in products:
        old = p["code"]
        new = normalize_code(old)
        if old != new:
            fixed += 1
        key = new.lower()
        if key in seen or len(new) < 2:
            dropped += 1
            continue
        seen.add(key)
        p["code"] = new
        cleaned.append(p)

    PRODUCTS_PATH.write_text(
        json.dumps(cleaned, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Fixed codes: {fixed}")
    print(f"Dropped duplicates/invalid: {dropped}")
    print(f"Total products: {len(cleaned)}")


if __name__ == "__main__":
    main()
