const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getId = (row) => String(row?._id || row?.id || "").trim();

const ticketStatus = (ticket) =>
  String(ticket?.status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const isOpenTicket = (ticket) => {
  const status = ticketStatus(ticket);
  return !["resolved", "closed", "cancelled", "canceled"].includes(status);
};

const listingStatus = (row) => String(row?.status || "").trim().toLowerCase();

const listingHref = (row) => {
  const id = getId(row);
  if (!id) return "/properties";
  const category = String(row?.category || "").trim().toLowerCase();
  if (category === "featured" || category === "project" || category === "featured_project") {
    return `/featured-project/${id}`;
  }
  if (["residential", "commercial", "land", "agricultural"].includes(category)) {
    return `/property/${category}/${id}`;
  }
  return "/properties";
};

export const SE_QUEUE_TABS = [
  { key: "all", label: "All work" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "Onboarding" },
  { key: "active", label: "Live" },
  { key: "tickets", label: "Blockers" },
  { key: "leads", label: "Leads" },
];

export const KPI_QUEUE_TAB = {
  draftListings: "draft",
  pendingListings: "pending",
  activeListings: "active",
  openTickets: "tickets",
  leadsInPeriod: "leads",
};

export function mapSalesExecutiveData({
  analytics = {},
  tickets = [],
  leads = [],
  leadsTotal,
  currentUser = null,
  range = null,
}) {
  const listings = Array.isArray(analytics?.listings) ? analytics.listings : [];
  const total = asNumber(analytics?.totalProperties);
  const active = asNumber(analytics?.active);
  const pending = asNumber(analytics?.pending);
  const draft = asNumber(analytics?.draft);
  const views = asNumber(analytics?.totalViews);

  const openTickets = tickets.filter(isOpenTicket);
  const urgentTickets = openTickets.filter((t) =>
    ["urgent", "high", "critical"].includes(String(t?.priority || "").toLowerCase()),
  );

  const listingItems = listings.map((row) => {
    const status = listingStatus(row);
    const tab =
      status === "draft" ? "draft" : status === "pending" ? "pending" : status === "active" ? "active" : "all";
    return {
      id: `listing-${getId(row)}`,
      sourceId: getId(row),
      kind: "listing",
      category: row.category || "",
      tab,
      title: row.title || row.projectName || row.buildingName || "Untitled listing",
      subtitle: [row.locality, row.city, row.state].filter(Boolean).join(", ") || "No location",
      status,
      statusLabel: status || "unknown",
      updatedAt: row.updatedAt || row.createdAt,
      views: asNumber(row?.meta?.views),
      href: listingHref(row),
    };
  });

  const ticketItems = openTickets.map((ticket) => ({
    id: `ticket-${getId(ticket)}`,
    sourceId: getId(ticket),
    kind: "ticket",
    tab: "tickets",
    title: ticket.title || ticket.subject || "Support ticket",
    subtitle:
      ticket.ticketId ||
      ticket.code ||
      `TK-${getId(ticket).slice(-5).toUpperCase()}`,
    status: ticketStatus(ticket),
    statusLabel: ticketStatus(ticket).replaceAll("_", " ") || "open",
    priority: ticket.priority,
    updatedAt: ticket.updatedAt || ticket.createdAt,
    href: "/tickets",
  }));

  const leadItems = (Array.isArray(leads) ? leads : []).slice(0, 40).map((lead, index) => ({
    id: `lead-${getId(lead) || index}`,
    sourceId: getId(lead),
    kind: "lead",
    tab: "leads",
    title: lead.name || lead.customerName || lead.phone || "Lead",
    subtitle: lead.propertyTitle || lead.projectTitle || lead.email || "Enquiry",
    status: String(lead.status || "new").toLowerCase(),
    statusLabel: String(lead.status || "new").replaceAll("_", " "),
    updatedAt: lead.updatedAt || lead.createdAt,
    href: "/leads",
  }));

  const queueItems = [...listingItems, ...ticketItems, ...leadItems].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
  );

  const summary = {
    totalListings: total,
    activeListings: active,
    pendingListings: pending,
    draftListings: draft,
    totalViews: views,
    openTickets: openTickets.length,
    urgentTickets: urgentTickets.length,
    leadsInPeriod:
      leadsTotal != null && Number.isFinite(Number(leadsTotal))
        ? asNumber(leadsTotal)
        : leadItems.length,
    activeShare: total > 0 ? ((active / total) * 100).toFixed(1) : "0.0",
  };

  const workflowSteps = [
    { key: "post", label: "Post", done: total > 0 },
    { key: "onboard", label: "Onboard", done: total > 0 && draft === 0 },
    { key: "live", label: "Make live", done: active > 0 },
    { key: "clear", label: "Clear blockers", done: openTickets.length === 0 },
  ];

  const todayInteractions = queueItems.slice(0, 12).map((item) => ({
    id: item.id,
    type: item.kind,
    tone: item.kind === "ticket" ? "amber" : item.kind === "lead" ? "blue" : "emerald",
    title: item.title,
    summary: `${item.kind} · ${item.statusLabel}`,
    time: item.updatedAt ? new Date(item.updatedAt) : null,
  }));

  return {
    summary,
    queueItems,
    workflowSteps,
    todayInteractions,
    currentUserName:
      currentUser?.name ||
      currentUser?.fullName ||
      "Sales Executive",
    rangeLabel: range?.label || "",
    listingChart: [
      { name: "Draft", value: draft },
      { name: "Onboarding", value: pending },
      { name: "Live", value: active },
    ],
  };
}

export function filterQueueByTab(items, tab) {
  if (!tab || tab === "all") return items;
  return items.filter((item) => item.tab === tab);
}
