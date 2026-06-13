import fs from 'fs';
import path from 'path';

const productsPath = path.join(process.cwd(), 'src', 'data', 'products.json');
const productsRaw = fs.readFileSync(productsPath, 'utf8');
const products = JSON.parse(productsRaw);

const gfmProducts = products.filter(p => p.code.startsWith('GFM-'));

let sql = `-- Insert GFM Products into the database\n\n`;

for (const p of gfmProducts) {
  const code = p.code.replace(/'/g, "''");
  const desc = p.description.replace(/'/g, "''");
  const type = p.type || 'product';
  const category = p.category.replace(/'/g, "''");
  const category_name = p.category_name ? `'${p.category_name.replace(/'/g, "''")}'` : 'NULL';
  
  const pgArray = (arr) => {
    if (!arr || arr.length === 0) return "'{}'::text[]";
    const items = arr.map(item => `"${item.replace(/"/g, '\\"')}"`);
    return `'{${items.join(',')}}'::text[]`;
  };

  const image = p.image ? `'${p.image.replace(/'/g, "''")}'` : 'NULL';
  const images = `'${JSON.stringify(p.images || [p.image]).replace(/'/g, "''")}'::jsonb`;
  const featured = p.featured ? 'true' : 'false';
  const names = `'${JSON.stringify(p.names).replace(/'/g, "''")}'::jsonb`;
  const includes = pgArray(p.includes || []);
  const tags = pgArray(p.tags || []);
  const catalogue = p.catalogue ? `'${p.catalogue.replace(/'/g, "''")}'` : "'gfm'";
  const price = p.price ?? 0;
  const prices = `'${JSON.stringify(p.prices || { USD: p.price ?? 0, EUR: 0, EGP: 0, SAR: 0 }).replace(/'/g, "''")}'::jsonb`;

  sql += `
INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  '${code}', '${desc}', '${type}', '${category}', ${category_name}, ${image}, ${images}, ${featured}, ${names}, ${includes}, ${tags}, ${catalogue}, ${price}, ${prices}
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;
`;
}

fs.writeFileSync(path.join(process.cwd(), 'supabase_gfm_products.sql'), sql);
console.log('Generated supabase_gfm_products.sql');
