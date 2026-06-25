import fs from 'fs';
import xlsx from 'xlsx';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
}

async function main() {
  const excelPath = 'c:/Website/final_price.xlsx';
  
  console.log("Parsing Excel...");
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let productsDict = {};
  let lastCode = null;
  let lastPrice = 0;
  let currentCategory = "general"; // Default category

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    let col0 = row[0] ? row[0].toString().trim() : "";
    let col1 = row[1] ? row[1].toString().trim() : "";
    let col2 = row[2];

    // Check if this row is a Category Header
    // If col0 has text, but col1 and col2 are empty/null
    if (col0 && !col1 && (col2 === undefined || col2 === null || col2 === "")) {
      // It's a category!
      currentCategory = slugify(col0);
      continue;
    }

    let code = col0;
    if (!code) {
      code = lastCode;
    } else {
      lastCode = code;
    }

    if (!code || code.toUpperCase() === 'CODE') continue;

    let variant = col1 || "Standard";
    let priceVal = col2;
    let price = lastPrice;

    if (priceVal !== undefined && priceVal !== null) {
      const parsedPrice = parseFloat(priceVal.toString().replace(/,/g, ''));
      if (!isNaN(parsedPrice)) {
        price = parsedPrice;
        lastPrice = price;
      }
    }

    if (price === 0 && variant === "Standard") continue;

    const codeUpper = code.toUpperCase();

    if (!productsDict[codeUpper]) {
      productsDict[codeUpper] = { code, category: currentCategory, variations: [] };
    }
    
    productsDict[codeUpper].variations.push({ color: variant, price });
  }

  // Load old products to use their images as fallback
  const oldProductsPath = 'c:/Website/src/data/products.json';
  let oldProducts = [];
  try {
    oldProducts = JSON.parse(fs.readFileSync(oldProductsPath, 'utf8'));
  } catch (e) {}
  
  const getOldImage = (code) => {
    const p = oldProducts.find(x => x.code.toLowerCase() === code.toLowerCase());
    return p ? p.image : null;
  };

  console.log("Generating SQL...");
  const sqlStatements = [
    "DELETE FROM products;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'general';"
  ];

  for (const p of Object.values(productsDict)) {
    const code = p.code;
    const cat = p.category;
    const varsJson = JSON.stringify(p.variations).replace(/'/g, "''");
    const basePrice = p.variations.length > 0 ? p.variations[0].price : 0;
    const pricesJson = JSON.stringify({ EGP: basePrice, USD: 0 }).replace(/'/g, "''");
    
    let imagePath = `/images/products/${code}.png`;
    if (!fs.existsSync(`c:/Website/public/images/products/${code}.png`)) {
      const oldImage = getOldImage(code);
      imagePath = oldImage || imagePath;
    }
    
    const sql = `INSERT INTO products (code, description, type, image, category, prices, variants) VALUES ('${code}', 'Product ${code}', 'product', '${imagePath}', '${cat}', '${pricesJson}'::jsonb, '${varsJson}'::jsonb);`;
    sqlStatements.push(sql);
  }

  fs.writeFileSync('c:/Website/rebuild_products.sql', sqlStatements.join('\n'));
  console.log("SQL generation complete. Output at c:/Website/rebuild_products.sql");
}

main().catch(console.error);
