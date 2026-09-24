/**
 * Contact file validation for WhatsApp CSV / Excel campaigns.
 * Normalizes phones, flags invalid/missing/duplicate/opt-out/missing-mapped values.
 */

export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/** Normalize to a comparable WhatsApp-style id (prefer 91XXXXXXXXXX for 10-digit IN). */
export function normalizePhoneDigits(raw) {
  let digits = digitsOnly(raw);
  if (!digits) return "";
  // Strip leading 00 international prefix
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Indian 10-digit → 91…
  if (digits.length === 10) return `91${digits}`;
  // 0XXXXXXXXXX (11 digits starting with 0)
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Valid WhatsApp recipient number for Propenu (India-first, allow E.164-ish).
 * Returns { ok, reason?, normalized? }
 */
export function validatePhoneNumber(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "missing_number" };
  }

  const digits = digitsOnly(trimmed);
  if (!digits) {
    return { ok: false, reason: "invalid_number" };
  }

  if (/^0+$/.test(digits) || /^1{10,}$/.test(digits) || /^1234567890$/.test(digits)) {
    return { ok: false, reason: "invalid_number" };
  }

  const normalized = normalizePhoneDigits(trimmed);

  if (normalized.length < 10 || normalized.length > 15) {
    return { ok: false, reason: "invalid_number" };
  }

  // Indian mobile: 91 + 10 digits starting 6–9
  if (normalized.startsWith("91") && normalized.length === 12) {
    const local = normalized.slice(2);
    if (!/^[6-9]\d{9}$/.test(local)) {
      return { ok: false, reason: "invalid_number" };
    }
  }

  // Bare 10-digit should already be normalized; if somehow still 10:
  if (normalized.length === 10 && !/^[6-9]\d{9}$/.test(normalized)) {
    return { ok: false, reason: "invalid_number" };
  }

  return { ok: true, normalized };
}

function isTruthyOptOut(value) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!v) return false;
  return [
    "1",
    "true",
    "yes",
    "y",
    "opted out",
    "opt-out",
    "optout",
    "unsubscribe",
    "unsubscribed",
    "stop",
    "stopped",
    "blocked",
  ].includes(v);
}

function findOptOutHeader(headers = []) {
  return (
    headers.find((h) =>
      /^(opt[_-]?out|opted[_-]?out|unsubscribe|whatsapp[_-]?opt[_-]?out|marketing[_-]?opt[_-]?out)$/i.test(
        String(h || "").trim(),
      ),
    ) ||
    headers.find((h) => /opt.?out|unsubscribe/i.test(String(h || ""))) ||
    ""
  );
}

function findStatusHeader(headers = []) {
  return (
    headers.find((h) => /^(status|whatsapp[_-]?status|consent)$/i.test(String(h || "").trim())) ||
    ""
  );
}

/**
 * @param {object} opts
 * @param {Record<string,string>[]} opts.rows
 * @param {string[]} opts.headers
 * @param {string} opts.phoneField
 * @param {Record<string,string>} opts.fieldMapping  {{1}} → column
 * @param {number} opts.templateVarCount
 * @param {boolean} opts.needsHeaderImage
 * @param {boolean} opts.hasHeaderImage
 */
export function analyzeContactRows({
  rows = [],
  headers = [],
  phoneField = "",
  fieldMapping = {},
  templateVarCount = 0,
  needsHeaderImage = false,
  hasHeaderImage = false,
}) {
  const phoneHeader = String(phoneField || "").trim();
  const optOutHeader = findOptOutHeader(headers);
  const statusHeader = findStatusHeader(headers);

  const categories = {
    duplicates: [],
    invalid_numbers: [],
    missing_numbers: [],
    opted_out: [],
    missing_values: [],
    missing_images: [],
  };

  const seen = new Map(); // normalized → first excel row
  const ready = [];
  const excluded = [];

  rows.forEach((row, index) => {
    const excelRow = index + 2; // header is row 1
    const phoneRaw = phoneHeader
      ? String(row[phoneHeader] ?? "").trim()
      : "";

    const issues = [];

    // Opt-out column
    if (optOutHeader && isTruthyOptOut(row[optOutHeader])) {
      issues.push("opted_out");
    }
    if (
      statusHeader &&
      /opt.?out|unsub|stop|block/i.test(String(row[statusHeader] ?? ""))
    ) {
      issues.push("opted_out");
    }

    const phoneCheck = validatePhoneNumber(phoneRaw);
    if (!phoneCheck.ok) {
      issues.push(phoneCheck.reason || "invalid_number");
    } else {
      const key = phoneCheck.normalized;
      if (seen.has(key)) {
        issues.push("duplicates");
      } else {
        seen.set(key, excelRow);
      }
    }

    // Missing mapped template variables
    if (templateVarCount > 0) {
      for (let i = 1; i <= templateVarCount; i++) {
        const col = fieldMapping[String(i)];
        if (!col) continue;
        const val = String(row[col] ?? "").trim();
        if (!val) {
          issues.push("missing_values");
          break;
        }
      }
    }

    const uniqueIssues = [...new Set(issues)];
    const entry = {
      excelRow,
      phoneRaw,
      detectedValue: phoneRaw || "(empty)",
      normalized: phoneCheck.normalized || "",
      issues: uniqueIssues,
      row,
    };

    if (uniqueIssues.length) {
      excluded.push(entry);
      uniqueIssues.forEach((code) => {
        if (categories[code]) categories[code].push(entry);
      });
    } else {
      ready.push(entry);
    }
  });

  // Campaign-level: IMAGE header required but no media
  if (needsHeaderImage && !hasHeaderImage) {
    categories.missing_images.push({
      excelRow: null,
      phoneRaw: "",
      detectedValue: "Campaign header image",
      issues: ["missing_images"],
      row: null,
    });
  }

  const counts = {
    duplicates: categories.duplicates.length,
    invalid_numbers: categories.invalid_numbers.length,
    missing_numbers: categories.missing_numbers.length,
    opted_out: categories.opted_out.length,
    missing_values: categories.missing_values.length,
    missing_images: categories.missing_images.length,
  };

  return {
    totalRows: rows.length,
    readyCount: ready.length,
    excludedCount: excluded.length,
    ready,
    excluded,
    categories,
    counts,
    canSend:
      ready.length > 0 &&
      !(needsHeaderImage && !hasHeaderImage),
  };
}

export const VALIDATION_CATEGORY_META = {
  duplicates: {
    label: "Duplicates",
    description: "Same phone number appears more than once. First row is kept.",
  },
  invalid_numbers: {
    label: "Invalid numbers",
    description: "Phone format is wrong (not a valid WhatsApp number).",
  },
  missing_numbers: {
    label: "Missing numbers",
    description: "Phone column is empty for this row.",
  },
  opted_out: {
    label: "Opted out",
    description: "Recipient has stopped marketing messages (opt-out column/status).",
  },
  missing_values: {
    label: "Missing values",
    description: "A mapped template field ({{n}}) is empty for this row.",
  },
  missing_images: {
    label: "Missing images",
    description: "This template needs a header image URL before send.",
  },
};
