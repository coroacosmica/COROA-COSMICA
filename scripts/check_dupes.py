import re
from collections import Counter

sql = ''
for i in range(1, 7):
    sql += open(f'c:\\Website\\hq_rebuild_part{i}.sql', encoding='utf-8').read()

# Find all image references
imgs = re.findall(r"'/images/products/([^']+)'", sql)
# Find all codes
codes = re.findall(r"\('([^']+)', '([^']*)', '([^']*)', '([^']*)'", sql)

print(f"Total image refs: {len(imgs)}")
print(f"Unique images: {len(set(imgs))}")

# Images used more than once (each product has image twice: once in image, once in images array)
# So count/2 is the real usage
img_counter = Counter(imgs)
dupes = [(img, cnt//2) for img, cnt in img_counter.items() if cnt > 4]  # >4 means used by 3+ products
dupes.sort(key=lambda x: -x[1])

print(f"\nImages used by 3+ products: {len(dupes)}")
for d in dupes[:20]:
    print(f"  {d[0]}: used by {d[1]} products")

# Check for duplicate codes
code_list = [c[0] for c in codes]
code_dupes = [(c, cnt) for c, cnt in Counter(code_list).items() if cnt > 1]
print(f"\nDuplicate codes: {len(code_dupes)}")
for d in code_dupes[:10]:
    print(f"  '{d[0]}': {d[1]}x")
