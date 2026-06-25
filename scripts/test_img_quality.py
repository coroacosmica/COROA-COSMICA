import fitz
doc = fitz.open('price_list.pdf')

# Check all unique image sizes
sizes = []
for page in doc:
    for img in page.get_images(full=True):
        xref = img[0]
        base_img = doc.extract_image(xref)
        sizes.append((base_img["width"], base_img["height"], len(base_img["image"])))

print(f'Total images: {len(sizes)}')
avg_w = sum(s[0] for s in sizes) / len(sizes)
avg_h = sum(s[1] for s in sizes) / len(sizes)
max_w = max(s[0] for s in sizes)
max_h = max(s[1] for s in sizes)
min_w = min(s[0] for s in sizes)
min_h = min(s[1] for s in sizes)
print(f'Avg: {avg_w:.0f}x{avg_h:.0f}')
print(f'Max: {max_w}x{max_h}')
print(f'Min: {min_w}x{min_h}')

# Now check catalogue.pdf
doc2 = fitz.open('catalogue.pdf')
sizes2 = []
for page in doc2:
    for img in page.get_images(full=True):
        xref = img[0]
        try:
            base_img = doc2.extract_image(xref)
            sizes2.append((base_img["width"], base_img["height"], len(base_img["image"])))
        except:
            pass

print(f'\nCatalogue images: {len(sizes2)}')
if sizes2:
    avg_w2 = sum(s[0] for s in sizes2) / len(sizes2)
    avg_h2 = sum(s[1] for s in sizes2) / len(sizes2)
    max_w2 = max(s[0] for s in sizes2)
    max_h2 = max(s[1] for s in sizes2)
    print(f'Avg: {avg_w2:.0f}x{avg_h2:.0f}')
    print(f'Max: {max_w2}x{max_h2}')
