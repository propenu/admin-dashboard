import { describe, expect, it } from "vitest";
import {
  buildPayload,
  validateTemplateBody,
} from "./payloadBuilder";

const realEstateSample = {
  name: "property_inquiry_followup",
  language: "en",
  category: "MARKETING",
  header: {
    enabled: true,
    format: "TEXT",
    text: "New property update",
    example: "",
    mediaHandle: "",
  },
  body: {
    text: "Hi {{1}}, thank you for your interest in *{{2}}* at {{3}}. Our advisor will share floor plans and pricing shortly. Reply if you want a site visit.",
    examples: ["Priya", "Green Valley Residences", "Gachibowli, Hyderabad"],
  },
  footer: { enabled: true, text: "Propenu Real Estate" },
  buttons: [
    {
      type: "URL",
      text: "View property",
      url: "https://propenu.com/",
      phone: "",
    },
    {
      type: "PHONE_NUMBER",
      text: "Call advisor",
      url: "",
      phone: "+919876543210",
    },
    { type: "QUICK_REPLY", text: "Book site visit", url: "", phone: "" },
  ],
};

describe("validateTemplateBody (Meta rules)", () => {
  it("rejects empty body", () => {
    const r = validateTemplateBody("");
    expect(r.ok).toBe(false);
    expect(r.errors[0].code).toBe("EMPTY_BODY");
  });

  it("rejects named variables", () => {
    const r = validateTemplateBody("Hello {{name}}, welcome!");
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "NAMED_VARS")).toBe(true);
  });

  it("rejects variable at start or end", () => {
    expect(validateTemplateBody("{{1}} welcome to Propenu.").ok).toBe(false);
    expect(validateTemplateBody("Welcome customer {{1}}").ok).toBe(false);
  });

  it("accepts real-estate sample body", () => {
    const r = validateTemplateBody(realEstateSample.body.text);
    expect(r.ok).toBe(true);
    expect(r.varCount).toBe(3);
  });
});

describe("buildPayload Meta metadata", () => {
  it("builds HEADER + BODY + FOOTER + BUTTONS for real-estate sample", () => {
    const payload = buildPayload(realEstateSample);

    expect(payload).toEqual({
      name: "property_inquiry_followup",
      language: "en",
      category: "MARKETING",
      components: expect.any(Array),
    });

    const types = payload.components.map((c) => c.type);
    expect(types).toEqual(["HEADER", "BODY", "FOOTER", "BUTTONS"]);

    const header = payload.components.find((c) => c.type === "HEADER");
    expect(header).toMatchObject({
      type: "HEADER",
      format: "TEXT",
      text: "New property update",
    });

    const body = payload.components.find((c) => c.type === "BODY");
    expect(body.text).toContain("{{1}}");
    expect(body.example.body_text[0]).toEqual([
      "Priya",
      "Green Valley Residences",
      "Gachibowli, Hyderabad",
    ]);

    const footer = payload.components.find((c) => c.type === "FOOTER");
    expect(footer.text).toBe("Propenu Real Estate");

    const buttons = payload.components.find((c) => c.type === "BUTTONS");
    expect(buttons.buttons).toEqual([
      {
        type: "URL",
        text: "View property",
        url: "https://propenu.com/",
      },
      {
        type: "PHONE_NUMBER",
        text: "Call advisor",
        phone_number: "+919876543210",
      },
      { type: "QUICK_REPLY", text: "Book site visit" },
    ]);
  });

  it("builds IMAGE header with header_handle", () => {
    const payload = buildPayload({
      name: "project_launch",
      language: "en",
      category: "MARKETING",
      header: {
        enabled: true,
        format: "IMAGE",
        text: "",
        mediaHandle: "https://cdn.example.com/project.jpg",
      },
      body: {
        text: "Hello {{1}}, the new project brochure is ready for you today.",
        examples: ["Ravi"],
      },
      footer: { enabled: false, text: "" },
      buttons: [],
    });

    const header = payload.components.find((c) => c.type === "HEADER");
    expect(header).toEqual({
      type: "HEADER",
      format: "IMAGE",
      example: { header_handle: ["https://cdn.example.com/project.jpg"] },
    });
  });

  it("builds LOCATION header without sample handle", () => {
    const payload = buildPayload({
      name: "site_visit_location",
      language: "en",
      category: "UTILITY",
      header: {
        enabled: true,
        format: "LOCATION",
        text: "",
        mediaHandle: "",
      },
      body: {
        text: "Hi {{1}}, your site visit pin is above. See you at the project gate.",
        examples: ["Suresh"],
      },
      footer: { enabled: false, text: "" },
      buttons: [],
    });

    const header = payload.components.find((c) => c.type === "HEADER");
    expect(header).toEqual({ type: "HEADER", format: "LOCATION" });
  });

  it("includes header_text example when header has {{1}}", () => {
    const payload = buildPayload({
      name: "visit_reminder",
      language: "en",
      category: "UTILITY",
      header: {
        enabled: true,
        format: "TEXT",
        text: "Visit for {{1}}",
        example: "Skyline Towers",
      },
      body: {
        text: "Hi {{1}}, your site visit is confirmed for tomorrow morning.",
        examples: ["Ananya"],
      },
      footer: { enabled: false, text: "" },
      buttons: [],
    });

    const header = payload.components.find((c) => c.type === "HEADER");
    expect(header.example.header_text).toEqual(["Skyline Towers"]);
  });

  it("rejects more than 2 URL buttons", () => {
    expect(() =>
      buildPayload({
        ...realEstateSample,
        buttons: [
          { type: "URL", text: "A", url: "https://a.com" },
          { type: "URL", text: "B", url: "https://b.com" },
          { type: "URL", text: "C", url: "https://c.com" },
        ],
      }),
    ).toThrow(/At most 2 Visit website/);
  });

  it("rejects missing button URL", () => {
    expect(() =>
      buildPayload({
        ...realEstateSample,
        buttons: [{ type: "URL", text: "Open", url: "", phone: "" }],
      }),
    ).toThrow(/website URL is required/);
  });

  it("requires template name", () => {
    expect(() =>
      buildPayload({ ...realEstateSample, name: "" }),
    ).toThrow(/Template name is required/);
  });
});
