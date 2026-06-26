import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

async function main() {
  const importDir = 'c:/Website/import_data';
  const files = fs.readdirSync(importDir).filter(f => f.startsWith('Screenshot')).slice(0, 5);

  console.log("Testing OCR on 5 Screenshot images...");
  for (const f of files) {
    console.log(`Processing ${f}...`);
    const imgPath = path.join(importDir, f);
    try {
      const { data: { text } } = await Tesseract.recognize(imgPath, 'eng');
      console.log(`--- Text for ${f} ---\n${text.slice(0, 200).trim()}\n------------------`);
    } catch (e) {
      console.error(`Error on ${f}:`, e.message);
    }
  }
}

main().catch(console.error);
