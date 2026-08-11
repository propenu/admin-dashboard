export const MEETING_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "planned", label: "Planned" },
  { value: "prep_pending", label: "Prep Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "draft", label: "Draft" },
  // cancelled kept for old records only (action removed from UI)
  { value: "cancelled", label: "Cancelled" },
];

/** Menu actions — cancel intentionally omitted (CRM: complete / confirm / reschedule). */
export const MEETING_STATUS_ACTIONS = [
  { value: "completed", label: "Mark completed (punch out)" },
  { value: "confirmed", label: "Mark confirmed" },
  { value: "rescheduled", label: "Mark rescheduled" },
];

/** Active meeting types in the schedule wizard (shown separately). */
export const MEETING_TYPES = [
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "service_meeting", label: "Service Meeting" },
  { value: "office_meeting", label: "Office Meeting" },
  { value: "video_call", label: "Video Call" },
  { value: "phone_call", label: "Phone Call" },
  { value: "follow_up", label: "Follow-up" },
];

/** Legacy types kept only for labels on older meetings (not in dropdown). */
const LEGACY_MEETING_TYPE_LABELS = {
  site_visit: "Site Visit",
  property_discussion: "Property Discussion",
  builder_meeting: "Builder Meeting",
};

/** Place options shown under Meeting type (when relevant) */
export const MEETING_PLACE_OPTIONS = {
  sales: [
    { value: "on_site", label: "On site" },
    { value: "off_site", label: "Off site" },
    { value: "office", label: "Office" },
  ],
  marketing: [
    { value: "on_site", label: "On site" },
    { value: "off_site", label: "Off site" },
    { value: "office", label: "Office" },
  ],
  service_meeting: [
    { value: "on_site", label: "On site" },
    { value: "off_site", label: "Off site" },
    { value: "office", label: "Office" },
  ],
  office_meeting: [
    { value: "office", label: "Office" },
    { value: "on_site", label: "On site" },
    { value: "off_site", label: "Off site" },
  ],
  follow_up: [
    { value: "office", label: "Office" },
    { value: "on_site", label: "On site" },
    { value: "off_site", label: "Off site" },
  ],
  video_call: [{ value: "remote", label: "Remote" }],
  phone_call: [{ value: "remote", label: "Remote" }],
};

export const defaultMeetingPlace = (meetingType) => {
  const opts = MEETING_PLACE_OPTIONS[meetingType];
  if (opts?.length) return opts[0].value;
  if (meetingType === "video_call" || meetingType === "phone_call") return "remote";
  if (meetingType === "follow_up") return "office";
  return "on_site";
};

export const meetingPlaceLabel = (place) => {
  if (!place) return "";
  const all = Object.values(MEETING_PLACE_OPTIONS).flat();
  return (
    all.find((o) => o.value === place)?.label ||
    String(place).replace(/_/g, " ")
  );
};

/** CRM entry intent — chosen on wizard step 1 */
export const VISIT_LOGGING_MODES = [
  {
    value: "scheduled",
    label: "Schedule ahead",
    short: "Plan",
    hint: "Book a future visit. Prep tasks apply; status starts as Planned.",
  },
  {
    value: "walk_in",
    label: "Walk-in now",
    short: "Walk-in",
    hint: "Sudden / unplanned visit happening now. Logged as Confirmed.",
  },
  {
    value: "already_visited",
    label: "Already visited",
    short: "Done",
    hint: "Visit already happened. Confirm once, add outcome, log as Completed.",
  },
];

export const ROLE_PAGE_META = {
  sales_executive: { title: "Field Meetings", subtitle: "Sales Executive", mode: "se" },
  sales_agent: { title: "Field Meetings", subtitle: "Sales Executive", mode: "se" },
  business_development_manager: {
    title: "Team Field CRM",
    subtitle: "Business Development Manager",
    mode: "manager",
  },
  sales_manager: {
    title: "Team Field CRM",
    subtitle: "Sales Manager",
    mode: "manager",
  },
  regional_manager: {
    title: "Region Coverage",
    subtitle: "Regional Manager",
    mode: "region",
  },
  business_development_head: {
    title: "Sales Field Command",
    subtitle: "Business Development Head",
    mode: "head",
  },
  operations_head: {
    title: "Sales Field Command",
    subtitle: "Operations Head",
    mode: "head",
  },
  super_admin: {
    title: "Sales Field Command",
    subtitle: "Super Admin",
    mode: "head",
  },
  admin: {
    title: "Sales Field Command",
    subtitle: "Admin",
    mode: "head",
  },
};

export const normalizeRole = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getPageMeta = (roleName) => {
  const key = normalizeRole(roleName);
  const alias = key === "sales_agent" ? "sales_executive" : key;
  return (
    ROLE_PAGE_META[alias] || {
      title: "Field Meetings",
      subtitle: "Sales hierarchy",
      mode: "se",
    }
  );
};

export const initials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase() || "?";

export const formatMeetingDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatMeetingTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatLongDate = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "long",
  });
};

export const locationLine = (loc = {}) =>
  [loc.locality, loc.city, loc.state].filter(Boolean).join(", ") || "No location";

export const modeLabel = (mode, meetingType) => {
  if (mode === "video" || meetingType === "video_call") return "Video";
  if (mode === "phone" || meetingType === "phone_call") return "Phone";
  return "In-person";
};

export const statusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "planned") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "prep_pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "confirmed") return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s === "completed") return "bg-slate-100 text-slate-700 border-slate-200";
  if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  if (s === "rescheduled") return "bg-sky-50 text-sky-700 border-sky-200";
  if (s === "draft") return "bg-slate-50 text-slate-500 border-slate-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

export const statusLabel = (status) => {
  const found = MEETING_STATUS_OPTIONS.find((o) => o.value === status);
  return found?.label || String(status || "Unknown").replace(/_/g, " ");
};

export const meetingTypeLabel = (type) =>
  MEETING_TYPES.find((t) => t.value === type)?.label ||
  LEGACY_MEETING_TYPE_LABELS[type] ||
  String(type || "").replace(/_/g, " ");

export const isRemoteMeeting = (type) =>
  type === "video_call" || type === "phone_call";

export const toIsoDateInput = (d = new Date()) => {
  const x = d instanceof Date ? d : new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const PERSON_TITLES = [
  { value: "CEO", label: "CEO" },
  { value: "Director", label: "Director" },
  { value: "Head", label: "Head" },
  { value: "Manager", label: "Manager" },
  { value: "Owner", label: "Owner" },
  { value: "Partner", label: "Partner" },
  { value: "Agent", label: "Agent" },
  { value: "Builder", label: "Builder" },
  { value: "Other", label: "Other" },
];

export const defaultWizardState = () => ({
  step: 1,
  /** @type {"scheduled"|"walk_in"|"already_visited"} */
  loggingMode: "scheduled",
  /** Required when loggingMode === already_visited */
  visitConfirmed: false,
  /** Short CRM outcome for completed / already-visited logs */
  outcome: "",
  /** @type {Array<object>} all people at this meeting */
  people: [],
  client: null,
  createClient: null,
  meetingType: "sales",
  meetingPlace: "on_site",
  date: toIsoDateInput(),
  startTime: "10:00",
  endTime: "11:00",
  location: { state: "", city: "", locality: "" },
  linkedProperty: null,
  objective: "qualification",
  notes: "",
  prepChecks: {
    review_client: true,
    review_properties: true,
    check_inventory: false,
    check_pricing: false,
    prepare_documents: false,
    confirm_location: true,
  },
  customPrepNote: "",
});
