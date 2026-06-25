import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

async function main() {
  const excelPath = 'c:/Website/final_price.xlsx';
  const importDir = 'c:/Website/import_data';
  const outputDir = 'c:/Website/public/images/products';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Parse Excel
  console.log("Parsing Excel...");
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let validCodes = new Set();
  let productsDict = {};
  
  let lastCode = null;
  let lastPrice = 0;

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    let code = row[0];
    
    if (!code) {
      code = lastCode;
    } else {
      code = code.toString().trim();
      lastCode = code;
    }

    if (!code || code.toUpperCase() === 'CODE') continue;

    let variant = row[1] ? row[1].toString().trim() : "Standard";
    let priceVal = row[2];
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
    validCodes.add(codeUpper);

    if (!productsDict[codeUpper]) {
      productsDict[codeUpper] = { code, variations: [] };
    }
    
    productsDict[codeUpper].variations.push({ color: variant, price });
  }

  console.log(`Loaded ${validCodes.size} unique product codes.`);
  const sortedCodes = Array.from(validCodes).sort((a, b) => b.length - a.length);

  // 2. Process Images
  console.log("Processing Images...");
  const files = fs.readdirSync(importDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  let count = 0;
  
  const worker = await Tesseract.createWorker('eng');

  for (const filename of files) {
    const inputPath = path.join(importDir, filename);
    const nameNoExt = path.parse(filename).name.toUpperCase();
    
    let assignedCode = null;

    if (validCodes.has(nameNoExt)) {
      assignedCode = nameNoExt;
    } else {
      console.log(`Running OCR on ${filename}...`);
      try {
        const { data: { text } } = await worker.recognize(inputPath);
        const textUpper = text.toUpperCase();

        for (const code of sortedCodes) {
          const regex = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
          if (regex.test(textUpper)) {
            assignedCode = code;
            break;
          }
        }
        
        if (!assignedCode) {
          const textNoSpace = textUpper.replace(/\s+/g, '');
          for (const code of sortedCodes) {
            if (textNoSpace.includes(code.replace(/\s+/g, ''))) {
              assignedCode = code;
              break;
            }
          }
        }
      } catch (e) {
        console.error(`OCR failed for ${filename}:`, e.message);
      }
    }

    if (assignedCode) {
      const outputPath = path.join(outputDir, `${assignedCode}.png`);
      try {
        const metadata = await sharp(inputPath).metadata();
        let img = sharp(inputPath);
        if (metadata.width < 800) {
          img = img.resize({ width: 800, kernel: sharp.kernel.lanczos3 });
        }
        img = img.sharpen().modulate({ brightness: 1.05, saturation: 1.1 });
        await img.toFile(outputPath);
        
        console.log(`[${count}] Saved ${filename} as ${assignedCode}.png`);
        count++;
      } catch (e) {
        console.error(`Failed to process image ${filename}:`, e.message);
      }
    } else {
      console.log(`Could not identify code for ${filename}`);
    }
  }

  await worker.terminate();

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

  // 3. Generate SQL
  console.log("Generating SQL...");
  const sqlStatements = [
    "DELETE FROM products;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;"
  ];

  for (const p of Object.values(productsDict)) {
    const code = p.code;
    const varsJson = JSON.stringify(p.variations).replace(/'/g, "''");
    const basePrice = p.variations.length > 0 ? p.variations[0].price : 0;
    const pricesJson = JSON.stringify({ EGP: basePrice, USD: 0 }).replace(/'/g, "''");
    
    // Check if we generated a new image
    let imagePath = `/images/products/${code}.png`;
    if (!fs.existsSync(`c:/Website/public/images/products/${code}.png`)) {
      // Fallback to old image
      const oldImage = getOldImage(code);
      imagePath = oldImage || imagePath;
    }
    
    const sql = `INSERT INTO products (code, description, type, image, prices, variants) VALUES ('${code}', 'Product ${code}', 'product', '${imagePath}', '${pricesJson}'::jsonb, '${varsJson}'::jsonb);`;
    sqlStatements.push(sql);
  }

  fs.writeFileSync('c:/Website/rebuild_products.sql', sqlStatements.join('\\n'));
  console.log("SQL generation complete. Output at c:/Website/rebuild_products.sql");
}

main().catch(console.error);
