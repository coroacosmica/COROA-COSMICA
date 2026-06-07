import { google } from "googleapis";

export type Region = "egypt" | "europe" | "usa" | "saudi";

export const SHEET_IDS: Record<Region, string> = {
  egypt: process.env.SHEET_ID_EGYPT || "1V2amBTe3m5GttKiBSnlybd4aopRLk-yUwjU-06xcfsI",
  europe: process.env.SHEET_ID_EUROPE || "1HFEmIZ5hOAkiHOJ-6vlrMIjrX3Od2lvTXm0XmI4GSL0",
  usa: process.env.SHEET_ID_USA || "1mY7UyEXZHwYW7oCyxkty_Zdv4iQ2dxkYRE-nMjVFff4",
  saudi: process.env.SHEET_ID_SAUDI || "191hZdeaYXDGVeqMq6vy0CGzg9_6HMr7bWfmpDsRLhgs",
};

const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

// Helper to get the first sheet name dynamically
async function getTabName(sheets: any, spreadsheetId: string) {
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    return res.data.sheets?.[0]?.properties?.title || "Sheet20";
  } catch (e) {
    return "Sheet20";
  }
}

// Helper to check if mock mode is active
export const isMockMode = () => !process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

// Authenticate with Google
const getAuth = () => {
  if (isMockMode()) return null;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

// In-memory mock DB since user doesn't have the key yet
export const mockDatabase: Record<Region, any[]> = {
  egypt: [],
  europe: [],
  usa: [],
  saudi: [],
};

export async function getOrders(region: Region) {
  if (isMockMode()) {
    return mockDatabase[region] || [];
  }
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  const spreadsheetId = SHEET_IDS[region];

  try {
    const tabName = await getTabName(sheets, spreadsheetId);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A2:M`, // Assuming row 1 is headers
    });
    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      rowIndex: index + 2, // 1-based index, row 1 is header
      orderNumber: row[0] || "",
      connect: row[1] || "",
      review: row[2] || "",
      confirm: row[3] || "",
      poNumber: row[4] || "",
      design: row[5] || "",
      purchaseMaterial: row[6] || "",
      manufacture: row[7] || "",
      handover: row[8] || "",
      finalInvoice: row[9] || "",
      expectedDate: row[10] || "",
      amount: row[11] || "0",
      currency: row[12] || "",
    }));
  } catch (error) {
    console.error(`Error reading from Google Sheets (${region}):`, error);
    return [];
  }
}

export async function addOrder(region: Region, orderData: any) {
  if (isMockMode()) {
    mockDatabase[region].push({
      rowIndex: mockDatabase[region].length + 2,
      orderNumber: orderData.orderNumber || `ORD-${Date.now()}`,
      connect: "",
      review: "",
      confirm: "",
      poNumber: orderData.poNumber || "",
      design: "",
      purchaseMaterial: "",
      manufacture: "",
      handover: "",
      finalInvoice: "",
      expectedDate: orderData.expectedDate || "",
      amount: orderData.amount || "0",
      currency: orderData.currency || "USD",
    });
    return true;
  }
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  const spreadsheetId = SHEET_IDS[region];

  const values = [
    orderData.orderNumber || "",
    "", "", "", // steps
    orderData.poNumber || "",
    "", "", "", "", "", // more steps
    orderData.expectedDate || "",
    orderData.amount || "",
    orderData.currency || "",
  ];

  try {
    const tabName = await getTabName(sheets, spreadsheetId);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:M`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
    return true;
  } catch (error) {
    console.error(`Error adding to Google Sheets (${region}):`, error);
    return false;
  }
}

export async function updateCell(region: Region, rowIndex: number, colLetter: string, value: string) {
  if (isMockMode()) {
    const order = mockDatabase[region].find((o) => o.rowIndex === rowIndex);
    if (order) {
      const colIndex = COLUMNS.indexOf(colLetter);
      const keys = ["orderNumber", "connect", "review", "confirm", "poNumber", "design", "purchaseMaterial", "manufacture", "handover", "finalInvoice", "expectedDate", "amount", "currency"];
      order[keys[colIndex]] = value;
    }
    return true;
  }
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  const spreadsheetId = SHEET_IDS[region];

  try {
    const tabName = await getTabName(sheets, spreadsheetId);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!${colLetter}${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[value]] },
    });
    return true;
  } catch (error) {
    console.error(`Error updating cell in Google Sheets (${region}):`, error);
    return false;
  }
}

export async function deleteOrder(region: Region, rowIndex: number) {
  if (isMockMode()) {
    mockDatabase[region] = mockDatabase[region].filter((o) => o.rowIndex !== rowIndex);
    return true;
  }
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  const spreadsheetId = SHEET_IDS[region];

  try {
    const tabName = await getTabName(sheets, spreadsheetId);
    // Note: To delete a row properly via Sheets API, we need the sheetId (not spreadsheetId) and batchUpdate.
    // For simplicity, we just clear the row so it doesn't break formulas.
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${tabName}!A${rowIndex}:M${rowIndex}`,
    });
    return true;
  } catch (error) {
    console.error(`Error deleting order from Google Sheets (${region}):`, error);
    return false;
  }
}
