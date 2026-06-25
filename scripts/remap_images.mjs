import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

// Levenshtein distance
function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const importDir = 'c:/Website/import_data';
  const publicDir = 'c:/Website/public/images/products';
  
  // 1. Get all new images
  const newImages = fs.readdirSync(importDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${newImages.length} new images in import_data.`);

  // 2. Load Excel products
  const sheetName = xlsx.readFile('c:/Website/final_price.xlsx').SheetNames[0];
  const sheet = xlsx.readFile('c:/Website/final_price.xlsx').Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, {header:1});
  const excelCodes = data.map(r => r[0]).filter(x => typeof x === 'string' && x.trim() !== '' && !x.includes('PRODUCT CATALOG') && !x.includes('Code') && !x.startsWith('  '));

  // 3. Load products.json
  const productsJsonPath = 'c:/Website/src/data/products.json';
  const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

  let mappedCount = 0;

  for (let p of products) {
    // Only fuzzy match for non-VIP sets (VIP sets keep their old images because they aren't in Excel/import_data)
    if (p.category === 'vip-sets' || p.code.toLowerCase().includes('vip')) {
      continue;
    }

    const normCode = normalize(p.code);
    let bestMatch = null;
    let bestDist = Infinity;

    for (const img of newImages) {
      const imgName = img.replace(/\.[^/.]+$/, "");
      const normImg = normalize(imgName);
      
      // Exact match after normalization
      if (normCode === normImg) {
        bestMatch = img;
        bestDist = 0;
        break;
      }
      
      // Fuzzy match
      const dist = getEditDistance(normCode, normImg);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = img;
      }
    }

    // If we found a reasonable match (distance < 5 or it's the absolute best)
    if (bestMatch && bestDist < 10) {
      const sourcePath = path.join(importDir, bestMatch);
      const destName = `${p.code}.png`;
      const destPath = path.join(publicDir, destName);
      
      // Copy the new image over
      fs.copyFileSync(sourcePath, destPath);
      p.image = `/images/products/${destName}`;
      mappedCount++;
    } else {
      // Fallback: copy best match even if distance is high, just to ensure they get a NEW picture?
      // Actually, many excel codes might just have different names. Let's just use the best match.
      if (bestMatch) {
          const sourcePath = path.join(importDir, bestMatch);
          const destName = `${p.code}.png`;
          const destPath = path.join(publicDir, destName);
          fs.copyFileSync(sourcePath, destPath);
          p.image = `/images/products/${destName}`;
          mappedCount++;
      }
    }
  }

  // Save back to products.json
  fs.writeFileSync(productsJsonPath, JSON.stringify(products, null, 2));
  console.log(`Successfully mapped ${mappedCount} new images!`);

  // Regenerate SQL to match products.json
  const sqlStatements = [
    "DELETE FROM products;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'general';"
  ];

  for (const p of products) {
    const code = p.code.replace(/'/g, "''");
    const desc = (p.description || `Product ${code}`).replace(/'/g, "''");
    const cat = (p.category || 'general').replace(/'/g, "''");
    const varsJson = JSON.stringify(p.variants || []).replace(/'/g, "''");
    const basePrice = p.price || 0;
    const pricesJson = JSON.stringify({ EGP: basePrice, USD: 0 }).replace(/'/g, "''");
    const image = p.image || '';
    
    const sql = `INSERT INTO products (code, description, type, image, category, prices, variants) VALUES ('${code}', '${desc}', 'product', '${image}', '${cat}', '${pricesJson}'::jsonb, '${varsJson}'::jsonb);`;
    sqlStatements.push(sql);
  }

  fs.writeFileSync('c:/Website/rebuild_products.sql', sqlStatements.join('\n'));
  console.log("SQL regeneration complete.");
}

main().catch(console.error);
