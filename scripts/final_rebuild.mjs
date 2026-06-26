import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

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

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  const excelPath = 'c:/Website/final_price.xlsx';
  const importDir = 'c:/Website/import_data';
  const publicDir = 'c:/Website/public/images/products';
  
  // 1. Wipe old images to guarantee NO old pictures!
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  const newImages = fs.readdirSync(importDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

  // 2. Parse Excel to get exactly the products and their correct categories
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let newProducts = [];
  let currentCategoryName = "General";
  let currentCategorySlug = "general";
  
  let excelCategories = new Set();
  let categoryNamesMap = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;
    
    // Check if it's a category header
    if (typeof row[0] === 'string' && row[1] == null && row[2] == null && !row[0].includes('Code') && !row[0].includes('PRODUCT CATALOG')) {
      currentCategoryName = row[0].trim();
      currentCategorySlug = slugify(currentCategoryName);
      excelCategories.add(currentCategorySlug);
      categoryNamesMap[currentCategorySlug] = currentCategoryName;
      continue;
    }

    // Otherwise it's a product!
    // But skip headers or empty prices if they aren't products
    if (row[0].includes('Code') || row[0].includes('PRODUCT CATALOG')) continue;

    // Price is usually at row[2]. Sometimes row[1].
    let price = 0;
    if (typeof row[2] === 'number') price = row[2];
    else if (typeof row[1] === 'number') price = row[1];
    
    // Variant color could be in row[1]
    let color = typeof row[1] === 'string' ? row[1] : 'Standard';
    
    let code = row[0].toString().trim();
    let assignCatSlug = currentCategorySlug;
    let assignCatName = currentCategoryName;
    const lowerCode = code.toLowerCase();
    
    if (lowerCode.includes('sets') || lowerCode.includes('set') || lowerCode.includes('boxes') || lowerCode.includes('box')) {
      assignCatSlug = 'vip-sets';
      assignCatName = 'VIP Sets';
      excelCategories.add('vip-sets');
      categoryNamesMap['vip-sets'] = 'VIP Sets';
    } else if (lowerCode.includes('cork')) {
      assignCatSlug = 'cork-eco';
      assignCatName = 'Cork & Eco';
      excelCategories.add('cork-eco');
      categoryNamesMap['cork-eco'] = 'Cork & Eco';
    }
    
    // Does it already exist in newProducts? (for variants)
    let existing = newProducts.find(p => p.code === code);
    if (existing) {
      existing.variants.push({ color, price });
      if (price > 0 && existing.price === 0) existing.price = price;
    } else {
      newProducts.push({
        code,
        description: `Product ${code}`,
        type: 'product',
        category: assignCatSlug,
        categoryName: assignCatName,
        price,
        variants: [{ color, price }]
      });
    }
  }

  // 3. Map Images EXACTLY
  for (let p of newProducts) {
    const normCode = normalize(p.code);
    let bestMatch = null;
    let bestDist = Infinity;

    for (const img of newImages) {
      const imgName = img.replace(/\.[^/.]+$/, "");
      const normImg = normalize(imgName);
      
      if (normCode === normImg) {
        bestMatch = img;
        bestDist = 0;
        break;
      }
      
      const dist = getEditDistance(normCode, normImg);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = img;
      }
    }

    if (bestMatch) {
      const sourcePath = path.join(importDir, bestMatch);
      const destName = `${p.code}.png`;
      const destPath = path.join(publicDir, destName);
      fs.copyFileSync(sourcePath, destPath);
      p.image = `/images/products/${destName}`;
    } else {
      p.image = null; // No image mapped
    }
  }

  // 4. Load GFM Products from db_products_detailed.json
  const oldGitJsonPath = 'c:/Website/db_products_detailed.json';
  let gfmProducts = [];
  if (fs.existsSync(oldGitJsonPath)) {
    const oldProducts = JSON.parse(fs.readFileSync(oldGitJsonPath, 'utf8'));
    gfmProducts = oldProducts.filter(p => p.category && (p.category.toLowerCase().includes('gfm') || p.category === 'uniforms'));
    
    // Ensure price is 0 for GFM products
    gfmProducts = gfmProducts.map(p => ({
      ...p,
      price: 0,
      variants: [],
      image: null // User said "mn8er swr" (without pictures)
    }));
  }

  // Combine NEW products + GFM products
  const finalProducts = [...newProducts, ...gfmProducts];

  // Save to JSON
  const productsJsonPath = 'c:/Website/src/data/products.json';
  fs.writeFileSync(productsJsonPath, JSON.stringify(finalProducts, null, 2));

  // 5. Generate SQL (INCLUDING CATEGORIES!)
  const sqlStatements = [
    "DELETE FROM products;",
    "DELETE FROM categories;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'general';"
  ];

  // Insert Categories
  let orderIndex = 0;
  for (const slug of excelCategories) {
    const name = categoryNamesMap[slug].replace(/'/g, "''");
    sqlStatements.push(`INSERT INTO categories (id, slug, name_en, name_ar, name_pt, order_index) VALUES (${orderIndex}, '${slug}', '${name}', '${name}', '${name}', ${orderIndex});`);
    orderIndex++;
  }
  // We should also insert GFM categories, but the UI handles them via hardcoded products.ts anyway. 
  // Supabase categories is good to have. Let's just insert the GFM ones as well.
  const gfmSlugs = new Set(gfmProducts.map(p => p.category));
  for (const slug of gfmSlugs) {
    if (!slug) continue;
    sqlStatements.push(`INSERT INTO categories (id, slug, name_en, name_ar, name_pt, order_index) VALUES (${orderIndex}, '${slug}', '${slug}', '${slug}', '${slug}', ${orderIndex});`);
    orderIndex++;
  }

  // Insert Products
  for (const p of finalProducts) {
    const code = p.code.replace(/'/g, "''");
    const desc = (p.description || `Product ${code}`).replace(/'/g, "''");
    const cat = (p.category || 'general').replace(/'/g, "''");
    const varsJson = JSON.stringify(p.variants || []).replace(/'/g, "''");
    
    // Build prices
    let pricesObj = p.prices || {};
    if (p.price) pricesObj.EGP = p.price;
    if (Object.keys(pricesObj).length === 0) pricesObj.EGP = 0;
    const pricesJson = JSON.stringify(pricesObj).replace(/'/g, "''");
    
    const image = p.image || '';
    
    const sql = `INSERT INTO products (code, description, type, image, category, prices, variants) VALUES ('${code}', '${desc}', '${p.type || 'product'}', '${image}', '${cat}', '${pricesJson}'::jsonb, '${varsJson}'::jsonb);`;
    sqlStatements.push(sql);
  }

  fs.writeFileSync('c:/Website/rebuild_products.sql', sqlStatements.join('\n'));

  // 6. Rewrite src/lib/products.ts CATEGORY_ORDER!
  const productsTsPath = 'c:/Website/src/lib/products.ts';
  let tsContent = fs.readFileSync(productsTsPath, 'utf8');
  
  // Replace the CATEGORY_ORDER array
  // We want to keep GFM categories. So we just inject our excelCategories at the top, and append the GFM categories manually.
  const gfmBlock = `
  // GFM - Indoor Printing
  "gfm-indoor-printing",
  "gfm-business-cards",
  "gfm-flyers",
  "gfm-brochures",
  "gfm-books",
  "gfm-boxes-bags",
  "gfm-invitation-cards",
  "gfm-certificates",
  // GFM - Events & Conferences
  "gfm-events-conferences",
  "gfm-rollup-banners",
  "gfm-popup-stands",
  "gfm-conference-stands",
  "gfm-feather-flags",
  "gfm-event-flags",
  "gfm-id-cards",
  // GFM - Outdoor Printing
  "gfm-outdoor-printing",
  "gfm-outdoor-signage",
  "gfm-building-facades",
  "gfm-shop-fronts",
  "gfm-billboards",
  "gfm-outdoor-banners",
  "gfm-vehicle-branding",
  "gfm-wayfinding",
  // GFM - Geographic & Office Solutions
  "gfm-geographic-office",
  "gfm-office-signs",
  "gfm-directional-signs",
  "gfm-name-plates",
  "gfm-rubber-stamps",
  "gfm-company-stamps",
  "gfm-custom-seals",
  // Uniforms
  "uniforms",`;

  const newCategoryOrderArray = `const CATEGORY_ORDER = [\n  ${Array.from(excelCategories).map(c => `"${c}"`).join(',\n  ')},${gfmBlock}\n];`;
  
  tsContent = tsContent.replace(/const CATEGORY_ORDER = \[[\s\S]*?\];/, newCategoryOrderArray);
  fs.writeFileSync(productsTsPath, tsContent);

  console.log(`Success! Extracted ${excelCategories.size} categories and ${newProducts.length} new products. Kept ${gfmProducts.length} GFM products.`);
}

main().catch(console.error);
