export const EMPTY_BUTTON = {
  type: "QUICK_REPLY",
  text: "",
  url: "",
  phone: "",
  ttlMinutes: "10080",
  flowId: "",
  exampleCode: "",
};

export const EMPTY_FORM = {
  name: "",
  language: "en",
  category: "MARKETING",
  templateType: "text",
  header: {
    enabled: false,
    format: "TEXT",
    text: "",
    example: "",
    mediaHandle: "",
    mediaPreview: null,
    locationName: "",
    locationAddress: "",
  },
  body: { text: "", examples: [] },
  footer: { enabled: false, text: "" },
  buttons: [],
};
