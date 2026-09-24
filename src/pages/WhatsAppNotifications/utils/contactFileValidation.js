/**
 * Contact file validation for WhatsApp CSV / Excel campaigns.
 * Phone / opt-out / duplicates exclude rows.
 * Empty template vars are warnings only (backend fills "Customer").
 */

export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/** Normalize to a comparable WhatsApp-style id (prefer 91XXXXXXXXXX for 10-digit IN). */
export function normalizePhoneDigits(raw) {
  let digits = digitsOnly(raw);
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Valid WhatsApp recipient number for Propenu (India-first).
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

  if (
    /^0+$/.test(digits) ||
    /^1{10,}$/.test(digits) ||
    /^1234567890$/.test(digits)
  ) {
    return { ok: false, reason: "invalid_number" };
  }

  const normalized = normalizePhoneDigits(trimmed);

  if (normalized.length < 10 || normalized.length > 15) {
    return { ok: false, reason: "invalid_number" };
  }

  if (normalized.startsWith("91") && normalized.length === 12) {
    const local = normalized.slice(2);
    if (!/^[6-9]\d{9}$/.test(local)) {
      return { ok: false, reason: "invalid_number" };
    }
  }

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
    headers.find((h) =>
      /^(opt[_-]?out|opted[_-]?out|unsubscribe)$/i.test(String(h || "").trim()),
    ) ||
    ""
  );
}

/** Exact status/consent columns only — not "Account Status" / "Role". */
function findStatusHeader(headers = []) {
  return (
    headers.find((h) =>
      /^(status|whatsapp[_-]?status|consent|opt[_-]?in)$/i.test(
        String(h || "").trim(),
      ),
    ) || ""
  );
}

function resolveRowValue(row, header) {
  if (!header) return "";
  if (Object.prototype.hasOwnProperty.call(row, header)) {
    return String(row[header] ?? "").trim();
  }
  const key = Object.keys(row).find(
    (k) => k.trim().toLowerCase() === String(header).trim().toLowerCase(),
  );
  return key ? String(row[key] ?? "").trim() : "";
}

function emptyMappedFields(row, fieldMapping, templateVarCount, headers) {
  const empty = [];
  if (templateVarCount <= 0) return empty;
  const headerSet = new Set(
    (headers || []).map((h) => String(h || "").trim().toLowerCase()),
  );
  for (let i = 1; i <= templateVarCount; i++) {
    const col = fieldMapping[String(i)];
    if (!col) continue;
    if (!headerSet.has(String(col).trim().toLowerCase())) {
      empty.push(`{{${i}}} → "${col}" (column not in file)`);
      continue;
    }
    const val = resolveRowValue(row, col);
    if (!val) empty.push(`{{${i}}} → ${col} (empty)`);
  }
  return empty;
}

/**
 * @param {object} opts
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

  const seen = new Map();
  const ready = [];
  const excluded = [];

  rows.forEach((row, index) => {
    const excelRow = index + 2;
    const phoneRaw = phoneHeader
      ? resolveRowValue(row, phoneHeader)
      : "";

    /** Hard excludes only */
    const hardIssues = [];
    /** Soft warnings — do not block send (backend uses "Customer") */
    const softIssues = [];
    let detectedValue = phoneRaw || "(empty)";

    if (optOutHeader && isTruthyOptOut(resolveRowValue(row, optOutHeader))) {
      hardIssues.push("opted_out");
      detectedValue = resolveRowValue(row, optOutHeader) || phoneRaw;
    }
    if (
      statusHeader &&
      /opt.?out|unsub|stop|block/i.test(resolveRowValue(row, statusHeader))
    ) {
      hardIssues.push("opted_out");
      detectedValue = resolveRowValue(row, statusHeader) || phoneRaw;
    }

    const phoneCheck = validatePhoneNumber(phoneRaw);
    if (!phoneCheck.ok) {
      hardIssues.push(phoneCheck.reason || "invalid_number");
      detectedValue = phoneRaw || "(empty)";
    } else {
      const key = phoneCheck.normalized;
      if (seen.has(key)) {
        hardIssues.push("duplicates");
        detectedValue = phoneCheck.normalized;
      } else {
        seen.set(key, excelRow);
      }
    }

    const empties = emptyMappedFields(
      row,
      fieldMapping,
      templateVarCount,
      headers,
    );
    if (empties.length) {
      softIssues.push("missing_values");
      // Show which template field is empty — not the phone number
      detectedValue = empties.join("; ");
    }

    const hardUnique = [...new Set(hardIssues)];
    const softUnique = [...new Set(softIssues)];

    const entry = {
      excelRow,
      phoneRaw,
      detectedValue,
      normalized: phoneCheck.normalized || "",
      issues: [...hardUnique, ...softUnique],
      row,
    };

    softUnique.forEach((code) => {
      if (categories[code]) categories[code].push(entry);
    });

    if (hardUnique.length) {
      excluded.push(entry);
      hardUnique.forEach((code) => {
        if (categories[code]) categories[code].push(entry);
      });
    } else {
      ready.push(entry);
    }
  });

  if (needsHeaderImage && !hasHeaderImage) {
    categories.missing_images.push({
      excelRow: null,
      phoneRaw: "",
      detectedValue: "Campaign header image required",
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
      ready.length > 0 && !(needsHeaderImage && !hasHeaderImage),
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
    description:
      "Recipient has stopped marketing messages (opt-out column only).",
  },
  missing_values: {
    label: "Missing values",
    description:
      "A mapped {{n}} column is empty — send still works (filled as Customer). Remap the column if needed.",
  },
  missing_images: {
    label: "Missing images",
    description: "This template needs a header image URL before send.",
  },
};
