

import { countVars } from "./helper";

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const validateBody = (text) => {
  const varMatches = text.match(/{{\d+}}/g) || [];
  const varCount = varMatches.length;
  const wordCount = countWords(text);

  if (varCount > 0 && wordCount / varCount < 2) {
    throw new Error(
      "Too many variables for message length. Please add more text.",
    );
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
      throw new Error("All variable examples are required");
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