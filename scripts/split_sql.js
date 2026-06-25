const fs = require('fs');

let content = fs.readFileSync('c:\\Website\\replace_all_products.sql', 'utf8');

// The file might contain literal '\n' strings or actual newlines.
// Let's normalize it to actual newlines if it has literal '\n'
if (content.includes('\\n')) {
  content = content.replace(/\\n/g, '\n');
}

// FIX: Replace '[]'::jsonb with ARRAY[]::text[] for tags and includes columns
content = content.replace(/'\[\]'::jsonb/g, 'ARRAY[]::text[]');

const deleteStmt = "DELETE FROM products;";
const insertPrefix = "INSERT INTO products (code, description, category, prices, discount_percentage, is_active, names, type, price, featured, tags, includes) VALUES";

// Find where the values start
const valuesStartIdx = content.indexOf('VALUES');
if (valuesStartIdx === -1) {
  console.error("Could not find VALUES clause.");
  process.exit(1);
}

let valuesStr = content.substring(valuesStartIdx + 6).trim();
if (valuesStr.startsWith('\n')) valuesStr = valuesStr.trim();
if (valuesStr.endsWith(';')) valuesStr = valuesStr.slice(0, -1).trim();

// Split by '),\n(' or '), (' or '),('
let values = valuesStr.split(/\),\s*\(/);

// Clean up the first '(' and last ')'
if (values[0].startsWith('(')) values[0] = values[0].substring(1);
if (values[values.length - 1].endsWith(')')) values[values.length - 1] = values[values.length - 1].slice(0, -1);

let chunks = [];
const CHUNK_SIZE = 100;

for (let i = 0; i < values.length; i += CHUNK_SIZE) {
  let chunkVals = values.slice(i, i + CHUNK_SIZE);
  
  // Re-add the parentheses for all items
  chunkVals = chunkVals.map(val => `(${val})`);
  
  let chunkStr = chunkVals.join(',\n') + ';';
  chunks.push(chunkStr);
}

fs.writeFileSync('c:\\Website\\part1_delete_and_insert.sql', `-- RUN THIS FILE FIRST\n${deleteStmt}\n\n${insertPrefix}\n${chunks[0]}`);

for (let i = 1; i < chunks.length; i++) {
  fs.writeFileSync(`c:\\Website\\part${i + 1}_insert.sql`, `-- RUN THIS FILE PART ${i + 1}\n${insertPrefix}\n${chunks[i]}`);
}

console.log("Successfully split into " + chunks.length + " parts, fixed arrays.");
