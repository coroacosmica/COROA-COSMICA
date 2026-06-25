import fs from 'fs';
import xlsx from 'xlsx';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
}

async function main() {
  const excelPath = 'c:/Website/final_price.xlsx';
  const localJsonPath = 'c:/Website/src/data/products.json';
  
  console.log("Parsing Excel...");
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let productsDict = {};
  let lastCode = null;
  let lastPrice = 0;
  let currentCategory = "general"; 

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    let col0 = row[0] ? row[0].toString().trim() : "";
    let col1 = row[1] ? row[1].toString().trim() : "";
    let col2 = row[2];

    if (col0 && !col1 && (col2 === undefined || col2 === null || col2 === "")) {
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

  const oldProductsPath = 'c:/Website/src/data/products.json';
  let oldProducts = [];
  try {
    oldProducts = JSON.parse(fs.readFileSync(oldProductsPath, 'utf8'));
  } catch (e) {}
  
  const getOldImage = (code) => {
    const p = oldProducts.find(x => x.code.toLowerCase() === code.toLowerCase());
    return p ? p.image : null;
  };

  const finalArray = [];

  for (const p of Object.values(productsDict)) {
    const code = p.code;
    const cat = p.category;
    const basePrice = p.variations.length > 0 ? p.variations[0].price : 0;
    
    let imagePath = `/images/products/${code}.png`;
    if (!fs.existsSync(`c:/Website/public/images/products/${code}.png`)) {
      const oldImage = getOldImage(code);
      imagePath = oldImage || imagePath;
    }
    
    finalArray.push({
      code: code,
      description: `Product ${code}`,
      type: "product",
      image: imagePath,
      category: cat,
      price: basePrice,
      prices: { EGP: basePrice, USD: 0 },
      variants: p.variations
    });
  }

  fs.writeFileSync(localJsonPath, JSON.stringify(finalArray, null, 2));
  console.log(`Overwrote ${localJsonPath} with ${finalArray.length} new products.`);
}

main().catch(console.error);
