const fs = require('fs');
const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const sql = ['DELETE FROM products;'];

for (const p of products) {
  const code = p.code;
  const desc = p.description ? p.description.replace(/'/g, "''") : '';
  const type = p.type || 'product';
  const category = p.category || 'general';
  const category_name = p.category_name ? p.category_name.replace(/'/g, "''") : '';
  const image = p.image || '';
  
  const toPgArray = (arr) => {
    if (!arr || arr.length === 0) return "'{}'";
    const escaped = arr.map(s => '"' + s.replace(/"/g, '""').replace(/'/g, "''") + '"');
    return `'{${escaped.join(',')}}'`;
  };

  const imagesPg = toPgArray(p.images);
  const includesPg = toPgArray(p.includes);
  const tagsPg = toPgArray(p.tags);
  const featured = p.featured ? 'true' : 'false';
  const namesJson = JSON.stringify(p.names || {}).replace(/'/g, "''");
  const catalogue = p.catalogue || '';
  const isActive = p.is_active !== false ? 'true' : 'false';
  const price = p.price || 0;
  const pricesJson = JSON.stringify(p.prices || {}).replace(/'/g, "''");
  const variantsJson = JSON.stringify(p.variants || []).replace(/'/g, "''");
  
  sql.push(`INSERT INTO products (code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, is_active, price, prices, variants) VALUES ('${code}', '${desc}', '${type}', '${category}', '${category_name}', '${image}', ${imagesPg}, ${featured}, '${namesJson}'::jsonb, ${includesPg}, ${tagsPg}, '${catalogue}', ${isActive}, ${price}, '${pricesJson}'::jsonb, '${variantsJson}'::jsonb);`);
}

fs.writeFileSync('update_dashboard.sql', sql.join('\n'));
console.log('Generated update_dashboard.sql successfully!');
