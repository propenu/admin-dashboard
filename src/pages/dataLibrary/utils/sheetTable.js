import { extractPdfTable } from "./pdfTable";

const SHEET_EXT = /\.(xlsx|xls|csv|tsv|ods)$/i;
const PDF_EXT = /\.pdf$/i;

export const MAX_TABLE_ROWS = 20000;
export const MAX_TABLE_COLUMNS = 100;

export const canExtractTable = (fileName = "") => SHEET_EXT.test(fileName) || PDF_EXT.test(fileName);

const normalize = (table) => {
  if (!table) return null;
  const width = Math.min(
    MAX_TABLE_COLUMNS,
    table.rows.reduce((max, r) => Math.max(max, r.length), table.columns.length),
  );
  const columns = Array.from({ length: width }, (_, i) => String(table.columns[i] ?? "").trim() || `Column ${i + 1}`);
  const rows = table.rows
    .slice(0, MAX_TABLE_ROWS)
    .map((r) => Array.from({ length: width }, (_, i) => String(r[i] ?? "").trim()))
    .filter((r) => r.some(Boolean));
  return rows.length ? { columns, rows, truncated: table.rows.length > MAX_TABLE_ROWS } : null;
};

const extractSheetTable = async (arrayBuffer) => {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  for (const name of workbook.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });
    const headerIdx = matrix.findIndex((row) => row.filter((c) => String(c).trim()).length >= 2);
    if (headerIdx < 0) continue;
    return { columns: matrix[headerIdx], rows: matrix.slice(headerIdx + 1) };
  }
  return null;
};

/** Reads a File/Blob (PDF, Excel, CSV) and returns { columns, rows, truncated } or null. */
export const extractTableFromFile = async (file, fileName = file?.name || "") => {
  if (!file || !canExtractTable(fileName)) return null;
  const buffer = await file.arrayBuffer();
  const table = PDF_EXT.test(fileName) ? await extractPdfTable(buffer) : await extractSheetTable(buffer);
  return normalize(table);
};
