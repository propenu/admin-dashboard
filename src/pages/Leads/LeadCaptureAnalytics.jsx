/* eslint-disable no-unused-vars -- icon components are also rendered from data-driven tuples */
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  CircleDot,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  Gauge,
  Globe2,
  ListFilter,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Monitor,
  MousePointer2,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Target,
  UserCheck,
  UserRound,
  Users,
  Wifi,
} from "lucide-react";
import { apiClient } from "../../api/apiClient";
import { getAllUsers } from "../../features/user/userService";
import {
  getUserFeaturedProjects,
  getUserProperties,
} from "../../features/user/userDetailService";

const roles = ["user", "builder", "builder_staff", "agent"];
const title = (value = "") =>
  String(value || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
const initials = (name = "User") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const listingName = (item = {}) =>
  item.projectName || item.propertyTitle || item.title || item.name || "Untitled listing";
const listingLocation = (item = {}) =>
  [item.locality, item.city, item.state].filter(Boolean).join(", ") ||
  item.location ||
  "Location unavailable";
const listingImage = (item = {}) => {
  const candidate =
    item.thumbnail ||
    item.coverImage ||
    item.projectCoverImage ||
    item.heroImage ||
    item.projectImage ||
    item.logo ||
    item.images?.[0] ||
    item.propertyImages?.[0] ||
    item.gallery?.[0];
  return typeof candidate === "string"
    ? candidate
    : candidate?.url || candidate?.secure_url || candidate?.src || "";
};
const maskPhone = (phone = "") =>
  phone ? `${phone.slice(0, 5)}••••${phone.slice(-2)}` : "Phone unavailable";
const seed = (value = "propenu") =>
  [...String(value)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
const demoEvents = [
  [
    "10:29:23",
    "OTP verification failed",
    "Site visit / OTP",
    "—",
    "Attempt 1",
    "risk",
  ],
  ["10:28:45", "Form started", "Green Acres / Enquire", "38s", "Site visit"],
  ["10:28:05", "WhatsApp clicked", "Green Acres · Plot 145", "20s", "Assisted"],
  [
    "10:27:00",
    "Price calculator used",
    "Green Acres · Plot 145",
    "1m 10s",
    "Budget ₹48L",
  ],
  ["10:25:50", "Brochure downloaded", "Green Acres · Plot 145", "45s", "PDF"],
  ["10:23:59", "Gallery viewed", "Green Acres · Plot 145", "55s", "12 images"],
  [
    "10:23:04",
    "Property viewed",
    "Green Acres · Plot 145",
    "2m 38s",
    "View #3",
  ],
  ["10:20:16", "Map opened", "Search results", "30s", "West Hyderabad"],
  [
    "10:18:31",
    "Filter applied",
    "Plot search",
    "1m 21s",
    "₹35–55L · 200–300 sq yd",
  ],
  [
    "10:17:19",
    "Search performed",
    "Plot search",
    "1m 12s",
    "Plots in West Hyderabad",
  ],
];
const stages = [
  ["Acquisition", "Google Organic", "Campaign / plots", 100],
  ["Sign Up", "Registered", "24 sessions", 100],
  ["Search", "West Hyderabad", "₹35–55L", 92],
  ["Explore", "3 properties", "8m 16s", 88],
  ["Compare", "Plots 145 + 78", "3 comparisons", 50],
  ["Enquire", "Site visit form", "WhatsApp + form", 17],
  ["Stopped", "OTP verification", "Idle for 6m 18s", 4, true],
];
const demoProperties = [
  ["Green Acres · Plot 145", 96, 9, "8m 16s", "High"],
  ["Riverfront · Plot 78", 83, 6, "4m 05s", "Medium"],
  ["Hill View · Plot 203", 72, 4, "2m 10s", "Medium"],
  ["Sunrise County · Plot 54", 61, 2, "1m 45s", "Low"],
];

const eventLabel = (value = "activity") =>
  title(String(value).replace(/([a-z])([A-Z])/g, "$1 $2"));
const entityFor = (event = {}) =>
  event.entity || event.project || event.property || {};
const entityName = (event = {}) =>
  entityFor(event).title ||
  event.metadata?.title ||
  event.metadata?.name ||
  event.pageUrl ||
  "Propenu";
const entityImage = (event = {}) => entityFor(event).image || null;
const normalizeJourney = (person, payload = {}) => {
  const rawEvents = Array.isArray(payload.events) ? payload.events : [];
  const summary = payload.summary || {};
  const sessions = Number(
    summary.totalSessions ?? payload.sessions?.length ?? 0,
  );
  const events = rawEvents.map((event, index) => {
    const stamp =
      event.serverTimestamp || event.createdAt || event.clientTimestamp;
    const time = stamp
      ? new Date(stamp).toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "--:--:--";
    const metadata = event.metadata || {};
    const entity = entityName(event);
    const detail =
      metadata.query ||
      metadata.section ||
      metadata.promotionType ||
      metadata.source ||
      `Event ${index + 1}`;
    return [
      time,
      eventLabel(event.eventType),
      entity,
      event.durationMs ? `${Math.round(event.durationMs / 1000)}s` : "—",
      String(detail),
      /fail|error|abandon/i.test(event.eventType || "") ? "risk" : "",
    ];
  });
  const count = (...needles) =>
    rawEvents.filter((event) =>
      needles.some((needle) =>
        String(event.eventType || "")
          .toLowerCase()
          .includes(needle),
      ),
    ).length;
  const meaningful = count(
    "view",
    "shortlist",
    "contact",
    "whatsapp",
    "lead",
    "visit",
  );
  const engagedMs = rawEvents.reduce(
    (total, event) =>
      total +
      Number(
        event.durationMs ||
          event.metadata?.durationMs ||
          event.metadata?.activeMs ||
          0,
      ),
    0,
  );
  return {
    ...payload,
    rawEvents,
    isPreview: false,
    online:
      Date.now() -
        new Date(
          summary.lastActiveAt || payload.currentContext?.lastActiveAt || 0,
        ).getTime() <=
      2 * 60 * 1000,
    journeyScore: Math.min(
      100,
      Math.round(35 + sessions * 4 + meaningful * 1.5),
    ),
    buyingIntent: Math.min(
      100,
      Math.round(
        30 +
          count("view") * 2 +
          count("shortlist") * 8 +
          count("contact", "whatsapp", "lead", "visit") * 10,
      ),
    ),
    sessions,
    engagedMinutes: Math.max(
      0,
      Math.round(Number(summary.engagedMs ?? engagedMs) / 60000),
    ),
    propertiesViewed: Number(
      summary.propertiesViewed ?? count("property_view"),
    ),
    projectsViewed: Number(summary.projectsViewed ?? count("project_view")),
    shortlisted: count("shortlist", "favorite", "saved"),
    leads: count("lead", "contact", "enquiry", "whatsapp"),
    siteVisits: count("site_visit", "visit_book"),
    events,
    currentContext: payload.currentContext || {},
    person,
  };
};

function Avatar({ user, size = "h-10 w-10" }) {
  return user?.profileImage ? (
    <img
      src={user.profileImage}
      alt=""
      className={`${size} rounded-full object-cover ring-2 ring-white`}
    />
  ) : (
    <div
      className={`${size} grid place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 font-black text-white ring-2 ring-white`}
    >
      {initials(user?.name)}
    </div>
  );
}
function Chip({ children, tone = "green" }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[8px] font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
function Panel({ title: heading, subtitle, children, action, className = "" }) {
  return (
    <section className={`uj-panel ${className}`}>
      <header className="flex min-h-11 items-center justify-between border-b border-slate-100 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-black text-slate-800">{heading}</h2>
          {subtitle && <p className="text-[8px] text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
function Metric({ icon, label, value, suffix, change, tone = "green" }) {
  const colors = {
    green: "text-emerald-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
    violet: "text-violet-600",
  };
  return (
    <div className="min-w-0 border-r border-slate-100 px-3 py-2 last:border-r-0">
      <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
        {createElement(icon, { size: 11, className: colors[tone] })}
        {label}
      </div>
      <div className="mt-1 flex items-end gap-1">
        <strong className="text-xl leading-none text-slate-900">{value}</strong>
        {suffix && <span className="text-[8px] text-slate-500">{suffix}</span>}
        {change && (
          <span className="ml-auto text-[8px] font-bold text-emerald-600">
            ↗ {change}
          </span>
        )}
      </div>
    </div>
  );
}
function preview(user) {
  const n = seed(user?._id || user?.email || user?.name);
  return {
    isPreview: true,
    online: true,
    journeyScore: 82 + (n % 12),
    buyingIntent: 88 + (n % 9),
    sessions: 16 + (n % 13),
    engagedMinutes: 260 + (n % 100),
    propertiesViewed: 27 + (n % 21),
    shortlisted: 5 + (n % 6),
    leads: 2 + (n % 4),
    siteVisits: n % 3,
    events: demoEvents,
  };
}

function JourneyMap() {
  const simple = [
    ["Acquisition", "G", "Google Organic", "May 22, 10:14 AM", "Entry 100%"],
    ["Sign Up", "U", "Registered", "May 22, 10:16 AM", "24 sessions"],
    [
      "Search",
      "Q",
      "Plots in West Hyderabad",
      "May 22, 10:17 AM",
      "92% reached",
    ],
    ["Explore", "F", "Filters Applied", "Rs35L - Rs55L", "88% reached"],
  ];
  return (
    <div className="uj-journey-canvas">
      <div className="uj-journey-legend">
        <span className="text-emerald-600">— Completed</span>
        <span className="text-blue-500">— Exploring</span>
        <span className="text-orange-500">— Friction / Drop-off</span>
        <em>All times in IST</em>
      </div>
      <div className="uj-journey-grid">
        {simple.map(([name, icon, detail, meta, reach], index) => (
          <div className="uj-journey-node" key={name}>
            <b>{name}</b>
            <i>{icon}</i>
            <strong>{detail}</strong>
            <small>{meta}</small>
            <span>{reach}</span>
            {index < simple.length - 1 && (
              <ArrowRight className="uj-node-arrow" size={13} />
            )}
          </div>
        ))}
        <div className="uj-property-branch">
          <b>Properties explored</b>
          {[
            ["Green Acres", "Plot 145", "3 views · 2m 38s"],
            ["Riverfront", "Plot 78", "2 views · 1m 42s"],
            ["Hill View", "Plot 203", "1 view · 1m 05s"],
          ].map(([name, plot, meta], index) => (
            <div className={`uj-property-mini uj-property-${index}`} key={name}>
              <span />
              <strong>
                {name}
                <small>{plot}</small>
              </strong>
              <em>{meta}</em>
            </div>
          ))}
        </div>
        <div className="uj-action-branch">
          <b>Compare</b>
          <div>
            <BadgeCheck size={13} />
            <span>
              <strong>Compared 3 plots</strong>
              <small>May 22, 10:23 AM</small>
            </span>
          </div>
          <div>
            <Download size={13} />
            <span>
              <strong>3 brochures</strong>
              <small>Downloaded</small>
            </span>
          </div>
        </div>
        <div className="uj-action-branch">
          <b>Enquire</b>
          <div>
            <Gauge size={13} />
            <span>
              <strong>Price calculator</strong>
              <small>Used 2 times</small>
            </span>
          </div>
          <div>
            <Smartphone size={13} />
            <span>
              <strong>WhatsApp click</strong>
              <small>20 seconds</small>
            </span>
          </div>
          <div>
            <CalendarDays size={13} />
            <span>
              <strong>Form started</strong>
              <small>38 seconds</small>
            </span>
          </div>
        </div>
        <div className="uj-stop-node">
          <b>STOPPED</b>
          <AlertTriangle size={18} />
          <strong>Site visit OTP verification</strong>
          <em>Idle for 6m 18s</em>
          <small>10:35 AM</small>
        </div>
      </div>
      <div className="uj-journey-totals">
        {[
          [24, "100%"],
          [24, "100%"],
          [22, "92%"],
          [21, "88%"],
          [12, "50%"],
          [7, "29%"],
          [1, "4%"],
        ].map(([count, pct]) => (
          <span key={`${count}-${pct}`}>
            {count} ({pct}) <ArrowRight size={10} />
          </span>
        ))}
      </div>
      <div className="mt-2">
        <AttributionPath />
      </div>
    </div>
  );
}

function AttributionPath() {
  return (
    <Panel
      title="Attribution Path"
      subtitle="First touch to assisted conversion"
    >
      <div className="flex h-28 items-center justify-around px-3">
        {[
          ["G", "Google Organic", "24 sessions"],
          ["L", "Landing Page", "24 sessions"],
          ["R", "Returning Direct", "12 sessions"],
          ["W", "WhatsApp", "4 leads"],
        ].map(([icon, label, meta], index) => (
          <div className="relative text-center" key={label}>
            <i className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-[11px] font-black text-emerald-600">
              {icon}
            </i>
            <b className="mt-1 block text-[8px]">{label}</b>
            <small className="text-[7px] text-slate-400">{meta}</small>
            {index < 3 && (
              <ArrowRight
                className="absolute -right-6 top-2 text-slate-400"
                size={12}
              />
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DynamicJourneyMap({ journey }) {
  const raw = journey?.rawEvents || [];
  const chronological = [...raw].reverse();
  const first = chronological[0];
  const latest = raw[0];
  const find = (...types) =>
    chronological.find((event) => types.includes(event.eventType));
  const count = (...types) =>
    raw.filter((event) => types.includes(event.eventType)).length;
  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not reached";
  const detail = (event, fallback) =>
    event?.metadata?.query ||
    event?.searchContext?.query ||
    event?.metadata?.title ||
    event?.placement ||
    event?.pageUrl ||
    fallback;
  const search = find("search_performed", "search_result_click");
  const explore = find(
    "filter_applied",
    "project_view",
    "property_view",
    "project_click",
    "property_click",
  );
  const nodes = [
    [
      "Acquisition",
      "G",
      title(first?.source || "Direct"),
      formatTime(first?.serverTimestamp),
      `${journey?.sessions || 0} sessions`,
    ],
    [
      "Sign Up",
      "U",
      "Registered",
      formatTime(first?.serverTimestamp),
      `${raw.length} events`,
    ],
    [
      "Search",
      "Q",
      detail(search, "No search yet"),
      formatTime(search?.serverTimestamp),
      search ? "Reached" : "Waiting",
    ],
    [
      "Explore",
      "F",
      detail(explore, "No listing opened"),
      formatTime(explore?.serverTimestamp),
      explore ? "Reached" : "Waiting",
    ],
  ];
  const entities = new Map();
  raw
    .filter((event) => event.projectId || event.propertyId || event.plotId)
    .forEach((event) => {
      const id = String(event.propertyId || event.projectId || event.plotId);
      const data = entityFor(event);
      const item = entities.get(id) || {
        id,
        label: entityName(event),
        image: entityImage(event),
        type: title(
          data.category || data.kind || event.entityType || "listing",
        ),
        promotion: title(data.promotionType || event.promotionType || "normal"),
        location: data.location,
        price: data.price,
        interactions: 0,
        views: 0,
        duration: 0,
      };
      item.interactions += 1;
      item.views += /view|click|gallery/.test(event.eventType || "") ? 1 : 0;
      item.duration += Number(
        event.durationMs ||
          event.metadata?.durationMs ||
          event.metadata?.activeMs ||
          0,
      );
      entities.set(id, item);
    });
  const explored = [...entities.values()]
    .sort((a, b) => b.interactions - a.interactions)
    .slice(0, 3);
  const stop =
    journey?.stoppingPoint ||
    (latest
      ? {
          eventType: latest.eventType,
          pageUrl: latest.pageUrl,
          capturedAt: latest.serverTimestamp,
        }
      : null);
  const compare = count("compare_added"),
    brochures = count("brochure_downloaded"),
    calculators = count("price_calculator_used"),
    whatsapp = count("whatsapp_clicked"),
    forms = count("lead_form_started", "site_visit_submitted");
  const totals = [
    journey?.sessions || 0,
    raw.length,
    search ? 1 : 0,
    explore ? 1 : 0,
    explored.reduce((sum, item) => sum + item.interactions, 0),
    compare + brochures,
    calculators + whatsapp + forms,
  ];
  return (
    <div className="uj-journey-canvas">
      <div className="uj-journey-legend">
        <span className="text-emerald-600">— Completed</span>
        <span className="text-blue-500">— Exploring</span>
        <span className="text-orange-500">— Friction / Drop-off</span>
        <em>Live data · IST</em>
      </div>
      <div className="uj-journey-grid">
        {nodes.map(([name, icon, text, meta, reach], index) => (
          <div className="uj-journey-node" key={name}>
            <b>{name}</b>
            <i>{icon}</i>
            <strong title={text}>{text}</strong>
            <small>{meta}</small>
            <span>{reach}</span>
            {index < nodes.length - 1 && (
              <ArrowRight className="uj-node-arrow" size={13} />
            )}
          </div>
        ))}
        <div className="uj-property-branch">
          <b>Projects & properties explored</b>
          {(explored.length
            ? explored
            : [
                {
                  id: "empty",
                  label: "No listing activity",
                  type: "Waiting",
                  promotion: "Normal",
                  interactions: 0,
                  views: 0,
                  duration: 0,
                },
              ]
          ).map((item, index) => (
            <div
              className={`uj-property-mini uj-property-${index}`}
              key={item.id}
            >
              {item.image ? (
                <img src={item.image} alt={item.label} loading="lazy" />
              ) : (
                <span>
                  <Building2 size={14} />
                </span>
              )}
              <strong title={item.label}>
                {item.label}
                <small>
                  {item.type} · {item.promotion}
                </small>
                <small>
                  Views: {item.views} ·{" "}
                  {item.duration
                    ? `${Math.max(1, Math.round(item.duration / 60000))}m`
                    : "—"}
                </small>
              </strong>
              <em>{item.location || `${item.interactions} interactions`}</em>
            </div>
          ))}
        </div>
        <div className="uj-action-branch">
          <b>Compare</b>
          <div>
            <BadgeCheck size={13} />
            <span>
              <strong>{compare} compared</strong>
              <small>Listings</small>
            </span>
          </div>
          <div>
            <Download size={13} />
            <span>
              <strong>{brochures} brochures</strong>
              <small>Downloaded</small>
            </span>
          </div>
        </div>
        <div className="uj-action-branch">
          <b>Enquire</b>
          <div>
            <Gauge size={13} />
            <span>
              <strong>Calculator</strong>
              <small>{calculators} uses</small>
            </span>
          </div>
          <div>
            <Smartphone size={13} />
            <span>
              <strong>WhatsApp</strong>
              <small>{whatsapp} clicks</small>
            </span>
          </div>
          <div>
            <CalendarDays size={13} />
            <span>
              <strong>Forms</strong>
              <small>{forms} started</small>
            </span>
          </div>
        </div>
        <div className="uj-stop-column">
          <b>Site Visit</b>
          <div className="uj-stop-node">
            <b>{stop ? "LAST POINT" : "WAITING"}</b>
            <AlertTriangle size={18} />
            <strong>
              {stop ? eventLabel(stop.eventType) : "No activity captured"}
            </strong>
            <em title={stop?.pageUrl}>
              {stop?.pageUrl || "Tracking is ready"}
            </em>
            <small>{formatTime(stop?.capturedAt)}</small>
          </div>
        </div>
      </div>
      <div className="uj-journey-totals">
        {totals.map((value, index) => (
          <span key={index}>
            {value} <ArrowRight size={10} />
          </span>
        ))}
      </div>
    </div>
  );
}

function ReferenceJourneyMap({ journey }) {
  const [mapZoom, setMapZoom] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const raw = journey?.rawEvents || [],
    chronological = [...raw].reverse(),
    first = chronological[0],
    latest = raw[0];
  const find = (...types) =>
    chronological.find((event) => types.includes(event.eventType));
  const count = (...types) =>
    raw.filter((event) => types.includes(event.eventType)).length;
  const brochureDownloads = raw
    .filter((event) => event.eventType === "brochure_downloaded")
    .map((event) => {
      const entity = entityFor(event);
      return {
        id: event._id || `${event.sessionId}-${event.serverTimestamp}`,
        name: entityName(event),
        kind: event.projectId ? "Project" : event.propertyId ? "Property" : "Listing",
        file: event.metadata?.fileName || event.metadata?.brochureName || event.metadata?.fileUrl || "Project brochure",
        time: time(event.serverTimestamp || event.capturedAt),
      };
    });
  function time(value) {
    return value
      ? new Date(value).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not reached";
  }
  const elapsed = (ms) =>
    ms
      ? `${Math.max(1, Math.floor(ms / 60000))}m ${Math.round(ms / 1000) % 60}s`
      : "—";
  const detail = (event, fallback) =>
    event?.metadata?.query ||
    event?.searchContext?.query ||
    event?.metadata?.title ||
    event?.placement ||
    fallback;
  const search = find("search_performed", "search_result_click"),
    explore = find(
      "filter_applied",
      "project_view",
      "property_view",
      "project_click",
      "property_click",
    );
  const sessionTotal = Math.max(1, Number(journey?.sessions || 0));
  const sessionsFor = (...types) =>
    new Set(
      raw
        .filter((event) => types.includes(event.eventType))
        .map((event) => event.sessionId)
        .filter(Boolean),
    ).size;
  const stagePercent = (...types) =>
    Math.min(100, Math.round((sessionsFor(...types) / sessionTotal) * 100));
  const searchPercent = stagePercent("search_performed", "search_result_click");
  const explorePercent = stagePercent(
    "filter_applied",
    "project_view",
    "property_view",
    "project_click",
    "property_click",
  );
  const agent = first?.userAgent || latest?.userAgent || "";
  const browser = /edg/i.test(agent)
    ? "Edge"
    : /opr|opera/i.test(agent)
      ? "Opera"
      : /firefox/i.test(agent)
        ? "Firefox"
        : /chrome|crios/i.test(agent)
          ? "Chrome"
          : /safari/i.test(agent)
            ? "Safari"
            : "Unknown browser";
  const device = /mobile|android|iphone/i.test(agent)
    ? "Mobile"
    : agent
      ? "Desktop"
      : "Unknown device";
  const sourceValue =
    first?.metadata?.utmSource ||
    first?.searchContext?.utmSource ||
    first?.metadata?.referrer ||
    first?.source ||
    "Direct";
  const stages = [
    [
      "Acquisition",
      Globe2,
      title(sourceValue),
      time(first?.serverTimestamp),
      `UTM: ${String(sourceValue).toLowerCase()}`,
      "Entry",
      raw.length ? 100 : 0,
      `${journey?.sessions || 0} Sessions`,
    ],
    [
      "Sign Up",
      UserRound,
      "Registered",
      time(first?.serverTimestamp),
      `${device} · ${browser}`,
      raw.length ? "100%" : "0%",
      raw.length ? 100 : 0,
      `${raw.length} events`,
    ],
    [
      "Search",
      Search,
      detail(search, "No search yet"),
      time(search?.serverTimestamp),
      elapsed(search?.durationMs),
      search ? `${searchPercent}%` : "Waiting",
      searchPercent,
      search ? `${100 - searchPercent}% drop-off` : "Not reached",
    ],
    [
      "Explore",
      ListFilter,
      detail(explore, "No listing opened"),
      time(explore?.serverTimestamp),
      elapsed(explore?.durationMs),
      explore ? `${explorePercent}%` : "Waiting",
      explorePercent,
      explore ? `${100 - explorePercent}% drop-off` : "Not reached",
    ],
  ];
  const grouped = new Map();
  raw
    .filter((event) => event.projectId || event.propertyId || event.plotId)
    .forEach((event) => {
      const id = String(event.propertyId || event.projectId || event.plotId),
        data = entityFor(event),
        item = grouped.get(id) || {
          id,
          label: entityName(event),
          image: entityImage(event),
          type: title(
            data.category || data.kind || event.entityType || "listing",
          ),
          promotion: title(
            data.promotionType || event.promotionType || "normal",
          ),
          views: 0,
          duration: 0,
          interactions: 0,
          lastActiveAt: 0,
        };
      item.interactions += 1;
      item.views += /view|click|gallery/.test(event.eventType || "") ? 1 : 0;
      item.duration += Number(
        event.durationMs ||
          event.metadata?.durationMs ||
          event.metadata?.activeMs ||
          0,
      );
      item.lastActiveAt = Math.max(
        item.lastActiveAt,
        new Date(event.serverTimestamp || event.createdAt || 0).getTime(),
      );
      grouped.set(id, item);
    });
  const listings = [...grouped.values()]
    .sort((a, b) => b.lastActiveAt - a.lastActiveAt || b.interactions - a.interactions)
    .slice(0, 3);
  const cards = listings.length
    ? listings
    : [
        {
          id: "empty",
          label: "No listing activity",
          type: "Waiting",
          promotion: "Normal",
          views: 0,
          duration: 0,
        },
      ];
  const compared = count("compare_added"),
    brochures = count("brochure_downloaded"),
    calculators = count("price_calculator_used"),
    whatsapp = count("whatsapp_clicked"),
    forms = count("lead_form_started", "site_visit_submitted");
  const stop =
    journey?.stoppingPoint ||
    (latest
      ? {
          eventType: latest.eventType,
          pageUrl: latest.pageUrl,
          capturedAt: latest.serverTimestamp,
        }
      : null);
  const kpis = [
    [
      "Session Duration",
      journey?.engagedMinutes
        ? `${Math.floor(journey.engagedMinutes / 60)}h ${journey.engagedMinutes % 60}m`
        : "0m",
    ],
    ["Total Events", raw.length],
    ["Properties Viewed", listings.length],
    ["Enquiries Started", forms],
    ["Conversion Stage", stop ? eventLabel(stop.eventType) : "Active"],
    ["Last Activity", time(latest?.serverTimestamp)],
    [
      "Friction Score",
      `${count("otp_verification_failed", "lead_form_abandoned") * 20}%`,
    ],
    ["Conversion Probability", `${journey?.buyingIntent || 0}%`],
  ];
  return (
    <div className="uj2">
      <div className="uj2-legend">
        <span className="done">Completed</span>
        <span className="active">Exploring</span>
        <span className="risk">Friction / Drop-off</span>
        <em>All times in IST</em>
      </div>
      <div className="uj2-flow">
        <svg
          className="uj2-lines"
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="green stage-link" d="M55 100 H462" />
          <path className="green" d="M462 100 C482 100 482 51 502 51 H603" />
          <path className="blue" d="M462 100 C482 100 482 110 502 110 H603" />
          <path className="blue" d="M462 100 C482 100 482 169 502 169 H603" />
          <path className="green" d="M603 51 H720 C740 51 740 50 758 50 H840" />
          <path className="blue" d="M603 110 H720 V114 H840" />
          <path className="blue" d="M603 169 H720 V114" />
          <path
            className="green"
            d="M840 50 H900 C914 50 914 50 930 50 H1016"
          />
          <path className="green" d="M840 114 H900 V114 H1016" />
          <path className="green" d="M900 114 V180 H1016" />
          <path
            className="orange"
            d="M1016 50 H1065 C1082 50 1082 110 1105 110 H1160"
          />
        </svg>
        <div className="uj2-grid">
          {stages.map(([name, Icon, text, meta, sub, stat, pct, value]) => (
            <article className="uj2-stage" key={name}>
              <h3>
                {name}
                <ArrowRight size={12} />
              </h3>
              <i>
                <Icon size={18} />
              </i>
              <strong title={text}>{text}</strong>
              <small>{meta}</small>
              <em>{sub}</em>
              <div className="uj2-stat">
                <b>{stat}</b>
                <strong>{pct}%</strong>
                <small>{value}</small>
              </div>
            </article>
          ))}
          <section className="uj2-properties">
            <h3>
              Properties explored <ArrowRight size={12} />
            </h3>
            {cards.map((item, index) => (
              <div className={`uj2-property p${index}`} key={item.id}>
                {item.image ? (
                  <img src={item.image} alt={item.label} />
                ) : (
                  <span>
                    <Building2 size={16} />
                  </span>
                )}
                <b>
                  {item.label}
                  <small>
                    {item.type} · {item.promotion}
                  </small>
                  <em>
                    Views: {item.views} · {elapsed(item.duration)}
                  </em>
                </b>
              </div>
            ))}
          </section>
          <section className="uj2-actions compare">
            <h3>
              Compare <ArrowRight size={12} />
            </h3>
            <div>
              <CircleCheck />
              <b>
                Compared<small>{compared} listings</small>
              </b>
            </div>
            <em>{elapsed(find("compare_added")?.durationMs)}</em>
            <button
              type="button"
              className="uj2-action-button"
              onClick={() => setSelectedDetail({
                title: `Brochure downloads (${brochureDownloads.length})`,
                description: brochureDownloads.length
                  ? "Files downloaded by this user in the selected period."
                  : "No brochure download has been captured for this user.",
                items: brochureDownloads,
              })}
            >
              <Download />
              <b>
                Brochures<small>{brochures} downloaded</small>
              </b>
            </button>
            <em>{elapsed(find("brochure_downloaded")?.durationMs)}</em>
          </section>
          <section className="uj2-actions enquire">
            <h3>
              Enquire <ArrowRight size={12} />
            </h3>
            <div>
              <Calculator />
              <b>
                Price Calc Used<small>{calculators} times</small>
              </b>
            </div>
            <em>{elapsed(find("price_calculator_used")?.durationMs)}</em>
            <div>
              <MessageCircle />
              <b>
                WhatsApp Click<small>{whatsapp} clicks</small>
              </b>
            </div>
            <em>{elapsed(find("whatsapp_clicked")?.durationMs)}</em>
            <div>
              <ClipboardList />
              <b>
                Form Started<small>{forms} started</small>
              </b>
            </div>
          </section>
          <section className="uj2-stop">
            <h3>Site Visit</h3>
            <div>
              <b>{stop ? "STOPPED" : "WAITING"}</b>
              <AlertTriangle />
              <strong>
                {stop ? eventLabel(stop.eventType) : "No activity captured"}
              </strong>
              <em>{stop?.pageUrl || "Tracking is ready"}</em>
              <small>{time(stop?.capturedAt)}</small>
            </div>
          </section>
        </div>
      </div>
      <div className="uj2-kpis">
        {kpis.map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <b>{value}</b>
          </div>
        ))}
      </div>
      {selectedDetail && (
        <div className="uj2-detail">
          <button onClick={() => setSelectedDetail(null)}>×</button>
          <h3>{selectedDetail.title}</h3>
          <p>{selectedDetail.description}</p>
          {selectedDetail.items?.length > 0 && (
            <div className="uj2-detail-list">
              {selectedDetail.items.map((item) => (
                <div key={item.id}>
                  <Download size={13} />
                  <span><b>{item.name}</b><small>{item.kind} · {item.file}</small></span>
                  <time>{item.time}</time>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DynamicAttribution({ journey }) {
  const raw = journey?.rawEvents || [];
  const source = title([...raw].reverse()[0]?.source || "Direct");
  const page = [...raw].reverse()[0]?.pageUrl || "No landing page";
  const steps = [
    ["S", source, "First touch"],
    ["L", "Landing Page", page],
    [
      "R",
      (journey?.sessions || 0) > 1 ? "Returning User" : "First Session",
      `${journey?.sessions || 0} sessions`,
    ],
    [
      "C",
      (journey?.leads || 0) > 0 ? "Lead Created" : "Not Converted",
      `${journey?.leads || 0} leads`,
    ],
  ];
  return (
    <Panel
      title="Attribution Path"
      subtitle="Actual first touch to current conversion state"
    >
      <div className="flex h-28 items-center justify-around overflow-hidden px-3">
        {steps.map(([icon, label, meta], index) => (
          <div
            className="relative min-w-0 flex-1 text-center"
            key={`${label}-${index}`}
          >
            <i className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-[11px] font-black text-emerald-600">
              {icon}
            </i>
            <b className="mt-1 block truncate text-[8px]">{label}</b>
            <small className="block truncate px-3 text-[7px] text-slate-400">
              {meta}
            </small>
            {index < steps.length - 1 && (
              <ArrowRight
                className="absolute -right-1 top-2 text-slate-400"
                size={12}
              />
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DynamicInsightRail({ journey, user, notify }) {
  const raw = journey?.rawEvents || [];
  const count = (...types) =>
    raw.filter((event) => types.includes(event.eventType)).length;
  const uniqueLocations = new Set(
    raw.map((event) => entityFor(event)?.location).filter(Boolean),
  ).size;
  const signalValues = [
    Math.min(100, 25 + uniqueLocations * 20),
    Math.min(
      100,
      count("price_calculator_used", "filter_applied") * 20 +
        count("property_view", "project_view") * 4,
    ),
    Math.min(
      100,
      Math.round((raw.length / Math.max(1, journey?.sessions || 1)) * 8),
    ),
    Math.min(
      100,
      count(
        "shortlist_added",
        "whatsapp_clicked",
        "phone_clicked",
        "contact_owner_clicked",
        "lead_form_started",
        "site_visit_submitted",
      ) * 18,
    ),
    Math.min(
      100,
      30 +
        Math.min(4, journey?.sessions || 0) * 12 +
        count("brochure_downloaded", "compare_added") * 8,
    ),
  ];
  const signalItems = [
    ["Location fit", signalValues[0]],
    ["Budget", signalValues[1]],
    ["Engagement", signalValues[2]],
    ["Urgency", signalValues[3]],
    ["Trust", signalValues[4]],
  ];
  const radarPoint = (index, value = 100) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / signalItems.length;
    const radius = 48 * (value / 100);
    return `${80 + Math.cos(angle) * radius},${62 + Math.sin(angle) * radius}`;
  };
  const summary = [
    `${journey?.sessions || 0} session${journey?.sessions === 1 ? "" : "s"} in the selected period`,
    `${(journey?.projectsViewed || 0) + (journey?.propertiesViewed || 0)} unique listings explored`,
    `${count("project_click", "property_click", "project_view", "property_view")} listing interactions captured`,
    `${count("price_calculator_used")} price calculator uses`,
    `${count("brochure_downloaded")} brochure downloads`,
    `${count("whatsapp_clicked", "phone_clicked", "contact_owner_clicked")} assisted contact actions`,
    `Intent: location ${signalValues[0]}% · budget ${signalValues[1]}% · engagement ${signalValues[2]}% · urgency ${signalValues[3]}% · trust ${signalValues[4]}%`,
    journey?.stoppingPoint
      ? `Last stopped at ${eventLabel(journey.stoppingPoint.eventType)}`
      : "Waiting for the next live interaction",
  ];
  const latest = raw[0];
  const hasFriction =
    count("otp_verification_failed", "lead_form_abandoned") > 0;
  const recommendation = hasFriction
    ? [
        "Resolve journey friction",
        "Contact the user while buying intent is active.",
      ]
    : (journey?.buyingIntent || 0) >= 60
      ? [
          "Contact this high-intent user",
          "Offer assistance for the most-viewed listing.",
        ]
      : [
          "Continue behavior monitoring",
          "Wait for another meaningful intent signal.",
        ];
  const userAgent = latest?.userAgent || "";
  const browserName = /edg/i.test(userAgent)
    ? "Edge"
    : /opr|opera/i.test(userAgent)
      ? "Opera"
      : /firefox/i.test(userAgent)
        ? "Firefox"
        : /chrome|crios/i.test(userAgent)
          ? "Chrome"
          : /safari/i.test(userAgent)
            ? "Safari"
            : "Unknown browser";
  const device = userAgent
    ? `${/mobile|android|iphone/i.test(userAgent) ? "Mobile" : "Desktop"} · ${browserName}`
    : "Device unavailable";
  const lastTime = latest?.serverTimestamp
    ? new Date(latest.serverTimestamp).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No activity";
  return (
    <aside className="grid content-start gap-2 md:grid-cols-2 xl:grid-cols-1">
      <Panel
        title="1. AI Journey Summary"
        subtitle="Live behavioral intelligence"
      >
        <ul className="space-y-2 p-3 text-[9px]">
          {summary.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel
        title="2. Next Best Action"
        subtitle={`${Math.min(95, Math.max(55, journey?.buyingIntent || 0))}% confidence`}
      >
        <div className="space-y-3 p-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-[9px]">
            <b>{recommendation[0]}</b>
            <p className="mt-1 text-slate-500">{recommendation[1]}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <Avatar user={user} size="h-8 w-8" />
            <span className="min-w-0 text-[8px]">
              <b className="block truncate">{user.name}</b>
              <span className="block truncate">
                {[user.locality, user.city, user.state]
                  .filter(Boolean)
                  .join(", ") || "Location unavailable"}
              </span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => notify("Follow-up assigned")}
              className="uj-action-primary"
            >
              <Send size={11} />
              Assign
            </button>
            <button
              onClick={() => notify("WhatsApp assistance queued")}
              className="uj-action"
            >
              <Smartphone size={11} />
              WhatsApp
            </button>
          </div>
        </div>
      </Panel>
      <Panel title="3. Live Context" subtitle="Current user environment">
        <div className="space-y-2.5 p-3 text-[8px]">
          {[
            [
              Globe2,
              "Current URL",
              journey?.currentContext?.pageUrl || "No active page",
            ],
            [Monitor, "Device", device],
            [
              MapPin,
              "Location",
              [user.locality, user.city, user.state]
                .filter(Boolean)
                .join(", ") || "Unavailable",
            ],
            [
              Wifi,
              "Promotion",
              title(journey?.currentContext?.promotionType || "normal"),
            ],
            [
              MousePointer2,
              "Last interaction",
              `${eventLabel(journey?.currentContext?.eventType || "none")} · ${lastTime}`,
            ],
          ].map(([Icon, label, value]) => (
            <div className="flex min-w-0 gap-2" key={label}>
              <Icon size={12} className="shrink-0 text-slate-400" />
              <span className="min-w-0">
                <b className="block text-slate-500">{label}</b>
                <span className="block truncate" title={value}>
                  {value}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Intent Signals"
        subtitle="Calculated from captured behavior"
      >
        <div className="uj-intent-signals">
          <div className="uj-radar-chart" aria-label="Intent signal radar chart">
            <svg viewBox="0 0 160 124" role="img">
              {[25, 50, 75, 100].map((level) => (
                <polygon
                  key={level}
                  points={signalItems.map((_, index) => radarPoint(index, level)).join(" ")}
                  className="uj-radar-grid"
                />
              ))}
              {signalItems.map((_, index) => (
                <line key={index} x1="80" y1="62" x2={radarPoint(index).split(",")[0]} y2={radarPoint(index).split(",")[1]} />
              ))}
              <polygon
                points={signalItems.map(([, value], index) => radarPoint(index, value)).join(" ")}
                className="uj-radar-value"
              />
              {signalItems.map(([, value], index) => {
                const [cx, cy] = radarPoint(index, value).split(",");
                return <circle key={index} cx={cx} cy={cy} r="2.5" />;
              })}
            </svg>
            <strong>{journey?.buyingIntent || 0}<small>/100 intent</small></strong>
          </div>
          <div className="uj-signal-list">
            {signalItems.map(([label, value]) => (
              <div key={label}>
                <span><i />{label}</span>
                <b>{value}%</b>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </aside>
  );
}

export default function LeadCaptureAnalytics() {
  const [users, setUsers] = useState([]),
    [selectedId, setSelectedId] = useState(""),
    [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [query, setQuery] = useState(""),
    [roleFilter, setRoleFilter] = useState("all"),
    [pickerOpen, setPickerOpen] = useState(false),
    [eventQuery, setEventQuery] = useState(""),
    [range, setRange] = useState("30"),
    [live, setLive] = useState(true),
    [toast, setToast] = useState(""),
    [journeyError, setJourneyError] = useState("");
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingFilter, setListingFilter] = useState("all");
  const user = useMemo(
    () => users.find((item) => item._id === selectedId) || users[0],
    [selectedId, users],
  );
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      const payload = result?.data;
      const list = (
        Array.isArray(payload) ? payload : payload?.users || []
      ).filter((item) => roles.includes(item.roleName));
      setUsers(list);
      setSelectedId((current) => current || list[0]?._id || "");
    } finally {
      setLoading(false);
    }
  }, []);
  const loadJourney = useCallback(
    async (person) => {
      if (!person) return;
      setRefreshing(true);
      setJourneyError("");
      try {
        const response = await apiClient.get(
          `/api/properties/interactions/user-journey/${person._id}`,
          { params: { days: range, _t: Date.now() } },
        );
        setJourney(normalizeJourney(person, response?.data?.data));
      } catch (error) {
        setJourney(normalizeJourney(person));
        setJourneyError(
          error?.response?.data?.message ||
            "Live journey data could not be loaded.",
        );
      } finally {
        setRefreshing(false);
      }
    },
    [range],
  );
  useEffect(() => {
    // Initial synchronization with the existing admin user API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    // Synchronize the selected user's activity stream.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) loadJourney(user);
  }, [user, loadJourney]);
  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const userIds = [user._id, user.userId, user.builderId].filter(Boolean);
    setListingsLoading(true);
    Promise.all([
      getUserProperties(userIds, "residential", 1, 100),
      getUserProperties(userIds, "commercial", 1, 100),
      getUserProperties(userIds, "land", 1, 100),
      getUserProperties(userIds, "agricultural", 1, 100),
      getUserFeaturedProjects(userIds, "", 1, 100),
    ])
      .then((responses) => {
        if (!active) return;
        const kinds = ["Residential", "Commercial", "Land", "Agricultural", "Project"];
        setUserListings(
          responses.flatMap((response, index) =>
            (response?.data?.items || []).map((item) => ({ ...item, _listingKind: kinds[index] })),
          ),
        );
      })
      .catch(() => active && setUserListings([]))
      .finally(() => active && setListingsLoading(false));
    return () => {
      active = false;
    };
  }, [user]);
  useEffect(() => {
    if (!live || !user) return undefined;
    const timer = window.setInterval(() => loadJourney(user), 10000);
    return () => window.clearInterval(timer);
  }, [live, loadJourney, user]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!pickerOpen) return undefined;
    const closePicker = (event) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", closePicker);
    return () => window.removeEventListener("keydown", closePicker);
  }, [pickerOpen]);
  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase().trim();
    return users
      .filter(
        (item) =>
          (roleFilter === "all" || item.roleName === roleFilter) &&
          (!q ||
            [
              item.name,
              item.email,
              item.phone,
              item.city,
              item.state,
              item.locality,
              item.address,
            ].some((value) =>
              String(value || "")
                .toLowerCase()
                .includes(q),
            )),
      )
      .slice(0, 20);
  }, [query, roleFilter, users]);
  const events = useMemo(
    () =>
      (journey?.events || []).filter(
        (row) =>
          !eventQuery ||
          row.join(" ").toLowerCase().includes(eventQuery.toLowerCase()),
      ),
    [eventQuery, journey],
  );
  const properties = useMemo(() => {
    const grouped = new Map();
    (journey?.rawEvents || [])
      .filter((event) => event.projectId || event.propertyId || event.plotId)
      .forEach((event) => {
        const id = String(event.propertyId || event.projectId || event.plotId);
        const data = entityFor(event);
        const item = grouped.get(id) || {
          id,
          name: entityName(event),
          image: entityImage(event),
          kind: event.projectId ? "Project" : event.plotId ? "Plot" : "Property",
          category: title(
            data.category || data.kind || event.entityType || "Listing",
          ),
          location: data.location || "",
          price: data.price,
          views: 0,
          duration: 0,
          intent: 0,
        };
        item.views += /view|click/.test(event.eventType) ? 1 : 0;
        item.duration += Number(
          event.durationMs || event.metadata?.durationMs || 0,
        );
        item.intent +=
          /shortlist|compare|brochure|whatsapp|phone|lead|visit/.test(
            event.eventType,
          )
            ? 15
            : 3;
        grouped.set(id, item);
      });
    return [...grouped.values()]
      .sort((a, b) => b.views + b.intent - (a.views + a.intent))
      .slice(0, 8)
      .map((item, index) => ({
        ...item,
        match: Math.min(99, 55 + item.intent + Math.max(0, 12 - index * 4)),
        dwell: item.duration
          ? `${Math.max(1, Math.round(item.duration / 60000))}m`
          : "—",
        status:
          item.intent >= 20 ? "High" : item.intent >= 8 ? "Medium" : "Low",
      }));
  }, [journey]);
  const listingCounts = useMemo(() => {
    const counts = { all: userListings.length };
    userListings.forEach((item) => {
      const key = String(item._listingKind || "property").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [userListings]);
  const visibleUserListings = useMemo(
    () =>
      userListings.filter(
        (item) =>
          listingFilter === "all" ||
          String(item._listingKind).toLowerCase() === listingFilter,
      ),
    [listingFilter, userListings],
  );
  const minutes = journey?.engagedMinutes ?? 0;
  const rawEvents = journey?.rawEvents || [];
  const eventCount = (...types) =>
    rawEvents.filter((event) =>
      types.some((type) => String(event.eventType || "").includes(type)),
    ).length;
  const topListing = properties[0];
  const totalClicks = eventCount("click");
  const mobileSessions = new Set(
    rawEvents
      .filter((event) => /mobile|android|iphone/i.test(event.userAgent || ""))
      .map((event) => event.sessionId),
  ).size;
  const desktopSessions = Math.max(
    0,
    (journey?.sessions || 0) - mobileSessions,
  );
  const funnelCounts = [
    journey?.sessions || 0,
    eventCount("search"),
    eventCount("property_view", "project_view", "plot_view"),
    journey?.shortlisted || 0,
    journey?.leads || 0,
    journey?.siteVisits || 0,
    eventCount("booking_started"),
  ];
  const funnelBase = Math.max(1, funnelCounts[0]);
  const funnel = [
    "Registered",
    "Search",
    "Property View",
    "Shortlist",
    "Lead",
    "Site Visit",
    "Booking",
  ].map((name, index) => [
    name,
    index === 0
      ? funnelCounts[0]
        ? 100
        : 0
      : Math.min(100, Math.round((funnelCounts[index] / funnelBase) * 100)),
  ]);
  const listingActivity = journey?.listingActivity || {};
  const hasCreatorActivity = Number(listingActivity.totalPosted || 0) > 0;
  const creatorCounts = [
    listingActivity.projectsPosted || 0,
    listingActivity.propertiesPosted || 0,
    listingActivity.published || 0,
    listingActivity.views || 0,
    listingActivity.clicks || 0,
    listingActivity.inquiries || 0,
    listingActivity.siteVisits || 0,
  ];
  const creatorBase = Math.max(1, ...creatorCounts);
  const creatorFunnel = [
    "Projects",
    "Properties",
    "Published",
    "Listing Views",
    "Clicks",
    "Inquiries",
    "Site Visits",
  ].map((name, index) => [
    name,
    Math.round((creatorCounts[index] / creatorBase) * 100),
  ]);
  const visibleFunnel = hasCreatorActivity ? creatorFunnel : funnel;
  const visibleFunnelCounts = hasCreatorActivity ? creatorCounts : funnelCounts;
  const sessionActivity = [
    ...new Map(
      rawEvents
        .filter((event) => event.sessionId)
        .map((event) => [event.sessionId, event]),
    ).values(),
  ].sort((a, b) => new Date(a.serverTimestamp) - new Date(b.serverTimestamp));
  const activityTimes = sessionActivity
    .map((event) => new Date(event.serverTimestamp).getTime())
    .filter(Number.isFinite);
  const activityStart = Math.min(...activityTimes, Date.now()),
    activitySpan = Math.max(
      1,
      Math.max(...activityTimes, Date.now()) - activityStart,
    );
  const timelinePoints = sessionActivity.map((event, index) => {
    const stamp = new Date(event.serverTimestamp);
    return {
      id: event.sessionId || index,
      mobile: /mobile|android|iphone/i.test(event.userAgent || ""),
      left:
        activityTimes.length < 2
          ? 50
          : 5 + ((stamp.getTime() - activityStart) / activitySpan) * 90,
      top: 8 + ((stamp.getHours() * 60 + stamp.getMinutes()) / 1440) * 84,
      label: stamp.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
  const riskMap = new Map();
  rawEvents
    .filter((event) =>
      /fail|error|abandon|timeout|denied|blocked|invalid|friction/i.test(
        event.eventType || "",
      ),
    )
    .forEach((event) => {
      const name = eventLabel(event.eventType),
        current = riskMap.get(name) || { total: 0, high: false };
      current.total += 1;
      current.high ||= /fail|error|denied|blocked|otp/i.test(
        event.eventType || "",
      );
      riskMap.set(name, current);
    });
  const calculatorRepeats = Math.max(0, eventCount("price_calculator") - 1);
  if (calculatorRepeats)
    riskMap.set("Price calculator repeated", {
      total: calculatorRepeats,
      high: false,
    });
  const detectedRisks = [...riskMap.entries()]
    .map(([name, value]) => [name, value.total, value.high ? "High" : "Medium"])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const locationMap = new Map();
  properties
    .filter((item) => item.location)
    .forEach((item) =>
      locationMap.set(
        item.location,
        (locationMap.get(item.location) || 0) + Math.max(1, item.views || 0),
      ),
    );
  const locationEntries = [...locationMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const hotspots = (
    locationEntries.length
      ? locationEntries
      : [
          [
            [user?.locality, user?.city].filter(Boolean).join(", ") ||
              "Location unavailable",
            0,
          ],
        ]
  ).map(([name, interactions], index) => ({
    name,
    interactions,
    left: [24, 61, 76][index] || 50,
    top: [58, 48, 20][index] || 50,
  }));
  if (loading)
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <LoaderCircle className="animate-spin text-emerald-600" size={34} />
      </div>
    );
  if (!user)
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <Users className="mx-auto text-slate-300" />
        <h1 className="mt-3 font-black">No trackable users found</h1>
      </div>
    );
  const notify = setToast;
  return (
    <div className="uj-page relative text-slate-900">
      {toast && (
        <div className="uj-toast">
          <Check size={14} />
          {toast}
        </div>
      )}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            User Journey Intelligence
          </h1>
          <p className="text-[9px] text-slate-500">
            Behavior, intent, friction and conversion tracing · First-party
            consented data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="uj-control"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={() => setLive((value) => !value)}
            className={`uj-control gap-2 ${live ? "text-emerald-700" : "text-slate-500"}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`}
            />
            {live ? "Live" : "Paused"}
            <ChevronDown size={12} />
          </button>
          <button onClick={() => window.print()} className="uj-control">
            <Download size={13} />
            Export
          </button>
          <button onClick={() => loadJourney(user)} className="uj-icon-button">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>
      <section className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid items-center gap-2 xl:grid-cols-[minmax(430px,1fr)_auto]">
          <div
            className={`relative ${pickerOpen ? "uj-user-picker-open" : ""}`}
          >
            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50/60 p-1 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPickerOpen(true);
                }}
                className="h-8 w-32 border-0 border-r border-slate-200 bg-transparent px-2 text-[9px] font-bold text-slate-700 outline-none"
              >
                <option value="all">All roles</option>
                <option value="user">Users</option>
                <option value="builder">Builders</option>
                <option value="builder_staff">Builder staff</option>
                <option value="agent">Agents</option>
              </select>
              <Search className="ml-3 shrink-0 text-slate-400" size={14} />
              <input
                value={query}
                onFocus={() => setPickerOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPickerOpen(true);
                }}
                placeholder="Search name, phone, email, city, state or locality"
                className="h-8 min-w-0 flex-1 bg-transparent px-2 text-[10px] outline-none"
              />
              <span className="mr-2 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700">
                {filteredUsers.length} found
              </span>
            </div>
            {pickerOpen && (
              <div className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                <div className="flex items-center justify-between px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  <span>Select tracked account</span>
                  <button
                    onClick={() => setPickerOpen(false)}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
                {filteredUsers.length ? (
                  filteredUsers.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        setSelectedId(item._id);
                        setQuery("");
                        setPickerOpen(false);
                      }}
                      className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg p-2 text-left transition hover:bg-emerald-50 ${item._id === user?._id ? "bg-emerald-50 ring-1 ring-emerald-100" : ""}`}
                    >
                      <Avatar user={item} size="h-8 w-8" />
                      <span className="min-w-0">
                        <strong className="block truncate text-[9px] text-slate-800">
                          {item.name || "Unnamed account"}
                        </strong>
                        <small className="block truncate text-[8px] text-slate-400">
                          {item.email || maskPhone(item.phone)}
                        </small>
                      </span>
                      <span className="text-right">
                        <b className="block text-[8px] text-emerald-700">
                          {title(item.roleName)}
                        </b>
                        <small className="block max-w-36 truncate text-[7px] text-slate-400">
                          {[item.locality, item.city, item.state]
                            .filter(Boolean)
                            .join(", ") || "Location unavailable"}
                        </small>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search className="mx-auto text-slate-300" size={22} />
                    <strong className="mt-2 block text-[10px]">
                      No matching account
                    </strong>
                    <p className="mt-1 text-[8px] text-slate-400">
                      Try another role, name, contact or location.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() => notify("Contact request opened")}
              className="uj-action-primary"
            >
              <Phone size={13} />
              Contact
            </button>
            <button
              onClick={() => notify("User assigned to sales agent")}
              className="uj-action"
            >
              <UserRound size={13} />
              Assign agent
            </button>
            <button
              onClick={() => notify("Follow-up task created")}
              className="uj-action"
            >
              <CircleDot size={13} />
              Create task
            </button>
            <button onClick={() => setPickerOpen(true)} className="uj-action">
              <Users size={13} />
              Change user
            </button>
          </div>
        </div>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 border-t border-slate-100 px-1 pt-2">
          <Avatar user={user} />
          <div className="mr-2 min-w-[150px]">
            <strong className="block truncate text-[12px]">
              {user.name || "Registered user"}
            </strong>
            <span className="block truncate text-[8px] text-slate-500">
              {maskPhone(user.phone)} ·{" "}
              {[user.locality, user.city, user.state]
                .filter(Boolean)
                .join(", ") || "Location unavailable"}
            </span>
          </div>
          <Chip tone="blue">
            <UserCheck size={11} />
            {title(user.roleName)}
          </Chip>
          <Chip tone={journey?.online ? "green" : "slate"}>
            <CircleDot size={10} />
            {journey?.online
              ? "Online now"
              : `Last active ${journey?.summary?.lastActiveAt ? new Date(journey.summary.lastActiveAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "unavailable"}`}
          </Chip>
          <Chip tone="orange">
            <Target size={10} />
            High intent
          </Chip>
          <Chip>
            <BadgeCheck size={10} />
            Verified
          </Chip>
          <Chip>
            <ShieldCheck size={10} />
            Consent active
          </Chip>
        </div>
      </section>
      {journeyError && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] text-red-700">
          <AlertTriangle size={12} />
          <strong>Live data unavailable:</strong>
          {journeyError}
        </div>
      )}
      {journey?.isPreview && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[9px] text-amber-800">
          <AlertTriangle size={12} />
          <strong>Preview behavior data:</strong> identity is live; journey data
          becomes live automatically when the tracking endpoint is connected.
        </div>
      )}
      <section className="mt-2 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-4 xl:grid-cols-9">
        <Metric
          icon={Gauge}
          label="Journey Score"
          value={journey?.journeyScore ?? 0}
          suffix="/100"
        />
        <Metric
          icon={Target}
          label="Buying Intent"
          value={journey?.buyingIntent ?? 0}
          suffix={
            (journey?.buyingIntent ?? 0) >= 70
              ? "High"
              : (journey?.buyingIntent ?? 0) >= 40
                ? "Medium"
                : "Low"
          }
        />
        <Metric
          icon={Activity}
          label="Sessions"
          value={journey?.sessions ?? 0}
          tone="blue"
        />
        <Metric
          icon={Clock3}
          label="Engaged Time"
          value={`${Math.floor(minutes / 60)}h ${minutes % 60}m`}
        />
        <Metric
          icon={Eye}
          label="Listings Viewed"
          value={
            (journey?.propertiesViewed ?? 0) + (journey?.projectsViewed ?? 0)
          }
        />
        <Metric
          icon={BadgeCheck}
          label="Shortlisted"
          value={journey?.shortlisted ?? 0}
          tone="violet"
        />
        <Metric icon={Users} label="Leads" value={journey?.leads ?? 0} />
        <Metric
          icon={CalendarDays}
          label="Site Visits"
          value={journey?.siteVisits ?? 0}
        />
        <Metric
          icon={Building2}
          label="Events"
          value={journey?.rawEvents?.length ?? 0}
          tone="orange"
        />
      </section>
      <section className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-2">
          <Panel
            className="uj-map-panel"
            title="Live Journey Map"
            subtitle="Complete path, exploration branches and exact stopping point"
            action={
              <Chip>
                <Wifi size={10} />
                Streaming
              </Chip>
            }
          >
            <ReferenceJourneyMap journey={journey} />
          </Panel>
          <div className="uj-detail-stack grid grid-cols-1 gap-2">
            <Panel
              className="hidden"
              title="Session Replay & Heatmap"
              subtitle="Privacy-masked real user session"
            >
              {false}
              <div className="hidden p-3">
                <div className="uj-replay">
                  <div className="flex h-6 items-center justify-between border-b bg-white px-2 text-[7px]">
                    <b className="text-emerald-700">PROPENU</b>
                    <span>Projects · Properties · Contact</span>
                  </div>
                  <div className="relative h-28 overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-50 to-slate-100 p-3">
                    <div className="h-16 rounded-md bg-[linear-gradient(135deg,#9dc28c,#4b7259)] shadow-inner" />
                    <span className="uj-heat left-[34%] top-[35%]" />
                    <span className="uj-heat left-[66%] top-[52%]" />
                    <span className="uj-heat left-[50%] top-[74%]" />
                    <strong className="absolute bottom-2 left-3 rounded bg-white/90 px-2 py-1 text-[8px]">
                      Green Acres · Plot 145 · ₹46.5L
                    </strong>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span />
                  <div className="h-1 flex-1 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full w-3/4 bg-emerald-500"
                    />
                  </div>
                  <span className="text-[8px]">10:28 / 15:42</span>
                </div>
                <div className="mt-3 flex justify-between text-center text-[8px]">
                  <span>
                    <b className="block text-lg text-red-500">3</b>Rage clicks
                  </span>
                  <span>
                    <b className="block text-lg text-blue-600">1</b>Dead click
                  </span>
                  <span>
                    <b className="block text-lg text-slate-800">37</b>Clicks
                  </span>
                </div>
              </div>
            </Panel>
            <Panel
              title="Event Stream"
              subtitle="Live page, click and form activity"
              action={<ListFilter size={13} className="text-slate-400" />}
            >
              <div className="border-b p-2">
                <label className="relative">
                  <Search
                    size={11}
                    className="absolute left-2 top-2 text-slate-400"
                  />
                  <input
                    value={eventQuery}
                    onChange={(e) => setEventQuery(e.target.value)}
                    placeholder="Search events..."
                    className="h-7 w-full rounded-md border pl-7 text-[8px] outline-none focus:border-emerald-500"
                  />
                </label>
              </div>
              <div className="uj-table-scroll">
                <table className="w-full min-w-[560px] text-left text-[8px]">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>Page / Entity</th>
                      <th>Duration</th>
                      <th>Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((row) => (
                      <tr key={`${row[0]}-${row[1]}`}>
                        <td>{row[0]}</td>
                        <td
                          className={
                            row[5] === "risk"
                              ? "font-bold text-red-600"
                              : "font-semibold"
                          }
                        >
                          <span
                            className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${row[5] === "risk" ? "bg-red-500" : "bg-emerald-500"}`}
                          />
                          {row[1]}
                        </td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                        <td>{row[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
            <Panel
              title="Property Affinity Matrix"
              subtitle="Ranked by behavioral match score"
            >
              <div className="uj-table-scroll">
                <table className="w-full text-left text-[8px]">
                  <thead>
                    <tr>
                      <th>Explored listing</th>
                      <th>Match</th>
                      <th>Views</th>
                      <th>Dwell</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                loading="lazy"
                                className="h-8 w-11 rounded object-cover"
                              />
                            ) : (
                              <span className="grid h-8 w-11 place-items-center rounded bg-emerald-100 text-emerald-700">
                                <Building2 size={12} />
                              </span>
                            )}
                            <span className="min-w-0">
                              <b
                                className="block max-w-32 truncate"
                                title={item.name}
                              >
                                {item.name}
                              </b>
                              <span className={`uj-listing-type ${item.kind.toLowerCase()}`}>
                                {item.kind}
                              </span>
                              <small className="block max-w-32 truncate text-slate-400">
                                {item.location || item.category}
                              </small>
                            </span>
                          </div>
                        </td>
                        <td className="font-black text-emerald-600">
                          {item.match}%
                        </td>
                        <td>{item.views}</td>
                        <td>{item.dwell}</td>
                        <td>
                          <Chip
                            tone={item.status === "High" ? "green" : "orange"}
                          >
                            {item.status}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                    {!properties.length && (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 text-center text-slate-400"
                        >
                          No project or property activity in this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
            <Panel
              title={`Listings posted by ${user?.name || "this user"}`}
              subtitle="Created/assigned inventory across every listing type and stage"
            >
              <div className="uj-owned-listings">
                <div className="uj-listing-filters">
                  {["all", "project", "residential", "commercial", "land", "agricultural"].map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={listingFilter === filter ? "active" : ""}
                      onClick={() => setListingFilter(filter)}
                    >
                      {title(filter)} <b>{listingCounts[filter] || 0}</b>
                    </button>
                  ))}
                </div>
                {listingsLoading ? (
                  <div className="uj-listing-empty"><LoaderCircle className="animate-spin" size={16} /> Loading user listings…</div>
                ) : visibleUserListings.length ? (
                  <div className="uj-listing-cards">
                    {visibleUserListings.map((item) => {
                      const image = listingImage(item);
                      const status = title(item.status || item.approvalStatus || item.stage || "Draft");
                      return (
                        <article key={`${item._listingKind}-${item._id}`}>
                          <span className="uj-listing-media">
                            <Building2 size={18} />
                            {image && (
                              <img
                                src={image}
                                alt={`${listingName(item)} project`}
                                loading="lazy"
                                onError={(event) => event.currentTarget.remove()}
                              />
                            )}
                          </span>
                          <div>
                            <div className="uj-listing-card-head">
                              <i className={`uj-listing-type ${item._listingKind === "Project" ? "project" : "property"}`}>{item._listingKind === "Project" ? "Project" : "Property"}</i>
                              <em>{item._listingKind}</em>
                            </div>
                            <b title={listingName(item)}>{listingName(item)}</b>
                            <small><MapPin size={9} /> {listingLocation(item)}</small>
                            <footer>
                              <span>{status}</span>
                              <time>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "Date unavailable"}</time>
                            </footer>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="uj-listing-empty">No {listingFilter === "all" ? "created or assigned" : listingFilter} listings found for this user.</div>
                )}
              </div>
            </Panel>
          </div>
          <div className="grid gap-2 lg:grid-cols-4">
            <Panel
              title={`Multi-session Timeline (${journey?.sessions || 0} Sessions)`}
              subtitle={`${mobileSessions} mobile · ${desktopSessions} desktop`}
            >
              <div className="p-3">
                <div className="uj-session-grid">
                  <span className="uj-time-label uj-time-6">6 AM</span>
                  <span className="uj-time-label uj-time-12">12 PM</span>
                  <span className="uj-time-label uj-time-18">6 PM</span>
                  {timelinePoints.map((point) => (
                    <i
                      key={point.id}
                      title={point.label}
                      className={
                        point.mobile ? "bg-emerald-500" : "bg-blue-500"
                      }
                      style={{ left: `${point.left}%`, top: `${point.top}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex gap-3 text-[8px]">
                  <span className="text-emerald-600">
                    ● Mobile {mobileSessions}
                  </span>
                  <span className="text-blue-600">
                    ● Desktop {desktopSessions}
                  </span>
                  {!timelinePoints.length && (
                    <span className="text-slate-400">
                      No sessions in this period
                    </span>
                  )}
                </div>
              </div>
            </Panel>
            <Panel
              title={
                hasCreatorActivity ? "Creator Activity" : "Conversion Funnel"
              }
              subtitle={
                hasCreatorActivity
                  ? `${listingActivity.totalPosted} listings posted in this period`
                  : "End-to-end progression"
              }
            >
              <div className="flex h-36 items-end gap-1 p-3">
                {visibleFunnel.map(([name, pct], index) => (
                  <div
                    key={name}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1"
                    title={`${name}: ${visibleFunnelCounts[index]} captured`}
                  >
                    <b className="text-[9px]">{pct}%</b>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-emerald-100 to-emerald-400"
                      style={{ height: `${Math.max(8, pct * 0.75)}px` }}
                    />
                    <small className="min-h-5 text-center text-[7px] leading-[9px] text-slate-500">
                      {name}
                    </small>
                    <small className="text-[8px] font-bold text-slate-700">
                      {visibleFunnelCounts[index]}
                    </small>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel
              title="Friction & Risk"
              subtitle="Signals requiring attention"
            >
              <div className="space-y-2 p-3 text-[8px]">
                {detectedRisks.map(([name, total, status]) => (
                  <div
                    className="flex items-center justify-between gap-2"
                    key={name}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <i
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status === "High" ? "bg-red-500" : "bg-orange-400"}`}
                      />
                      {name}
                    </span>
                    <b>{total}</b>
                    <Chip tone="orange">{status}</Chip>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 p-2">
                  <span className="font-bold text-emerald-700">
                    {detectedRisks.length
                      ? `${detectedRisks.length} risk signal${detectedRisks.length > 1 ? "s" : ""} detected`
                      : "No fraud or friction detected"}
                  </span>
                  <Chip>{detectedRisks.length ? "Review" : "Clear"}</Chip>
                </div>
              </div>
            </Panel>
            <Panel
              title="Location Interest Heatmap"
              subtitle="Behavioral hotspots from viewed listings"
            >
              <div className="relative h-40 overflow-hidden bg-[radial-gradient(circle_at_20%_40%,#dbeafe,transparent_18%),radial-gradient(circle_at_70%_60%,#d1fae5,transparent_22%),linear-gradient(135deg,#f8fafc,#e2e8f0)]">
                {hotspots.map((spot) => (
                  <span key={spot.name}>
                    <i
                      className="uj-map-dot"
                      style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
                    />
                    <small
                      className="absolute max-w-32 -translate-x-1/2 rounded bg-white/85 px-1.5 py-0.5 text-center text-[8px] font-bold text-slate-700 shadow-sm"
                      title={spot.name}
                      style={{
                        left: `${spot.left}%`,
                        top: `${Math.min(82, spot.top + 17)}%`,
                      }}
                    >
                      {spot.name.split(",")[0]}
                    </small>
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>
        <DynamicInsightRail journey={journey} user={user} notify={notify} />
      </section>
      <footer className="mt-2 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-[8px] text-emerald-800">
        <ShieldCheck size={13} />
        <b>Consent active</b>
        <span>· PII masked</span>
        <span>· Role-based access</span>
        <span>· Audit logged</span>
        <span>· Retention 90 days</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </footer>
    </div>
  );
}
