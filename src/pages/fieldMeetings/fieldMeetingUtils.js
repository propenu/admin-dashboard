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
  { value: "completed", label: "Punch out (complete)" },
  { value: "confirmed", label: "Mark confirmed" },
  { value: "rescheduled", label: "Mark rescheduled" },
];

/** Salesforce-style CRM stages shown to staff */
export const CRM_STAGE_COPY = {
  not_started: {
    label: "Not started",
    hint: "Create the meeting to punch in.",
  },
  waiting_punch_out: {
    label: "Punched in — waiting",
    hint: "Stay in the field visit. Punch out unlocks after 15 minutes.",
  },
  ready_to_punch_out: {
    label: "Ready to punch out",
    hint: "15 minutes done. Use Punch out (complete).",
  },
  follow_up: {
    label: "Follow-up due",
    hint: "Meeting punched out. Do the next CRM action now.",
  },
  closed: {
    label: "Closed",
    hint: "Visit and follow-up finished.",
  },
};

export const formatPunchWaitLabel = (meeting) => {
  if (meeting?.punchOutAt) return "Punched out";
  if (!meeting?.punchInAt) return "Not punched in";
  const mins = Number(meeting.punchOutWaitMinutesRemaining || 0);
  if (meeting.canPunchOut || mins <= 0) return "Ready to punch out";
  return `Punch out in ${mins}m`;
};

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
    hint: "Book a visit — punches you in. Wait 15m before punch out.",
  },
  {
    value: "walk_in",
    label: "Walk-in now",
    short: "Walk-in",
    hint: "Visit starting now — punches you in. Wait 15m before punch out.",
  },
  {
    value: "already_visited",
    label: "Already visited",
    short: "Done",
    hint: "Past visit — completed immediately; CRM follow-up due now.",
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
  {
    value: "CEO",
    label: "CEO",
    tone: "bg-violet-100 text-violet-800 border-violet-200",
    active: "bg-violet-600 text-white border-violet-600",
    dot: "bg-violet-500",
  },
  {
    value: "Director",
    label: "Director",
    tone: "bg-indigo-100 text-indigo-800 border-indigo-200",
    active: "bg-indigo-600 text-white border-indigo-600",
    dot: "bg-indigo-500",
  },
  {
    value: "Head",
    label: "Head",
    tone: "bg-sky-100 text-sky-800 border-sky-200",
    active: "bg-sky-600 text-white border-sky-600",
    dot: "bg-sky-500",
  },
  {
    value: "Manager",
    label: "Manager",
    tone: "bg-blue-100 text-blue-800 border-blue-200",
    active: "bg-blue-600 text-white border-blue-600",
    dot: "bg-blue-500",
  },
  {
    value: "Sales Manager",
    label: "Sales Manager",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    active: "bg-emerald-600 text-white border-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    value: "Sales",
    label: "Sales",
    tone: "bg-teal-100 text-teal-800 border-teal-200",
    active: "bg-teal-600 text-white border-teal-600",
    dot: "bg-teal-500",
  },
  {
    value: "Owner",
    label: "Owner",
    tone: "bg-amber-100 text-amber-900 border-amber-200",
    active: "bg-amber-500 text-white border-amber-500",
    dot: "bg-amber-500",
  },
  {
    value: "Partner",
    label: "Partner",
    tone: "bg-orange-100 text-orange-800 border-orange-200",
    active: "bg-orange-500 text-white border-orange-500",
    dot: "bg-orange-500",
  },
  {
    value: "Agent",
    label: "Agent",
    tone: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    active: "bg-fuchsia-600 text-white border-fuchsia-600",
    dot: "bg-fuchsia-500",
  },
  {
    value: "Builder",
    label: "Builder",
    tone: "bg-lime-100 text-lime-800 border-lime-200",
    active: "bg-lime-600 text-white border-lime-600",
    dot: "bg-lime-500",
  },
  {
    value: "Other",
    label: "Other",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
    active: "bg-slate-600 text-white border-slate-600",
    dot: "bg-slate-500",
  },
];

export const getPersonTitleMeta = (value) =>
  PERSON_TITLES.find((t) => t.value === value) || PERSON_TITLES[PERSON_TITLES.length - 1];

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
