import { countVars } from "./helper";

const countWords = (text) =>
  String(text || "")
    .replace(/\{\{\d+\}\}/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

/**
 * Meta WhatsApp BODY variable rules + how to fix each issue.
 * Returns { ok, errors: [{ code, message, fix }] }
 */
export const validateTemplateBody = (rawText = "") => {
  const text = String(rawText || "");
  const errors = [];

  if (!text.trim()) {
    errors.push({
      code: "EMPTY_BODY",
      message: "Message body is required.",
      fix: "Write your template text in Message Body.",
    });
    return { ok: false, errors };
  }

  const invalidNamed = text.match(/\{\{(?!\d+\})[^}]+\}\}/g) || [];
  if (invalidNamed.length) {
    errors.push({
      code: "NAMED_VARS",
      message: `Invalid variable(s): ${[...new Set(invalidNamed)].join(", ")}`,
      fix: "Use only numbered variables like {{1}}, {{2}}. Remove named tokens.",
    });
  }

  const matches = text.match(/\{\{\d+\}\}/g) || [];
  const numbers = matches.map((m) => Number(m.replace(/[{}]/g, "")));
  const uniqueSorted = [...new Set(numbers)].sort((a, b) => a - b);
  const varCount = uniqueSorted.length;
  const wordCount = countWords(text);

  if (varCount > 0) {
    // Must start at 1 and be consecutive
    for (let i = 0; i < uniqueSorted.length; i++) {
      if (uniqueSorted[i] !== i + 1) {
        errors.push({
          code: "NON_SEQUENTIAL",
          message: "Variables must be sequential starting from {{1}}.",
          fix: "Use {{1}}, then {{2}}, then {{3}}… without skipping numbers.",
        });
        break;
      }
    }

    // Cannot start with a variable
    if (/^\s*\{\{\d+\}\}/.test(text)) {
      errors.push({
        code: "VAR_AT_START",
        message: "Variables can't be at the start of the template.",
        fix: 'Add text before the first variable. Example: "Hi {{1}}, welcome…" (not "{{1}} welcome…").',
      });
    }

    // Cannot end with a variable
    if (/\{\{\d+\}\}\s*$/.test(text)) {
      errors.push({
        code: "VAR_AT_END",
        message: "Variables can't be at the end of the template.",
        fix: 'Add text after the last variable. Example: "…city is {{2}}. Thank you!"',
      });
    }

    // Adjacent variables with little/no text between
    if (/\{\{\d+\}\}\s*\{\{\d+\}\}/.test(text)) {
      errors.push({
        code: "ADJACENT_VARS",
        message: "Two variables are next to each other.",
        fix: "Put words between variables. Example: \"{{1}} from {{2}}\" → \"Customer {{1}} from city {{2}}\".",
      });
    }

    // Too many variables for message length (Meta rule)
    // Meta rejects when there isn't enough real text vs placeholders.
    if (wordCount < varCount * 3 || (varCount > 0 && wordCount / varCount < 2)) {
      errors.push({
        code: "TOO_MANY_VARS",
        message: "Too many variables for this message length.",
        fix: `You have ${varCount} variable(s) but only ~${wordCount} word(s). Add more real text (aim for at least 3 words per variable), or remove unused {{n}} tokens.`,
      });
    }

    // Soft max — Meta templates rarely need more than ~5–10 vars in body
    if (varCount > 10) {
      errors.push({
        code: "VAR_LIMIT",
        message: `Too many variables (${varCount}).`,
        fix: "Keep body variables to 10 or fewer. Split content across templates if needed.",
      });
    }
  }

  return { ok: errors.length === 0, errors, varCount, wordCount };
};

/**
 * Map Meta / API error text to a user-facing fix tip.
 */
export const tipForMetaTemplateError = (msg = "") => {
  const m = String(msg || "").toLowerCase();
  if (m.includes("start or end") || m.includes("beginning or end")) {
    return 'Fix: do not start or end the body with {{1}}. Put words before and after, e.g. "Hi {{1}}, … Thank you."';
  }
  if (m.includes("too many variable") || m.includes("variable param")) {
    return "Fix: add more message text, or remove extra {{n}} variables so each variable has enough surrounding words.";
  }
  if (m.includes("sequential") || m.includes("format")) {
    return "Fix: use only {{1}}, {{2}}, {{3}}… in order — no skipped numbers and no named tokens.";
  }
  if (m.includes("already exists") || m.includes("language already")) {
    return "Fix: change the template name (e.g. add _v2) or pick another language.";
  }
  if (m.includes("example")) {
    return "Fix: fill sample values for every {{n}} variable before submit.";
  }
  return "";
};

