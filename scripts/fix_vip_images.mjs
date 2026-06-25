import fs from 'fs';

async function main() {
  const localJsonPath = 'c:/Website/src/data/products.json';
  const oldGitJsonPath = 'c:/Website/old_products_git.json';
  
  const currentProducts = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
  const oldGitProducts = JSON.parse(fs.readFileSync(oldGitJsonPath, 'utf8'));

  // Create lookup dictionary for old products
  const oldDict = {};
  for (const p of oldGitProducts) {
    oldDict[p.code.toUpperCase()] = p;
  }

  const finalArray = [];
  const handledCodes = new Set();

  for (let p of currentProducts) {
    const codeUpper = p.code.toUpperCase();
    handledCodes.add(codeUpper);

    // Fix image path if it doesn't exist locally
    let imagePath = `/images/products/${p.code}.png`;
    const localPublicPath = `c:/Website/public${imagePath}`;
    
    // Check if the exact generated .png exists
    if (!fs.existsSync(localPublicPath)) {
      // It doesn't exist. Does the old one have an image?
      const oldMatch = oldDict[codeUpper];
      if (oldMatch && oldMatch.image) {
        p.image = oldMatch.image;
      }
    } else {
      p.image = imagePath;
    }

    finalArray.push(p);
  }

  // Now append any missing VIP sets
  let vipCount = 0;
  for (const p of oldGitProducts) {
    const codeUpper = p.code.toUpperCase();
    if (!handledCodes.has(codeUpper)) {
      // Product was deleted! But if it's a VIP set, we should keep it because it was missing from Excel!
      // In old JSON, VIP sets had category 'vip-sets' or description containing 'VIP'
      if (p.category === 'vip-sets' || p.code.toLowerCase().includes('vip')) {
        vipCount++;
        // Ensure it has variants
        if (!p.variants) {
          p.variants = [{ color: "Standard", price: p.price || 0 }];
        }
        finalArray.push(p);
      }
    }
  }

  fs.writeFileSync(localJsonPath, JSON.stringify(finalArray, null, 2));
  console.log(`Updated products.json! Added ${vipCount} missing VIP sets. Total: ${finalArray.length}`);

  // Generate SQL
  const sqlStatements = [
    "DELETE FROM products;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'general';"
  ];

  for (const p of finalArray) {
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
