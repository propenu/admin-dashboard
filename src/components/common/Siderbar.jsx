// src/components/common/Sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import DashboardIcon from "../../assets/dashboard/dashboard.svg";
import PropertiesIcon from "../../assets/dashboard/Properties.svg";
import PropertyProgressIcon from "../../assets/dashboard/property_progress.svg";
import FeaturedProjetsIcon from "../../assets/dashboard/prime_projects.svg";
import HighlightedProjectsIcon from "../../assets/dashboard/top_selling.svg";
import ResidentialIcon from "../../assets/dashboard/residential.svg";
import AgriculturalIcon from "../../assets/dashboard/agriculture.svg";
import CommercialIcon from "../../assets/dashboard/commercial.svg";
import LandIcon from "../../assets/dashboard/land.svg";
import UserIcon from "../../assets/dashboard/user.svg";
import AllUsersIcon from "../../assets/dashboard/all_user.svg";
import TeamManagementIcon from "../../assets/dashboard/team_management.svg";
import SalesManagerIcon from "../../assets/dashboard/sales_manager.svg";
import SalesAgentIcon from "../../assets/dashboard/sales_agent.svg";
import BuilderIcon from "../../assets/dashboard/builder.svg";
import AgentIcon from "../../assets/dashboard/agent.svg";
import AccountsIcon from "../../assets/dashboard/accounts.svg";
import CreateCredentialsIcon from "../../assets/dashboard/create_credentials.svg";
import SubcriptinIcon from "../../assets/dashboard/subscription.svg";
import PostPropertyIcon from "../../assets/dashboard/post_property.svg";
import PropertyViewIcon from "../../assets/dashboard/property_view.svg";
import OwnerIcon from "../../assets/dashboard/owner.svg";
import PostProprtSellerIcon from "../../assets/dashboard/users_Buyers.svg";
import LocationsIcon from "../../assets/dashboard/location.svg";
import AccountsSummaryIcon from "../../assets/dashboard/account.svg";
import PaymentsListIcon from "../../assets/dashboard/payment_list.svg";
import ActiveSubcriptionsIcon from "../../assets/dashboard/active_subscription.svg";
import SubcriptionHistoryIcon from "../../assets/dashboard/subscription_history.svg";
import RevenueByPlanIcon from "../../assets/dashboard/revenue_by_plan.svg";

import { UserCircle, ChevronDown, ChevronRight } from "lucide-react";
import CreateUserModal from "./CreateUserModal";
import AssignManagerPage from "./AssignManager";
import TransferCredentials from "./TransferCredentials";

