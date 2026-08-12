/** Helpers for Sales Executive Hub (client + meeting + inventory workspace). */

export const HUB_DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "custom", label: "Custom" },
];

export const HUB_CLIENT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "meetings", label: "Meetings" },
  { key: "properties", label: "Properties" },
  { key: "projects", label: "Projects" },
  { key: "subscription", label: "Subscription" },
  { key: "followups", label: "Follow-ups" },
];

export const HUB_JOURNEY = [
  "Find client (location)",
  "View history",
  "Meet & punch",
  "Save result",
  "Handle property / project",
  "Subscription & follow-up",
];

export const HUB_TODAY_CHECKLIST = [
  "Meet clients",
  "Punch visits",
  "Update results",
  "Push listings live",
  "Track subscription",
  "Close follow-ups",
];

const asId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || "").trim();
  }
  return String(value).trim();
};

export const pickItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const dedupeById = (rows) => {
  const seen = new Set();
  return (rows || []).filter((row) => {
    const id = asId(row?._id || row?.id);
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const clientId = (client) => asId(client?._id || client?.id || client?.userId);

export const clientRoleLabel = (client) => {
  const raw = String(
    client?.roleName ||
      client?.role?.name ||
      client?.role ||
      client?.accountType ||
      "user",
  )
    .toLowerCase()
    .replace(/_/g, " ");
  if (raw.includes("builder")) return "Builder";
  if (raw.includes("agent")) return "Agent";
  if (raw.includes("owner") || raw === "user" || raw === "users") return "Owner";
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()) || "Client";
};

export const clientLocation = (client) => {
  const city = String(client?.city || client?.workingCity || "").trim();
  const locality = String(client?.locality || client?.area || "").trim();
  const state = String(client?.state || "").trim();
  const pincode = String(client?.pincode || client?.pinCode || "").trim();
  return {
    state,
    city,
    locality,
    pincode,
    line: [locality, city, state].filter(Boolean).join(", ") || "No location",
    region:
      city || locality
        ? [city, locality].filter(Boolean).join(" · ")
        : state || "Other locations",
  };
};

export const bucketStatus = (item) => {
  const raw = String(
    item?.status || item?.approval?.status || item?.accountStatus || "",
  ).toLowerCase();
  if (["draft", "incomplete"].includes(raw)) return "draft";
  if (
    ["pending", "onboarding", "under_review", "awaiting"].some((s) =>
      raw.includes(s),
    )
  ) {
    return "pending";
  }
  if (
    ["active", "live", "published", "approved", "verified", "paid"].some((s) =>
      raw.includes(s),
    )
  ) {
    return "active";
  }
  return raw || "unknown";
};

export const countByBucket = (rows) => {
  const counts = { draft: 0, pending: 0, active: 0, other: 0 };
  (rows || []).forEach((row) => {
    const bucket = bucketStatus(row);
    if (counts[bucket] != null) counts[bucket] += 1;
    else counts.other += 1;
  });
  return counts;
};

const digits = (value) => String(value || "").replace(/\D/g, "");
const normText = (value) => String(value || "").trim().toLowerCase();

export const meetingMatchesClient = (meeting, client) => {
  if (!meeting || !client) return false;
  const cid = clientId(client);
  const meetingUserIds = [
    meeting?.client?.userId,
    meeting?.client?._id,
    ...(Array.isArray(meeting?.people) ? meeting.people.map((p) => p?.userId || p?._id) : []),
  ]
    .map(asId)
    .filter(Boolean);
  if (cid && meetingUserIds.includes(cid)) return true;

  const clientPhone = digits(client?.phone || client?.mobile || client?.contact);
  const meetingPhones = [
    meeting?.client?.phone,
    ...(Array.isArray(meeting?.people) ? meeting.people.map((p) => p?.phone) : []),
  ]
    .map(digits)
    .filter((p) => p.length >= 8);
  if (
    clientPhone.length >= 8 &&
    meetingPhones.some(
      (p) => p.endsWith(clientPhone.slice(-10)) || clientPhone.endsWith(p.slice(-10)),
    )
  ) {
    return true;
  }

  const clientEmail = normText(client?.email);
  const meetingEmails = [
    meeting?.client?.email,
    ...(Array.isArray(meeting?.people) ? meeting.people.map((p) => p?.email) : []),
  ]
    .map(normText)
    .filter(Boolean);
  if (clientEmail && meetingEmails.includes(clientEmail)) return true;

  const clientName = normText(client?.name || client?.fullName);
  const meetingNames = [
    meeting?.client?.name,
    ...(Array.isArray(meeting?.people) ? meeting.people.map((p) => p?.name) : []),
  ]
    .map(normText)
    .filter(Boolean);
  if (clientName.length >= 3 && meetingNames.some((n) => n.includes(clientName) || clientName.includes(n))) {
    return true;
  }

  return false;
};

export const meetingResultText = (meeting) => {
  const next = meeting?.nextAction;
  if (next?.result || next?.outcome || next?.note) {
    return String(next.result || next.outcome || next.note);
  }
  if (meeting?.outcome || meeting?.result) {
    return String(meeting.outcome || meeting.result);
  }
  if (meeting?.punchOutAt && next && next.status !== "done" && next.status !== "skipped") {
    return "Follow-up due after punch out";
  }
  if (meeting?.punchOutAt) return "Visit completed";
  if (meeting?.punchInAt) return "In field — punched in";
  return String(meeting?.status || "Planned").replace(/_/g, " ");
};

export const meetingNotesText = (meeting) =>
  String(
    meeting?.notes ||
      meeting?.summary ||
      meeting?.agenda ||
      meeting?.nextAction?.description ||
      meeting?.nextAction?.title ||
      "",
  ).trim();

export const formatShortDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isFollowUpOpen = (meeting) => {
  const na = meeting?.nextAction;
  if (!na) return false;
  if (na.status === "done" || na.status === "skipped") return false;
  return Boolean(meeting?.punchOutAt) || na.status === "due" || na.isDue;
};

export const isMeetingToday = (meeting) => {
  const start = meeting?.scheduledStart || meeting?.punchInAt || meeting?.createdAt;
  if (!start) return false;
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export const groupClientsByLocation = (clients) => {
  const groups = new Map();
  (clients || []).forEach((client) => {
    const loc = clientLocation(client);
    const key = loc.city || loc.state || "Other locations";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(client);
  });
  return [...groups.entries()].map(([region, rows]) => ({ region, rows }));
};

export const filterClients = (clients, { q, state, city, pincode, locality }) => {
  const query = normText(q);
  return (clients || []).filter((client) => {
    const loc = clientLocation(client);
    if (state && loc.state !== state) return false;
    if (city && loc.city !== city) return false;
    if (pincode && loc.pincode !== pincode) return false;
    if (locality && loc.locality !== locality) return false;
    if (!query) return true;
    const hay = [
      client?.name,
      client?.email,
      client?.phone,
      client?.mobile,
      loc.line,
      clientRoleLabel(client),
    ]
      .map(normText)
      .join(" ");
    return hay.includes(query);
  });
};

export const uniqueSorted = (values) =>
  [...new Set((values || []).map((v) => String(v || "").trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );

export const subscriptionSummary = (subscriptions = [], payments = []) => {
  const active = (subscriptions || []).find((s) =>
    ["active", "paid", "live"].includes(String(s?.status || "").toLowerCase()),
  );
  if (active) {
    return {
      plan: active.planName || active.plan?.name || active.title || "Plan",
      status: "Active",
      renewsAt: active.endDate || active.expiresAt || active.nextBillingAt || null,
      raw: active,
    };
  }
  const latestPay = (payments || [])[0];
  if (latestPay) {
    return {
      plan: latestPay.planName || latestPay.title || "Payment",
      status: String(latestPay.status || "paid"),
      renewsAt: latestPay.endDate || latestPay.paidAt || null,
      raw: latestPay,
    };
  }
  return null;
};

export const inventoryTitle = (item) =>
  item?.title || item?.projectName || item?.buildingName || item?.name || "Untitled";
