"""Rebuild products.json from raw with safe unique codes (keeps all products)."""
import json
import re
from pathlib import Path

RAW = Path(r"c:\Website\src\data\products-raw.json")
OUT = Path(r"c:\Website\src\data\products.json")

SKIP_PARTS = {"code", "note", "notebook", "size", "the set includes", "-"}


def normalize_code(code: str) -> str:
    parts = [
        p.strip()
        for p in code.replace("\r", "\n").split("\n")
        if p.strip() and p.strip().lower() not in SKIP_PARTS
    ]
    if not parts:
        return "unknown"
    if len(parts) == 1:
        return re.sub(r"\s+", " ", parts[0])[:100]
    base = parts[0]
    extra = "-".join(parts[1:])
    merged = f"{base}-{extra}" if extra else base
    return re.sub(r"\s+", " ", merged).strip("-")[:100]


def main():
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    seen: dict[str, dict] = {}

    for p in raw:
        new_code = normalize_code(p["code"])
        if len(new_code) < 2:
            continue
        key = new_code.lower()
        entry = {**p, "code": new_code}
        if key not in seen:
            seen[key] = entry
            continue
        # keep entry with more data
        old = seen[key]
        if len(entry.get("includes") or []) > len(old.get("includes") or []):
            seen[key] = entry
        elif len(entry.get("description") or "") > len(old.get("description") or ""):
            seen[key] = entry

    products = list(seen.values())
    data = json.dumps(products, ensure_ascii=False, indent=2)
    OUT.write_text(data, encoding="utf-8")
    RAW.write_text(data, encoding="utf-8")
    print(f"Products: {len(products)} (from {len(raw)} raw)")


if __name__ == "__main__":
    main()
