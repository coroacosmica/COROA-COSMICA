import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

async function testOCR() {
  const file = 'c:/Website/import_data/Screenshot 2026-06-25 182037.png';
  
  // Try directly
  console.log('Testing direct...');
  let res = await Tesseract.recognize(file, 'eng');
  console.log('Direct:', res.data.text.replace(/\n/g, ' '));
  
  // Try grayscale + threshold + invert
  console.log('Testing Sharp...');
  const metadata = await sharp(file).metadata();
  
  // We'll crop the top half since the product code is usually big and on top
  const topHalf = await sharp(file)
    .extract({ left: 0, top: 0, width: metadata.width, height: Math.floor(metadata.height / 2) })
    .greyscale()
    .normalize()
    .toBuffer();
    
  res = await Tesseract.recognize(topHalf, 'eng');
  console.log('Top half:', res.data.text.replace(/\n/g, ' '));

  const inverted = await sharp(file)
    .extract({ left: 0, top: 0, width: metadata.width, height: Math.floor(metadata.height / 2) })
    .greyscale()
    .negate()
    .normalize()
    .toBuffer();

  res = await Tesseract.recognize(inverted, 'eng');
  console.log('Top half inverted:', res.data.text.replace(/\n/g, ' '));
}

testOCR().catch(console.error);
