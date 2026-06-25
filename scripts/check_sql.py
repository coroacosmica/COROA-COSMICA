import re

with open('replace_all_products.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

matches = re.findall(r'"EGP": ([0-9.]+)', sql)
print('Total matches:', len(matches))

non_zero = [m for m in matches if float(m) > 0]
print('Non-zero matches:', len(non_zero))
if len(non_zero) > 0:
    print('Sample non-zero:', non_zero[:5])
