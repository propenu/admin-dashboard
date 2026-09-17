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
    if (form.header.format !== "TEXT" && !form.header.mediaHandle) {
      throw new Error("Header media is required");
    }

    const h = { type: "HEADER", format: form.header.format };

    if (form.header.format === "TEXT") {
      h.text = form.header.text;
    } else {
      h.example = {
        header_handle: [form.header.mediaHandle],
      };
    }

    components.push(h);
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
    components.push({ type: "FOOTER", text: form.footer.text });
  }

  // BUTTONS
  if (form.buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: form.buttons.map((b) => {
        if (!b.text) throw new Error("Button text required");

        const btn = { type: b.type, text: b.text };
        if (b.type === "URL") btn.url = b.url;
        if (b.type === "PHONE_NUMBER") btn.phone_number = b.phone;

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
