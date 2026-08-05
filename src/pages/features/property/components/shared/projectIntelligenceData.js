import { inDateRange } from "../../../../Dashboards/shared/dashboardDateRange";

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const statusKey = (value = "") => String(value || "").trim().toLowerCase();

const leadTime = (lead = {}) => lead.sourceCreatedAt || lead.createdAt || lead.updatedAt;

export const PROJECT_INTEL_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

export const isNewLead = (lead) => statusKey(lead?.status).includes("new");
export const isContactedLead = (lead) => statusKey(lead?.status).includes("contact");
export const isFollowUpLead = (lead) => statusKey(lead?.status).includes("follow");
export const isSiteVisitLead = (lead) =>
  statusKey(lead?.status).includes("site_visit") || statusKey(lead?.status).includes("site visit");
export const isQualifiedLead = (lead) => {
  const s = statusKey(lead?.status);
  return (
    s.includes("qualified") ||
    s.includes("hot") ||
    s.includes("negotiation") ||
    s.includes("interested")
  );
};
export const isBookedLead = (lead) => {
  const s = statusKey(lead?.status);
  return s.includes("book") || s.includes("sale") || s.includes("closed") || s.includes("converted");
};

export const maskPhone = (phone = "") => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 6) return phone || "—";
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
};

export const relativeTime = (value) => {
  if (!value) return "—";
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) return "—";
  const diff = Date.now() - ms;
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  return `${Math.round(diff / 86_400_000)}d ago`;
};

const leadSource = (lead = {}) =>
  lead.source || lead.leadSource || lead.channel || lead.utmSource || "Website";

const leadOwner = (lead = {}) =>
  lead.assignedTo?.name ||
  lead.ownerName ||
  lead.followUpAssignedTo?.name ||
  lead.createdBy?.name ||
  "Unassigned";

const eventTs = (event = {}) =>
  event.serverTimestamp ||
  event.clientTimestamp ||
  event.when ||
  event.createdAt ||
  event.timestamp;

const eventType = (event = {}) => String(event.eventType || event.action || event.actionKey || "").toLowerCase();

const isViewEvent = (type) =>
  /view|impression|page_view|project_view|featured_project/.test(type);
const isClickEvent = (type) => /click|cta|search_result_click/.test(type);
const isVisitEvent = (type) => /site_visit|visit_book|booking_started/.test(type);
const isGalleryEvent = (type) => /gallery/.test(type);
const isFloorPlanEvent = (type) => /floor|plan/.test(type);
const isPriceEvent = (type) => /price|emi|calculator/.test(type);
const isAmenityEvent = (type) => /amenit/.test(type);

const buildSpark = (dailyMap, days = 14) => {
  const points = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    points.push(asNumber(dailyMap.get(key)));
  }
  return points;
};

const pct = (part, whole) => {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
};

/**
 * Build Project Intelligence model from existing project + leads + optional activity feed.
 * Never invents counts — activity-backed fields fall back to property.meta / lead statuses.
 */
