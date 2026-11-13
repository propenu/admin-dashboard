import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Rebuild a table from PDF text positions.
 * Input: pages → [{ str, x, y, w, h }] (PDF units, y grows upward).
 * Output: { columns: string[], rows: string[][] } or null when no table-like layout is found.
 */

const COL_TOL = 3;

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const groupRows = (items) => {
  const tol = Math.max(1, median(items.map((i) => i.h || 0)) * 0.45);
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows = [];
  for (const item of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row.y - item.y) <= tol) row.items.push(item);
    else rows.push({ y: item.y, items: [item] });
  }
  return rows.map((row) => row.items.sort((a, b) => a.x - b.x));
};

const clusterStarts = (xs) => {
  const clusters = [];
  for (const x of [...xs].sort((a, b) => a - b)) {
    const last = clusters[clusters.length - 1];
    if (last && x - last.max <= COL_TOL) {
      last.max = x;
      last.values.push(x);
    } else {
      clusters.push({ max: x, values: [x] });
    }
  }
  return clusters.map((c) => median(c.values));
};

/**
 * PDF writers often emit two adjacent cells as one text run ("9493363697 sai@x.com").
 * Split a run at a column start only when that column has no other text in the row and a
 * space sits near where the column begins; text that merely overflows into a filled
 * neighbour ("Miyapur Ad set 27/10") stays whole.
 */
const splitAtAnchors = (item, anchors, row) => {
  const columnTaken = (anchorIdx) => {
    const start = anchors[anchorIdx] - COL_TOL;
    const end = anchorIdx + 1 < anchors.length ? anchors[anchorIdx + 1] - COL_TOL : Infinity;
    return row.some((other) => other !== item && other.x >= start && other.x < end);
  };
  const pieces = [item];
  for (let a = 0; a < anchors.length; a += 1) {
    const anchor = anchors[a];
    const piece = pieces[pieces.length - 1];
    if (anchor <= piece.x + COL_TOL || anchor >= piece.x + piece.w - COL_TOL) continue;
    if (columnTaken(a)) continue;
    const len = piece.str.length;
    const target = ((anchor - piece.x) / piece.w) * len;
    let best = -1;
    for (let i = 0; i < len; i += 1) {
      if (piece.str[i] === " " && (best < 0 || Math.abs(i - target) < Math.abs(best - target))) best = i;
    }
    if (best < 0 || Math.abs(best - target) > Math.max(4, len * 0.25)) continue;
    const left = piece.str.slice(0, best).trim();
    const right = piece.str.slice(best + 1).trim();
    if (!left || !right) continue;
    pieces.pop();
    pieces.push(
      { ...piece, str: left, w: anchor - piece.x },
      { ...piece, str: right, x: anchor, w: piece.x + piece.w - anchor },
    );
  }
  return pieces;
};

const rowText = (row) => row.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim().toLowerCase();

export const buildTableFromTextItems = (pages) => {
  const pageRows = pages.map((items) => groupRows(items.filter((i) => i.str && i.str.trim())));
  const firstRows = pageRows.find((rows) => rows.length) || [];
  if (!firstRows.length) return null;

  // Header = the widest of the first few rows (skips a title line above the table).
  let headerIdx = 0;
  firstRows.slice(0, 4).forEach((row, idx) => {
    if (row.length > firstRows[headerIdx].length) headerIdx = idx;
  });
  const header = firstRows[headerIdx];
  if (header.length < 2) return null;
  const headerKey = rowText(header);

  const dataRows = [];
  pageRows.forEach((rows, pageIdx) => {
    const start = pageIdx === pageRows.indexOf(firstRows) ? headerIdx + 1 : 0;
    rows.slice(start).forEach((row) => {
      if (rowText(row) !== headerKey) dataRows.push(row);
    });
  });
  if (!dataRows.length) return null;

  const firstAnchors = clusterStarts([...header, ...dataRows.flat()].map((i) => i.x));
  const splitRow = (row) => row.flatMap((item) => splitAtAnchors(item, firstAnchors, row));
  const headerPieces = splitRow(header);
  const dataPieces = dataRows.map(splitRow);
  const anchors = clusterStarts([...headerPieces, ...dataPieces.flat()].map((p) => p.x));

  const columnFor = (x) => {
    let idx = 0;
    anchors.forEach((a, i) => {
      if (a <= x + COL_TOL) idx = i;
    });
    return idx;
  };
  const toCells = (pieces) => {
    const cells = anchors.map(() => []);
    pieces.forEach((p) => cells[columnFor(p.x)].push(p.str.trim()));
    return cells.map((parts) => parts.join(" ").trim());
  };

  let names = toCells(headerPieces);
  let body = dataPieces.map(toCells);

  // Headers and their values are not always left-aligned the same way, which leaves a
  // header-only column next to a value-only column — fold each such pair into one.
  const hasData = (idx) => body.some((r) => r[idx]);
  for (let i = 0; i < names.length - 1; i += 1) {
    const aHeaderOnly = names[i] && !hasData(i) && !names[i + 1] && hasData(i + 1);
    const aDataOnly = !names[i] && hasData(i) && names[i + 1] && !hasData(i + 1);
    if (!aHeaderOnly && !aDataOnly) continue;
    const keep = names[i] || names[i + 1];
    names = [...names.slice(0, i), keep, ...names.slice(i + 2)];
    body = body.map((r) => [...r.slice(0, i), r[i] || r[i + 1], ...r.slice(i + 2)]);
  }

  const keepIdx = names.map((_, i) => i).filter((i) => names[i] || hasData(i));
  const columns = keepIdx.map((i, n) => names[i] || `Column ${n + 1}`);
  const rows = body
    .map((r) => keepIdx.map((i) => r[i]))
    .filter((cells) => cells.some(Boolean));

  return rows.length && columns.length > 1 ? { columns, rows } : null;
};

const MAX_PDF_PAGES = 20;

/** Browser-side: read a PDF ArrayBuffer and rebuild its table. */
export const extractPdfTable = async (arrayBuffer) => {
  const task = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    disableAutoFetch: true,
    disableStream: true,
  });
  const timeout = setTimeout(() => task.destroy(), 8000);
  let doc;
  try {
    doc = await task.promise;
  } finally {
    clearTimeout(timeout);
  }

  const pages = [];
  const pageCount = Math.min(doc.numPages, MAX_PDF_PAGES);
  for (let p = 1; p <= pageCount; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((i) => ({
        str: i.str,
        x: i.transform[4],
        y: i.transform[5],
        w: i.width,
        h: i.height,
      })),
    );
  }
  return buildTableFromTextItems(pages);
};
