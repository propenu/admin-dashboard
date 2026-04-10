export const componentsToForm = (item) => {
  const bodyComp = item.components?.find((c) => c.type === "BODY") || {};
  const headerComp = item.components?.find((c) => c.type === "HEADER") || {};
  const footerComp = item.components?.find((c) => c.type === "FOOTER") || {};
  const btnComp = item.components?.find((c) => c.type === "BUTTONS") || {};
  return {
    _id: item._id || item.id,
    name: item.name || "",
    language: item.language || "en",
    category: item.category || "UTILITY",
    header: {
      enabled: !!item.components?.find((c) => c.type === "HEADER"),
      format: headerComp.format || "TEXT",
      text: headerComp.text || "",
      mediaHandle: headerComp.example?.header_handle?.[0] || "",
      mediaPreview: null,
    },
    body: {
      text: bodyComp.text || "",
      examples: bodyComp.example?.body_text?.[0] || [],
    },
    footer: {
      enabled: !!item.components?.find((c) => c.type === "FOOTER"),
      text: footerComp.text || "",
    },
    buttons: (btnComp.buttons || []).map((b) => ({
      type: b.type || "QUICK_REPLY",
      text: b.text || "",
      url: b.url || "",
      phone: b.phone_number || "",
    })),
  };
};