export function mapProjectIntelligence({
  property = {},
  leads = [],
  totalLeads = 0,
  range = {},
  activityItems = [],
  activityAvailable = false,
} = {}) {
  const periodLeads = (Array.isArray(leads) ? leads : []).filter((lead) =>
    inDateRange(leadTime(lead), range),
  );

  const metaViews = asNumber(property.meta?.views);
  const metaClicks = asNumber(property.meta?.clicks);
  const metaInquiries = asNumber(property.meta?.inquiries);

  const events = (Array.isArray(activityItems) ? activityItems : [])
    .flatMap((row) => {
      if (Array.isArray(row?.events)) return row.events;
      if (row?.eventType || row?.action) return [row];
      return [];
    })
    .filter((event) => {
      const pid = String(event.projectId || event.entity?.id || "");
      if (property._id && pid && pid !== String(property._id)) return false;
      return inDateRange(eventTs(event), range);
    });

  const viewEvents = events.filter(
    (e) => isViewEvent(eventType(e)) || e.actionKey === "views" || e.actionKey === "browsing",
  );
  const clickEvents = events.filter((e) => isClickEvent(eventType(e)));
  const visitEvents = events.filter(
    (e) => isVisitEvent(eventType(e)) || e.actionKey === "visits",
  );

  const uniqueVisitors = new Set(
    viewEvents
      .map((e) => String(e.userId || e.who?.userId || e.sessionId || ""))
      .filter(Boolean),
  ).size;

  const views = activityAvailable && viewEvents.length ? viewEvents.length : metaViews;
  const clicks = activityAvailable && clickEvents.length ? clickEvents.length : metaClicks;
  const leadCount =
    range.from || range.to ? periodLeads.length : periodLeads.length || totalLeads;
  const inquiries =
    range.from || range.to
      ? Math.max(periodLeads.length, 0)
      : Math.max(metaInquiries, leadCount);
  const siteVisits = Math.max(
    periodLeads.filter(isSiteVisitLead).length,
    visitEvents.length,
  );
  const bookings = periodLeads.filter(isBookedLead).length;
  const updateCount = asNumber(property.updateCount);

  const viewsByDay = new Map();
  const clicksByDay = new Map();
  viewEvents.forEach((e) => {
    const key = new Date(eventTs(e)).toISOString().slice(0, 10);
    viewsByDay.set(key, asNumber(viewsByDay.get(key)) + 1);
  });
  clickEvents.forEach((e) => {
    const key = new Date(eventTs(e)).toISOString().slice(0, 10);
    clicksByDay.set(key, asNumber(clicksByDay.get(key)) + 1);
  });

  const viewSpark = buildSpark(viewsByDay);
  const clickSpark = buildSpark(clicksByDay);
  const leadSpark = (() => {
    const map = new Map();
    periodLeads.forEach((lead) => {
      const key = new Date(leadTime(lead)).toISOString().slice(0, 10);
      if (!Number.isNaN(new Date(key).getTime())) {
        map.set(key, asNumber(map.get(key)) + 1);
      }
    });
    return buildSpark(map);
  })();

  const funnel = [
    { key: "viewed", label: "Viewed", volume: views },
    { key: "clicked", label: "Clicked", volume: clicks },
    { key: "inquiry", label: "Inquiry", volume: inquiries || leadCount },
    { key: "lead", label: "Lead", volume: leadCount },
    { key: "site_visit", label: "Site visit", volume: siteVisits },
    { key: "booked", label: "Booked", volume: bookings },
  ];

  let insight = null;
  if (views > 0 && clicks / views < 0.35) {
    insight = {
      tone: "orange",
      text: `Big drop Views → Clicks ${pct(views - clicks, views)}% — improve CTA`,
    };
  } else if (leadCount > 0 && siteVisits / leadCount < 0.15) {
    insight = {
      tone: "orange",
      text: `Only ${pct(siteVisits, leadCount)}% of leads reach site visit — nudge follow-up`,
    };
  } else if (leadCount === 0 && views > 0) {
    insight = {
      tone: "slate",
      text: "Browsing activity exists but no leads in this period yet",
    };
  }

  const sourceMap = new Map();
  events.forEach((e) => {
    const src = e.source || e.utmSource || e.referrerHost || "Direct";
    const label = String(src).replace(/^https?:\/\//, "").split("/")[0] || "Direct";
    sourceMap.set(label, asNumber(sourceMap.get(label)) + 1);
  });
  if (!sourceMap.size) {
    periodLeads.forEach((lead) => {
      const src = leadSource(lead);
      sourceMap.set(src, asNumber(sourceMap.get(src)) + 1);
    });
  }
  const sourceTotal = [...sourceMap.values()].reduce((s, n) => s + n, 0) || 1;
  const sourceMix = [...sourceMap.entries()]
    .map(([label, value]) => ({
      label,
      value,
      percentage: Math.round((value / sourceTotal) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  let mobile = 0;
  let desktop = 0;
  events.forEach((e) => {
    const device = String(e.deviceType || e.device || e.uaDevice || "").toLowerCase();
    if (device.includes("mobile") || device.includes("android") || device.includes("iphone")) {
      mobile += 1;
    } else if (device) {
      desktop += 1;
    }
  });
  const deviceTotal = mobile + desktop;
  const deviceSplit = {
    mobile: deviceTotal ? Math.round((mobile / deviceTotal) * 100) : null,
    desktop: deviceTotal ? Math.round((desktop / deviceTotal) * 100) : null,
  };

  const sectionCounts = {
    Gallery: events.filter((e) => isGalleryEvent(eventType(e))).length,
    "Floor plan": events.filter((e) => isFloorPlanEvent(eventType(e))).length,
    Price: events.filter((e) => isPriceEvent(eventType(e))).length,
    Amenities: events.filter((e) => isAmenityEvent(eventType(e))).length,
  };
  const sectionTotal =
    Object.values(sectionCounts).reduce((s, n) => s + n, 0) || 1;
  const topSections = Object.entries(sectionCounts)
    .map(([label, value]) => ({
      label,
      value,
      percentage: Math.round((value / sectionTotal) * 100),
    }))
    .filter((row) => row.value > 0 || activityAvailable)
    .sort((a, b) => b.value - a.value);

  const trendRows = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendRows.push({
      key,
      label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      views: asNumber(viewsByDay.get(key)),
      clicks: asNumber(clicksByDay.get(key)),
    });
  }

  const upcomingVisits = periodLeads
    .filter(isSiteVisitLead)
    .slice(0, 6)
    .map((lead) => ({
      id: lead._id || lead.id,
      name: lead.name || "Visitor",
      when: lead.siteVisitAt || lead.followUpAt || lead.updatedAt || lead.createdAt,
      agent: leadOwner(lead),
      phone: lead.phone,
    }));

  const leadRows = periodLeads.slice(0, 40).map((lead) => ({
    id: lead._id || lead.id,
    name: lead.name || "Lead",
    phone: maskPhone(lead.phone),
    source: leadSource(lead),
    status: lead.status || "new_lead",
    owner: leadOwner(lead),
    when: leadTime(lead),
    raw: lead,
  }));

  const timeline = [
    ...events.slice(0, 30).map((e) => ({
      id: String(e._id || `${eventType(e)}-${eventTs(e)}`),
      kind: isVisitEvent(eventType(e))
        ? "site_visits"
        : isViewEvent(eventType(e)) || isClickEvent(eventType(e))
          ? "browsing"
          : "browsing",
      title: e.what || e.label || e.summary || eventType(e).replace(/_/g, " "),
      detail: [
        e.who?.city || e.city || e.entity?.location,
        e.who?.name,
        e.deviceType || e.device,
        e.source,
      ]
        .filter(Boolean)
        .join(" · "),
      when: eventTs(e),
      hrefKind: "activity",
    })),
    ...periodLeads.slice(0, 20).map((lead) => ({
      id: `lead-${lead._id || lead.id}`,
      kind: isSiteVisitLead(lead) ? "site_visits" : "leads",
      title: isSiteVisitLead(lead)
        ? `Site visit · ${lead.name || "Lead"}`
        : `Lead created · ${lead.name || "Lead"}`,
      detail: [leadSource(lead), leadOwner(lead), lead.status]
        .filter(Boolean)
        .join(" · "),
      when: leadTime(lead),
      hrefKind: "lead",
      leadId: lead._id || lead.id,
    })),
  ]
    .sort((a, b) => new Date(b.when || 0) - new Date(a.when || 0))
    .slice(0, 40);

  return {
    summary: {
      views,
      uniqueVisitors: uniqueVisitors || null,
      clicks,
      inquiries: inquiries || leadCount,
      leads: leadCount,
      siteVisits,
      bookings,
      updateCount,
      activityAvailable,
    },
    sparks: {
      views: viewSpark,
      visitors: viewSpark,
      clicks: clickSpark,
      inquiries: leadSpark,
      leads: leadSpark,
      siteVisits: buildSpark(
        new Map(
          periodLeads.filter(isSiteVisitLead).map((l) => {
            const key = new Date(leadTime(l)).toISOString().slice(0, 10);
            return [key, 1];
          }),
        ),
      ),
      bookings: buildSpark(
        new Map(
          periodLeads.filter(isBookedLead).map((l) => {
            const key = new Date(leadTime(l)).toISOString().slice(0, 10);
            return [key, 1];
          }),
        ),
      ),
      updates: Array(14).fill(0).map((_, i, arr) => (i === arr.length - 1 ? updateCount : 0)),
    },
    funnel,
    insight,
    leadRows,
    leadCounts: {
      all: leadRows.length,
      new: periodLeads.filter(isNewLead).length,
      contacted: periodLeads.filter(isContactedLead).length,
      site_visit: periodLeads.filter(isSiteVisitLead).length,
      qualified: periodLeads.filter(isQualifiedLead).length,
    },
    upcomingVisits,
    trendRows,
    sourceMix,
    deviceSplit,
    topSections,
    timeline,
  };
}
