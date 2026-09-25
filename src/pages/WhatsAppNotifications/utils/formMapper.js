import { countVars } from "./helper";

function firstHttpUrl(...candidates) {
  for (const raw of candidates) {
    if (Array.isArray(raw)) {
      const nested = firstHttpUrl(...raw);
      if (nested) return nested;
      continue;
    }
    const url = String(raw ?? "").trim();
    if (/^https?:\/\//i.test(url)) return url;
  }
  return "";
}

function headerComponent(item) {
  return (
    (item?.components || []).find(
      (c) => String(c?.type || "").toUpperCase() === "HEADER",
    ) || {}
  );
}

/** Public HTTPS preview URL from Meta sample / stored template fields. */
export function resolveHeaderMediaPreview(item) {
  if (!item) return "";
  const header = headerComponent(item);
  const fromMeta = firstHttpUrl(
    item?.header?.mediaPreview,
    item?.header?.mediaHandle,
    item?.headerImageUrl,
    item?.sampleMediaUrl,
    item?.sampleImageUrl,
    item?.samplePreviewUrl,
    header?.example?.header_handle,
    header?.example?.header_url,
    header?.example?.header_handle?.[0],
    header?.example?.header_url?.[0],
  );
  if (fromMeta) return fromMeta;

  // Fallback: S3 preview saved at template create time (same browser).
  try {
    const name = String(item?.name || "").trim();
    if (!name || typeof localStorage === "undefined") return "";
    const map = JSON.parse(
      localStorage.getItem("propenu.wa.templateMediaPreview.v1") || "{}",
    );
    const cached = String(map[name] || "").trim();
    if (/^https?:\/\//i.test(cached)) return cached;
  } catch {
    /* ignore */
  }
  return "";
}

/** True when template has a create-time media sample (http URL or Meta handle). */
export function templateHasHeaderMediaSample(item) {
  if (!item) return false;
  if (resolveHeaderMediaPreview(item)) return true;
  const header = headerComponent(item);
  const handle = String(
    header?.example?.header_handle?.[0] ||
      header?.example?.header_handle ||
      item?.header?.mediaHandle ||
      "",
  ).trim();
  return Boolean(handle);
}

export const componentsToForm = (item) => {
  const bodyComp = item.components?.find((c) => c.type === "BODY") || {};
  const headerComp = headerComponent(item);
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

  const mediaPreview = resolveHeaderMediaPreview(item);
  const mediaHandle =
    headerComp.example?.header_handle?.[0] ||
    (typeof headerComp.example?.header_handle === "string"
      ? headerComp.example.header_handle
      : "") ||
    headerComp.example?.header_url?.[0] ||
    "";

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
      mediaHandle,
      mediaPreview: mediaPreview || null,
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
