/**
 * RFC 4180 CSV parser used by the M/J 2026 public-results pipeline.
 *
 * The Google Forms export contains free-text answers with embedded newlines
 * and quotes, so a line-based split is not safe. Pure, dependency-free,
 * deterministic.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.startsWith("﻿") ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Rows → objects keyed by the trimmed header text. Blank rows are dropped. */
export function csvToObjects(text: string): Array<Record<string, string>> {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const out: Array<Record<string, string>> = [];
  for (const r of rows.slice(1)) {
    if (!r.some((c) => c.trim().length > 0)) continue;
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      if (!h) return;
      obj[h] = (r[i] ?? "").trim();
    });
    out.push(obj);
  }
  return out;
}