/* ─── Reusable Icon wrapper ──────────────────────────────────────────────── */
// All icons — top-level, child, and sub-child — use this component so they
// are always the same physical size and aligned identically.
const NavIcon = ({ src, active, isParent = false, size = "md" }) => {
  const dim = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  let filterStyle = {};
  if (active) {
    if (isParent) {
      // Turn icon green (#27AE60) for active parent
      filterStyle = {
        filter:
          "invert(59%) sepia(61%) saturate(456%) hue-rotate(95deg) brightness(92%) contrast(88%)",
      };
    } else {
      // Turn icon pure WHITE for active child (sitting on green bg)
      filterStyle = {
        filter: "brightness(0) invert(1)",
      };
    }
  }

  return (
    <span className="flex items-center justify-center w-8 h-8 flex-shrink-0">
      <img
        src={src}
        alt="icons"
        className={`${dim} object-contain transition-all duration-200`}
        style={filterStyle}
      />
    </span>
  );
};
export default function Sidebar({
  expanded,
  isMobileOpen,
  closeMobile,
  onHoverStart,
  onHoverEnd,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
  const [showTrancforCredentails, setShowTrancforCredentails] = useState(false);
  const [user, setUser] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  /* ── helpers ── */
  const isActiveRoute = (path) => location.pathname === path;

  const hasActiveDescendant = (item) => {
    if (!item?.children) return false;
    return item.children.some(
      (child) =>
        (child.path && isActiveRoute(child.path)) ||
        hasActiveDescendant(child),
    );
  };

  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── load user ── */
  useEffect(() => {
    fetchLoggedInUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  /* ── auto-open active parent menus ── */
  useEffect(() => {
    if (!user) return;
    const autoOpen = {};
    const walk = (items) =>
      items.forEach((item) => {
        if (hasActiveDescendant(item) && item.key) autoOpen[item.key] = true;
        if (item.children) walk(item.children);
      });
    walk(getMenuByRole(user.roleName));
    setOpenMenus((prev) => ({ ...prev, ...autoOpen }));
  }, [location.pathname, user]);

  /* ── menu config ── */
  const getMenuByRole = (role) =>
    ({
      super_admin: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: PropertyProgressIcon,
        },
        {
          path: "/featured-properties",
          label: "Prime Projects",
          icon: FeaturedProjetsIcon,
        },
        {
          path: "/highlight-projects",
          label: "Top Selling Projects",
          icon: HighlightedProjectsIcon,
        },
        {
          label: "Users",
          icon: UserIcon,
          key: "users",
          children: [
            { path: "/users", label: "All Users", icon: AllUsersIcon },
            {
              path: "/team-management",
              label: "Team Management",
              icon: TeamManagementIcon,
            },
            {
              path: "/sales-managers",
              label: "Sales Managers",
              icon: SalesManagerIcon,
            },
            {
              path: "/sales-agents",
              label: "Sales Executive",
              icon: SalesAgentIcon,
            },
            { path: "/builders", label: "Builders", icon: BuilderIcon },
            { path: "/all-agents", label: "Agents", icon: AgentIcon },
            { path: "/accounts", label: "Accounts", icon: AccountsIcon },
            {
              path: "/customercare",
              label: "Customer Care",
              icon: LocationsIcon,
            },
            {
              label: "Create Credentials",
              icon: CreateCredentialsIcon,
              key: "create-credentials",
              action: "openCreateUserModal",
            },
            {
              label: "Transfer Credentials",
              icon: CreateCredentialsIcon,
              key: "transfer-credentials",
              action: "openTranforCredentialsModal",
            },
            {
              label: "Assign Agent",
              icon: AgentIcon,
              key: "assign-agent",
              action: "openAssignAgentModal",
            },
          ],
        },
        {
          label: "Subscriptions",
          icon: SubcriptinIcon,
          key: "subscriptions",
          children: [
            { path: "/agent-payments", label: "Agent", icon: AgentIcon },
            {
              label: "Post Property",
              key: "post-property",
              icon: PostPropertyIcon,
              children: [
                {
                  path: "/owner-sell-property",
                  label: "Owner-Sell",
                  icon: OwnerIcon,
                },
                {
                  path: "/owner-rent-property",
                  label: "Owner-Rent",
                  icon: OwnerIcon,
                },
              ],
            },
            {
              label: "Property View",
              key: "property-view",
              icon: PropertyViewIcon,
              children: [
                {
                  path: "/owner-buy-view",
                  label: "Owner-Buy",
                  icon: PostProprtSellerIcon,
                },
                {
                  path: "/owner-rent-view",
                  label: "Owner-Rent",
                  icon: PostProprtSellerIcon,
                },
              ],
            },
          ],
        },
        { path: "/locations", label: "Locations", icon: LocationsIcon },

        {
          label: "Accounts",
          icon: AccountsIcon,
          key: "accounts",
          children: [
            {
              path: "/accounts-summary",
              label: "Accounts Summary",
              icon: AccountsSummaryIcon,
            },
            {
              path: "/paymets-list",
              label: "Payments List",
              icon: PaymentsListIcon,
            },
            {
              path: "/active-subscriptions",
              label: "Active Subscriptions",
              icon: ActiveSubcriptionsIcon,
            },
            {
              path: "/subscription-history",
              label: "Subscription History",
              icon: SubcriptionHistoryIcon,
            },
            {
              path: "/Revenue-by-plan",
              label: "Revenue By Plan",
              icon: RevenueByPlanIcon,
            },
          ],
        },
        {
          path: "/push-notifications",
          label: "Push Notifications",
          icon: LocationsIcon,
        },
        {
          path: "/email-notifications",
          label: "Email Notifications",
          icon: LocationsIcon,
        },
        {
          path: "/whatsapp-notifications",
          label: "WhatsApp Notifications",
          icon: LocationsIcon,
        },
      ],

      builder: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          path: "/featured-properties",
          label: "Prime Projects",
          icon: FeaturedProjetsIcon,
        },
        {
          path: "/highlight-projects",
          label: "Top Selling Projects",
          icon: HighlightedProjectsIcon,
        },
      ],

      admin: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: PropertyProgressIcon,
        },
        {
          path: "/featured-properties",
          label: "Prime Projects",
          icon: FeaturedProjetsIcon,
        },
        {
          path: "/highlight-projects",
          label: "Top Selling Projects",
          icon: HighlightedProjectsIcon,
        },
        {
          label: "Users",
          icon: UserIcon,
          key: "users",
          children: [
            { path: "/users", label: "All Users", icon: AllUsersIcon },
            {
              path: "/team-management",
              label: "Team Member Details",
              icon: TeamManagementIcon,
            },
            {
              label: "Create Credentials",
              icon: CreateCredentialsIcon,
              key: "create-credentials",
              action: "openCreateUserModal",
            },
          ],
        },
        {
          label: "Subscriptions",
          icon: SubcriptinIcon,
          key: "subscriptions",
          children: [
            { path: "/agent-payments", label: "Agent", icon: AgentIcon },
            {
              label: "Post Property",
              key: "post-property",
              icon: PostPropertyIcon,
              children: [
                {
                  path: "/owner-sell-property",
                  label: "Owner-Sell",
                  icon: PostPropertyIcon,
                },
                {
                  path: "/owner-rent-property",
                  label: "Owner-Rent",
                  icon: PostPropertyIcon,
                },
              ],
            },
            {
              label: "Property View",
              key: "property-view",
              icon: PropertyViewIcon,
              children: [
                {
                  path: "/owner-buy-view",
                  label: "Owner-Buy",
                  icon: PropertyViewIcon,
                },
                {
                  path: "/owner-rent-view",
                  label: "Owner-Rent",
                  icon: PropertyViewIcon,
                },
              ],
            },
          ],
        },
        { path: "/locations", label: "Locations", icon: LocationsIcon },
        {
          label: "Accounts",
          icon: AccountsIcon,
          key: "accounts",
          children: [
            {
              path: "/accounts-summary",
              label: "Accounts Summary",
              icon: AccountsSummaryIcon,
            },
            {
              path: "/paymets-list",
              label: "Payments List",
              icon: PaymentsListIcon,
            },
            {
              path: "/active-subscriptions",
              label: "Active Subscriptions",
              icon: ActiveSubcriptionsIcon,
            },
            {
              path: "/subscription-history",
              label: "Subscription History",
              icon: SubcriptionHistoryIcon,
            },
            {
              path: "/Revenue-by-plan",
              label: "Revenue By Plan",
              icon: RevenueByPlanIcon,
            },
          ],
        },
      ],

      sales_manager: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          path: "/featured-properties",
          label: "Prime Projects",
          icon: FeaturedProjetsIcon,
        },
        {
          path: "/highlight-projects",
          label: "Top Selling Projects",
          icon: HighlightedProjectsIcon,
        },
      ],

      sales_agent: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: PropertyProgressIcon,
        },
        {
          path: "/featured-properties",
          label: "Prime Projects",
          icon: FeaturedProjetsIcon,
        },
        {
          path: "/highlight-projects",
          label: "Top Selling Projects",
          icon: HighlightedProjectsIcon,
        },
      ],

      customer_care: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: PropertyProgressIcon,
        },
        // {
        //   path: "/featured-properties",
        //   label: "Featured Projects",
        //   icon: FeaturedProjetsIcon,
        // },
        // {
        //   path: "/highlight-projects",
        //   label: "Highlight Projects",
        //   icon: HighlightedProjectsIcon,
        // },
      ],

      accounts: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Properties",
          icon: PropertiesIcon,
          key: "properties",
          children: [
            {
              path: "/residential",
              label: "Residential",
              icon: ResidentialIcon,
            },
            { path: "/commercial", label: "Commercial", icon: CommercialIcon },
            {
              path: "/agricultural",
              label: "Agricultural",
              icon: AgriculturalIcon,
            },
            { path: "/land", label: "Land", icon: LandIcon },
          ],
        },
        {
          label: "Subscriptions",
          icon: SubcriptinIcon,
          key: "subscriptions",
          children: [
            { path: "/agent-payments", label: "Agent", icon: AgentIcon },
            {
              label: "Post Property",
              key: "post-property",
              icon: PostPropertyIcon,
              children: [
                {
                  path: "/owner-sell-property",
                  label: "Owner-Sell",
                  icon: PostPropertyIcon,
                },
                {
                  path: "/owner-rent-property",
                  label: "Owner-Rent",
                  icon: PostPropertyIcon,
                },
              ],
            },
            {
              label: "Property View",
              key: "property-view",
              icon: PropertyViewIcon,
              children: [
                {
                  path: "/owner-buy-view",
                  label: "Owner-Buy",
                  icon: PropertyViewIcon,
                },
                {
                  path: "/owner-rent-view",
                  label: "Owner-Rent",
                  icon: PropertyViewIcon,
                },
              ],
            },
          ],
        },
        {
          label: "Accounts",
          icon: AccountsIcon,
          key: "accounts",
          children: [
            {
              path: "/accounts-summary",
              label: "Accounts Summary",
              icon: AccountsSummaryIcon,
            },
            {
              path: "/paymets-list",
              label: "Payments List",
              icon: PaymentsListIcon,
            },
            {
              path: "/active-subscriptions",
              label: "Active Subscriptions",
              icon: ActiveSubcriptionsIcon,
            },
            {
              path: "/subscription-history",
              label: "Subscription History",
              icon: SubcriptionHistoryIcon,
            },
            {
              path: "/Revenue-by-plan",
              label: "Revenue By Plan",
              icon: RevenueByPlanIcon,
            },
          ],
        },
      ],
    })[role] || [];

  const menuItems = user ? getMenuByRole(user.roleName) : [];
  const showText = expanded || isMobileOpen;

  /* ── render ── */
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200
          z-50 flex flex-col transition-all duration-200
          ${expanded ? "lg:w-64" : "lg:w-[68px]"}
          ${isMobileOpen ? "w-64" : "lg:translate-x-0 -translate-x-full"}`}
      >
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar space-y-0.5">
          {menuItems.map((item) => {
            const active = hasActiveDescendant(item);

            /* ── Parent with children ── */
            if (item.children) {
              return (
                <div key={item.key}>
                  {/* Parent toggle button */}
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center px-2 py-2 rounded-lg
                      ${showText ? "justify-between" : "justify-center"}
                      ${active ? "bg-green-50 text-[#27AE60]" : "hover:bg-gray-50 text-gray-700"}`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Parent toggle button icon */}
                      <NavIcon
                        src={item.icon}
                        active={active}
                        isParent={true}
                      />
                      {showText && (
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {showText && (
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
                          ${openMenus[item.key] ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {/* Children */}
                  {openMenus[item.key] && showText && (
                    <div className="relative ml-4 mt-0.5 space-y-0.5">
                      {/* Vertical guide line — stops at the last child's midpoint */}
                      <div
                        className="absolute left-[15px] top-0 w-px bg-gray-200"
                        style={{ height: `calc(100% - 23px)` }}
                      />

                      {item.children.map((child) => {
                        const childSelfActive =
                          child.path && isActiveRoute(child.path);
                        const childHasActive = hasActiveDescendant(child);
                        const childActive = childSelfActive || childHasActive;

                        return (
                          <div
                            key={child.key || child.path}
                            className="relative"
                          >
                            <div className="absolute left-[15px] top-1/2 w-3 h-px bg-gray-200" />

                            <button
                              onClick={() => {
                                if (child.action === "openCreateUserModal") {
                                  setShowCreateModal(true);
                                } else if (
                                  child.action === "openTranforCredentialsModal"
                                ){
                                  setShowTrancforCredentails(true)                              
                                 }
                                 else if (
                                  child.action === "openAssignAgentModal"
                                ) {
                                  setShowAssignAgentModal(true);
                                } else if (child.children) {
                                  toggleMenu(child.key);
                                } else {
                                  navigate(child.path);
                                }
                              }}
                              className={`relative ml-7 w-[calc(100%-28px)] flex items-center justify-between
          px-2 py-2 rounded-lg text-sm
          ${
            childSelfActive
              ? "bg-[#27AE60] text-white" // only self-active = full green
              : childHasActive
                ? "bg-green-50 text-[#27AE60]" // has active child = light green (like parent)
                : "hover:bg-gray-50 text-gray-700" // inactive = default
          }`}
                            >
                              <div className="flex items-center gap-2">
                                <NavIcon
                                  src={child.icon}
                                  active={childActive}
                                  isParent={childHasActive && !childSelfActive} // green icon when it's a parent of active
                                />
                                <span className="truncate">{child.label}</span>
                              </div>
                              {child.children && (
                                <ChevronRight
                                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
              ${openMenus[child.key] ? "rotate-90" : ""}`}
                                />
                              )}
                            </button>

                            {/* Sub-children */}
                            {child.children && openMenus[child.key] && (
                              <div className="relative ml-7 mt-0.5 space-y-0.5">
                                <div
                                  className="absolute left-[15px] top-0 w-px bg-gray-200"
                                  style={{ height: "calc(100% - 23px)" }}
                                />
                                {child.children.map((sub) => {
                                  const subActive = isActiveRoute(sub.path);
                                  return (
                                    <div key={sub.path} className="relative">
                                      <div className="absolute left-[15px] top-1/2 w-3 h-px bg-gray-200" />
                                      <button
                                        onClick={() => navigate(sub.path)}
                                        className={`relative ml-7 w-[calc(100%-28px)] flex items-center gap-2
                    px-2 py-2 rounded-lg text-xs
                    ${
                      subActive
                        ? "bg-[#27AE60] text-white"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                                      >
                                        <NavIcon
                                          src={sub.icon}
                                          active={subActive}
                                          size="sm"
                                        />
                                        <span className="truncate">
                                          {sub.label}
                                        </span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            /* ── Top-level leaf item ── */
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg
                  ${showText ? "justify-start" : "justify-center"}
                  ${
                    isActiveRoute(item.path)
                      ? "bg-[#27AE60] text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <NavIcon src={item.icon} active={isActiveRoute(item.path)} />
                {showText && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        {user && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#27AE60] flex items-center justify-center shadow-sm flex-shrink-0">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              {showText && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate uppercase">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-500 capitalize truncate">
                    {user.roleName?.replace("_", " ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}

      {showAssignAgentModal && (
        <AssignManagerPage onClose={() => setShowAssignAgentModal(false)} />
      )}

      {showTrancforCredentails && (
        <TransferCredentials onClose={() => setShowTrancforCredentails(false)} />
      )}
    </>
  );
}