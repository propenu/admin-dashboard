import { countVars } from "./helper";

export const componentsToForm = (item) => {
  const bodyComp = item.components?.find((c) => c.type === "BODY") || {};
  const headerComp = item.components?.find((c) => c.type === "HEADER") || {};
  const footerComp = item.components?.find((c) => c.type === "FOOTER") || {};
  const btnComp = item.components?.find((c) => c.type === "BUTTONS") || {};
  const bodyText = bodyComp.text || "";
  const rawExamples = bodyComp.example?.body_text?.[0] || [];
  const vc = countVars(bodyText);
  const examples = Array.from({ length: vc }, (_, i) => rawExamples[i] || "");

  const hasHeader = !!item.components?.find((c) => c.type === "HEADER");
  const buttons = (btnComp.buttons || []).map((b) => ({
    type: b.type || "QUICK_REPLY",
    text: b.text || "",
    url: b.url || "",
    phone: b.phone_number || "",
    ttlMinutes: String(b.ttl_minutes || "10080"),
    flowId: b.flow_id || "",
    exampleCode: b.example || "",
  }));

  let templateType = "text";
  if (String(item.category || "").toUpperCase() === "AUTHENTICATION") {
    templateType = "authentication";
  } else if (hasHeader && headerComp.format && headerComp.format !== "TEXT") {
    templateType = "media";
  } else if (buttons.some((b) => b.type === "QUICK_REPLY")) {
    templateType = "quick_replies";
  } else if (buttons.some((b) => b.type === "URL" || b.type === "PHONE_NUMBER")) {
    templateType = "cta";
  }

  return {
    _id: item._id || item.id,
    name: item.name || "",
    language: item.language || "en",
    category: item.category || "MARKETING",
    templateType,
    header: {
      enabled: hasHeader,
      format: headerComp.format || "TEXT",
      text: headerComp.text || "",
      example: headerComp.example?.header_text?.[0] || "",
      mediaHandle:
        headerComp.example?.header_handle?.[0] ||
        headerComp.example?.header_url?.[0] ||
        "",
      mediaPreview:
        (String(headerComp.example?.header_handle?.[0] || "").startsWith("http")
          ? headerComp.example.header_handle[0]
          : null) ||
        (String(headerComp.example?.header_url?.[0] || "").startsWith("http")
          ? headerComp.example.header_url[0]
          : null),
      locationName: "",
      locationAddress: "",
    },
    body: {
      text: bodyText,
      examples,
    },
    footer: {
      enabled: !!item.components?.find((c) => c.type === "FOOTER"),
      text: footerComp.text || "",
    },
    buttons,
  };
};