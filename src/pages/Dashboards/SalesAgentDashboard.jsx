import SalesExecutiveHub from "./salesExecutiveDashboard/SalesExecutiveHub";

/**
 * Sales Executive home — client hub (location search, meetings, inventory,
 * subscription, follow-ups). Role keys: sales_agent / sales_executive
 *
 * Previous workflow-finder panels remain under salesExecutiveDashboard/components
 * (SeKpiStrip, SeQueuePanel, …) and are unused here so existing code is not broken.
 */
export default function SalesAgentDashboard() {
  return <SalesExecutiveHub />;
}