const validateBody = (text) => {
  const result = validateTemplateBody(text);
  if (!result.ok) {
    const first = result.errors[0];
    throw new Error(`${first.message} ${first.fix}`);
  }
};

export const buildPayload = (form) => {
  if (!form.name?.trim()) throw new Error("Template name is required");
  if (!form.body.text?.trim()) throw new Error("Body text is required");

  const components = [];

  // HEADER
  if (form.header.enabled) {
    const format = String(form.header.format || "TEXT").toUpperCase();
    if (format === "TEXT") {
      const headerText = String(form.header.text || "").trim();
      if (!headerText) throw new Error("Header text is required when header is enabled");
      if (headerText.length > 60) {
        throw new Error("Header text must be 60 characters or fewer");
      }
      const h = { type: "HEADER", format: "TEXT", text: headerText };
      const headerVars = (headerText.match(/\{\{\d+\}\}/g) || []).length;
      if (headerVars > 1) {
        throw new Error("Header text can include at most one variable {{1}}");
      }
      if (headerVars === 1) {
        const sample = String(form.header.example || "").trim() || "Sample";
        h.example = { header_text: [sample] };
      }
      components.push(h);
    } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(format)) {
      if (!form.header.mediaHandle) {
        throw new Error(`Header ${format.toLowerCase()} sample is required`);
      }
      components.push({
        type: "HEADER",
        format,
        example: {
          header_handle: [form.header.mediaHandle],
        },
      });
    } else if (format === "LOCATION") {
      // Meta: location pin is supplied at send time — no sample handle on create.
      components.push({ type: "HEADER", format: "LOCATION" });
    }
  }

  // BODY
  validateBody(form.body.text);

  const varCount = countVars(form.body.text);
  const bodyComp = { type: "BODY", text: form.body.text };

  if (varCount > 0) {
    const examples = form.body.examples.slice(0, varCount);

    if (examples.some((e) => !e)) {
      throw new Error(
        "All variable examples are required. Fix: fill sample values for each {{n}}.",
      );
    }

    bodyComp.example = {
      body_text: [examples],
    };
  }

  components.push(bodyComp);

  // FOOTER
  if (form.footer.enabled && form.footer.text.trim()) {
    const footerText = form.footer.text.trim();
    if (footerText.length > 60) {
      throw new Error("Footer text must be 60 characters or fewer");
    }
    components.push({ type: "FOOTER", text: footerText });
  }

  // BUTTONS (Meta: up to 10; practical mix of QR + CTA)
  if (form.buttons.length > 0) {
    if (form.buttons.length > 10) {
      throw new Error("Meta allows at most 10 buttons on a template");
    }
    const urlCount = form.buttons.filter((b) => b.type === "URL").length;
    const phoneCount = form.buttons.filter((b) => b.type === "PHONE_NUMBER").length;
    if (urlCount > 2) throw new Error("At most 2 Visit website buttons allowed");
    if (phoneCount > 1) throw new Error("At most 1 Call phone number button allowed");

    components.push({
      type: "BUTTONS",
      buttons: form.buttons.map((b, index) => {
        const text = String(b.text || "").trim();
        if (!text) throw new Error(`Button ${index + 1}: text is required`);
        if (text.length > 25) {
          throw new Error(`Button ${index + 1}: text must be 25 characters or fewer`);
        }

        const type = String(b.type || "QUICK_REPLY").toUpperCase();
        const btn = { type, text };
        if (type === "URL") {
          const url = String(b.url || "").trim();
          if (!url) throw new Error(`Button "${text}": website URL is required`);
          if (!/^https?:\/\//i.test(url)) {
            throw new Error(`Button "${text}": URL must start with http:// or https://`);
          }
          btn.url = url;
        }
        if (type === "PHONE_NUMBER") {
          const phone = String(b.phone || "").trim();
          if (!phone) throw new Error(`Button "${text}": phone number is required`);
          btn.phone_number = phone;
        }

        return btn;
      }),
    });
  }

  return {
    name: form.name,
    language: form.language,
    category: form.category,
    components,
  };
};
