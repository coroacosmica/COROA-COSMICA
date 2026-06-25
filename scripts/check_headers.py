import csv
with open('price_list_raw_extracted.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader):
        if 'Price' in row:
            print(f'Row {i}: Price is at index {row.index("Price")}')
