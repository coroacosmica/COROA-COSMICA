const xlsx = require('xlsx');

const workbook = xlsx.readFile('c:/Website/price_list_updated.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log("First 5 rows:");
for (let i = 0; i < Math.min(5, data.length); i++) {
    console.log(data[i]);
}
