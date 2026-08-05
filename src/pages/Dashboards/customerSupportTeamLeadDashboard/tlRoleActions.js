/**
 * On-dashboard jumps only.
 * Sidebar = pages (queue, tickets, projects…).
 * Header tabs = Performance / Team Directory.
 */
export function buildTlRoleActions() {
  return [
    {
      id: "staff-analysis",
      label: "Staff analysis",
      hint: "CCE load on this screen",
      kind: "anchor",
      anchor: "tl-staff-analysis",
    },
    {
      id: "ticket-desk",
      label: "Assign tickets",
      hint: "Ticket workspace below",
      kind: "anchor",
      anchor: "tl-ticket-queue",
    },
    {
      id: "head-report",
      label: "Report to Head",
      hint: "Pack for Support Head",
      kind: "anchor",
      anchor: "tl-head-report",
    },
  ];
}
