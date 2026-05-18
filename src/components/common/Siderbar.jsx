// // src/components/common/Sidebar.jsx
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { fetchLoggedInUser } from "../../services/UserServices/userServices";
// import DashboardIcon from "../../assets/dashboard/dashboard.svg";
// import PropertiesIcon from "../../assets/dashboard/Properties.svg";
// import PropertyProgressIcon from "../../assets/dashboard/property_progress.svg";
// import FeaturedProjetsIcon from "../../assets/dashboard/prime_projects.svg";
// import HighlightedProjectsIcon from "../../assets/dashboard/top_selling.svg";
// import ResidentialIcon from "../../assets/dashboard/residential.svg";
// import AgriculturalIcon from "../../assets/dashboard/agriculture.svg";
// import CommercialIcon from "../../assets/dashboard/commercial.svg";
// import LandIcon from "../../assets/dashboard/land.svg";
// import UserIcon from "../../assets/dashboard/user.svg";
// import AllUsersIcon from "../../assets/dashboard/all_user.svg";
// import TeamManagementIcon from "../../assets/dashboard/team_management.svg";
// import SalesManagerIcon from "../../assets/dashboard/sales_manager.svg";
// import SalesAgentIcon from "../../assets/dashboard/sales_agent.svg";
// import BuilderIcon from "../../assets/dashboard/builder.svg";
// import AgentIcon from "../../assets/dashboard/agent.svg";
// import AccountsIcon from "../../assets/dashboard/accounts.svg";
// import CreateCredentialsIcon from "../../assets/dashboard/create_credentials.svg";
// import SubcriptinIcon from "../../assets/dashboard/subscription.svg";
// import PostPropertyIcon from "../../assets/dashboard/post_property.svg";
// import PropertyViewIcon from "../../assets/dashboard/property_view.svg";
// import OwnerIcon from "../../assets/dashboard/owner.svg";
// import PostProprtSellerIcon from "../../assets/dashboard/users_Buyers.svg";
// import LocationsIcon from "../../assets/dashboard/location.svg";
// import AccountsSummaryIcon from "../../assets/dashboard/account.svg";
// import PaymentsListIcon from "../../assets/dashboard/payment_list.svg";
// import ActiveSubcriptionsIcon from "../../assets/dashboard/active_subscription.svg";
// import SubcriptionHistoryIcon from "../../assets/dashboard/subscription_history.svg";
// import RevenueByPlanIcon from "../../assets/dashboard/revenue_by_plan.svg";
// import mailnotifications from "../../assets/mailnotifications.svg";
// import normal from "../../assets/normal.svg";
// import prime from "../../assets/prime.svg";
// import ownerbuy from "../../assets/ownerbuy.svg";
// import postpropertyownerrent from "../../assets/postpropertyownerrent.svg";
// import propertyviewrent from "../../assets/propertyviewrent.svg";
// import pushnotification from "../../assets/pushnotification.svg";
// import sponsored from "../../assets/sponsored.svg";
// import whatsappnotifications from "../../assets/whatsappnotifications.svg"
// import aumattionnotifications from "../../assets/automationsnotifications.svg"



// import {
//   UserCircle,
//   ChevronDown,
//   ChevronRight,
//   Bell,
//   Mail,
//   MessageCircle,
//   Workflow
// } from "lucide-react";

// import CreateUserModal from "./CreateUserModal";
// import AssignManagerPage from "./AssignManager";
// import TransferCredentials from "./TransferCredentials";

// /* ─── Reusable Icon wrapper ──────────────────────────────────────────────── */

// const NavIcon = ({ src, active, isParent = false, size = "md" }) => {
//   const dim = size === "sm" ? "w-5 h-5" : "w-6 h-6";

//   let filterStyle = {};
//   if (active) {
//     if (isParent) {
//       // Turn icon green (#27AE60) for active parent
//       filterStyle = {
//         filter:
//           "invert(59%) sepia(61%) saturate(456%) hue-rotate(95deg) brightness(92%) contrast(88%)",
//       };
//     } else {
//       // Turn icon pure WHITE for active child (sitting on green bg)
//       filterStyle = {
//         filter: "brightness(0) invert(1)",
//       };
//     }
//   }

//   return (
//     <span className="flex items-center justify-center w-8 h-8 flex-shrink-0">
//       <img
//         src={src}
//         alt="icons"
//         className={`${dim} object-contain transition-all duration-200`}
//         style={filterStyle}
//       />
//     </span>
//   );
// };

// export default function Sidebar({
//   expanded,
//   isMobileOpen,
//   closeMobile,
//   onHoverStart,
//   onHoverEnd,
// }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
//   const [showTrancforCredentails, setShowTrancforCredentails] = useState(false);
//   const [user, setUser] = useState(null);
//   const [openMenus, setOpenMenus] = useState({});

//   /* ── helpers ── */
//   const isActiveRoute = (path) => location.pathname === path;

//   const hasActiveDescendant = (item) => {
//     if (!item?.children) return false;
//     return item.children.some(
//       (child) =>
//         (child.path && isActiveRoute(child.path)) ||
//         hasActiveDescendant(child),
//     );
//   };

//   const toggleMenu = (key) =>
//     setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

//   /* ── load user ── */
//   useEffect(() => {
//     fetchLoggedInUser()
//       .then(setUser)
//       .catch(() => {});
//   }, []);

//   /* ── auto-open active parent menus ── */
//   useEffect(() => {
//     if (!user) return;
//     const autoOpen = {};
//     const walk = (items) =>
//       items.forEach((item) => {
//         if (hasActiveDescendant(item) && item.key) autoOpen[item.key] = true;
//         if (item.children) walk(item.children);
//       });
//     walk(getMenuByRole(user.roleName));
//     setOpenMenus((prev) => ({ ...prev, ...autoOpen }));
//   }, [location.pathname, user]);

//   /* ── menu config ── */
//   const getMenuByRole = (role) =>
//     ({
//       super_admin: [
//         { path: "/", label: "Dashboard", icon: DashboardIcon },
//         {
//           label: "Properties",
//           icon: PropertiesIcon,
//           key: "properties",
//           children: [
//             {
//               path: "/residential",
//               label: "Residential",
//               icon: ResidentialIcon,
//             },
//             { path: "/commercial", label: "Commercial", icon: CommercialIcon },
//             {
//               path: "/agricultural",
//               label: "Agricultural",
//               icon: AgriculturalIcon,
//             },
//             { path: "/land", label: "Land", icon: LandIcon },
//           ],
//         },
//         {
//           path: "/property-progress",
//           label: "Property Progress",
//           icon: PropertyProgressIcon,
//         },

//         {
//           label: "Projects",
//           icon: FeaturedProjetsIcon,
//           key: "projects",
//           children: [
//             {
//               path: "/normal",
//               label: "Normal Projects",
//               icon: normal,
//             },
//             // {
//             //   path: "/featured",
//             //   label: "Top Selling Projects",
//             //   icon: HighlightedProjectsIcon,
//             // },
//             {
//               path: "/prime",
//               label: "Prime Projects",
//               icon: prime,
//             },
//             {
//               path: "/featured",
//               label: "Top Selling Projects",
//               icon: HighlightedProjectsIcon,
//             },
//             {
//               path: "/sponsored",
//               label: "Sponsored Projects",
//               icon: sponsored,
//             },
//           ],
//         },
//         // {
//         //   path: "/featured-properties",
//         //   label: "Prime Projects",
//         //   icon: FeaturedProjetsIcon,
//         // },

//         // {
//         //   path: "/highlight-projects",
//         //   label: "Top Selling Projects",
//         //   icon: HighlightedProjectsIcon,
//         // },
//         {
//           label: "Users",
//           icon: UserIcon,
//           key: "users",
//           children: [
//             { path: "/users", label: "All Users", icon: AllUsersIcon },
//             {
//               //path: "/team-management",
//               path: "/dashboard/team-management",
//               label: "Team Management",
//               icon: TeamManagementIcon,
//             },
//             {
//               path: "/sales-managers",
//               label: "Sales Managers",
//               icon: SalesManagerIcon,
//             },
//             {
//               path: "/sales-agents",
//               label: "Sales Executive",
//               icon: SalesAgentIcon,
//             },
//             { path: "/builders", label: "Builders", icon: BuilderIcon },
//             { path: "/all-agents", label: "Agents", icon: AgentIcon },
//             { path: "/accounts", label: "Accounts", icon: AccountsIcon },
//             {
//               path: "/customercare",
//               label: "Customer Care",
//               icon: LocationsIcon,
//             },
//             {
//               label: "Create Credentials",
//               icon: CreateCredentialsIcon,
//               key: "create-credentials",
//               action: "openCreateUserModal",
//             },
//             {
//               label: "Transfer Credentials",
//               icon: CreateCredentialsIcon,
//               key: "transfer-credentials",
//               action: "openTranforCredentialsModal",
//             },
//             {
//               label: "Assign Agent",
//               icon: AgentIcon,
//               key: "assign-agent",
//               action: "openAssignAgentModal",
//             },
//           ],
//         },
//         {
//           label: "Subscriptions",
//           icon: SubcriptinIcon,
//           key: "subscriptions",
//           children: [
//             { path: "/agent-payments", label: "Agent", icon: AgentIcon },
//             {
//               label: "Post Property",
//               key: "post-property",
//               icon: PostPropertyIcon,
//               children: [
//                 {
//                   path: "/owner-sell-property",
//                   label: "Owner-Sell",
//                   icon: OwnerIcon,
//                 },
//                 {
//                   path: "/owner-rent-property",
//                   label: "Owner-Rent",
//                   icon: postpropertyownerrent,
//                 },
//               ],
//             },
//             {
//               label: "Property View",
//               key: "property-view",
//               icon: PropertyViewIcon,
//               children: [
//                 {
//                   path: "/owner-buy-view",
//                   label: "Owner-Buy",
//                   icon: PostProprtSellerIcon,
//                 },
//                 {
//                   path: "/owner-rent-view",
//                   label: "Owner-Rent",
//                   icon: propertyviewrent,
//                 },
//               ],
//             },
//           ],
//         },
//         { path: "/locations", label: "Locations", icon: LocationsIcon },

//         {
//           label: "Accounts",
//           icon: AccountsIcon,
//           key: "accounts",
//           children: [
//             {
//               path: "/accounts-summary",
//               label: "Accounts Summary",
//               icon: AccountsSummaryIcon,
//             },
//             {
//               path: "/payments-list",
//               label: "Payments List",
//               icon: PaymentsListIcon,
//             },
//             {
//               path: "/active-subscriptions",
//               label: "Active Subscriptions",
//               icon: ActiveSubcriptionsIcon,
//             },
//             {
//               path: "/subscription-history",
//               label: "Subscription History",
//               icon: SubcriptionHistoryIcon,
//             },
//             {
//               path: "/Revenue-by-plan",
//               label: "Revenue By Plan",
//               icon: RevenueByPlanIcon,
//             },
//           ],
//         },
//         {
//           path: "/push-notifications",
//           label: "Push Notifications",
//           icon: pushnotification,
//         },
//         {
//           path: "/email-notifications",
//           label: "Email Notifications",
//           icon: mailnotifications,
//         },
//         {
//           path: "/whatsapp-notifications",
//           label: "WhatsApp Notifications",
//           icon: whatsappnotifications,
//         },
//         {
//           path: "/automations",
//           label: "Automations",
//           icon: aumattionnotifications,
//         },
//       ],

//       admin: [
//         { path: "/", label: "Dashboard", icon: DashboardIcon },
//         {
//           label: "Properties",
//           icon: PropertiesIcon,
//           key: "properties",
//           children: [
//             {
//               path: "/residential",
//               label: "Residential",
//               icon: ResidentialIcon,
//             },
//             { path: "/commercial", label: "Commercial", icon: CommercialIcon },
//             {
//               path: "/agricultural",
//               label: "Agricultural",
//               icon: AgriculturalIcon,
//             },
//             { path: "/land", label: "Land", icon: LandIcon },
//           ],
//         },
//         {
//           path: "/property-progress",
//           label: "Property Progress",
//           icon: PropertyProgressIcon,
//         },
//         {
//           label: "Projects",
//           icon: FeaturedProjetsIcon,
//           key: "projects",
//           children: [
//             {
//               path: "/normal",
//               label: "Normal Projects",
//               icon: normal,
//             },
//             // {
//             //   path: "/featured",
//             //   label: "Top Selling Projects",
//             //   icon: HighlightedProjectsIcon,
//             // },
//             {
//               path: "/prime",
//               label: "Prime Projects",
//               icon: prime,
//             },
//             {
//               path: "/featured",
//               label: "Top Selling Projects",
//               icon: HighlightedProjectsIcon,
//             },
//             {
//               path: "/sponsored",
//               label: "Sponsored Projects",
//               icon: sponsored,
//             },
//           ],
//         },
//         // {
//         //   path: "/featured-properties",
//         //   label: "Prime Projects",
//         //   icon: FeaturedProjetsIcon,
//         // },
//         // {
//         //   path: "/highlight-projects",
//         //   label: "Top Selling Projects",
//         //   icon: HighlightedProjectsIcon,
//         // },
//         {
//           label: "Users",
//           icon: UserIcon,
//           key: "users",
//           children: [
//             { path: "/users", label: "All Users", icon: AllUsersIcon },
//             {
//               path: "/team-management",
//               label: "Team Member Details",
//               icon: TeamManagementIcon,
//             },
//             {
//               label: "Create Credentials",
//               icon: CreateCredentialsIcon,
//               key: "create-credentials",
//               action: "openCreateUserModal",
//             },
//           ],
//         },
//         {
//           label: "Subscriptions",
//           icon: SubcriptinIcon,
//           key: "subscriptions",
//           children: [
//             { path: "/agent-payments", label: "Agent", icon: AgentIcon },
//             {
//               label: "Post Property",
//               key: "post-property",
//               icon: PostPropertyIcon,
//               children: [
//                 {
//                   path: "/owner-sell-property",
//                   label: "Owner-Sell",
//                   icon: PostPropertyIcon,
//                 },
//                 {
//                   path: "/owner-rent-property",
//                   label: "Owner-Rent",
//                   icon: postpropertyownerrent,
//                 },
//               ],
//             },
//             {
//               label: "Property View",
//               key: "property-view",
//               icon: PropertyViewIcon,
//               children: [
//                 {
//                   path: "/owner-buy-view",
//                   label: "Owner-Buy",
//                   icon: PropertyViewIcon,
//                 },
//                 {
//                   path: "/owner-rent-view",
//                   label: "Owner-Rent",
//                   icon: propertyviewrent,
//                 },
//               ],
//             },
//           ],
//         },
//         { path: "/locations", label: "Locations", icon: LocationsIcon },
//         {
//           label: "Accounts",
//           icon: AccountsIcon,
//           key: "accounts",
//           children: [
//             {
//               path: "/accounts-summary",
//               label: "Accounts Summary",
//               icon: AccountsSummaryIcon,
//             },
//             {
//               path: "/payments-list",
//               label: "Payments List",
//               icon: PaymentsListIcon,
//             },
//             {
//               path: "/active-subscriptions",
//               label: "Active Subscriptions",
//               icon: ActiveSubcriptionsIcon,
//             },
//             {
//               path: "/subscription-history",
//               label: "Subscription History",
//               icon: SubcriptionHistoryIcon,
//             },
//             {
//               path: "/Revenue-by-plan",
//               label: "Revenue By Plan",
//               icon: RevenueByPlanIcon,
//             },
//           ],
//         },
//       ],

//       sales_manager: [
//         { path: "/", label: "Dashboard", icon: DashboardIcon },
//         {
//           label: "Properties",
//           icon: PropertiesIcon,
//           key: "properties",
//           children: [
//             {
//               path: "/residential",
//               label: "Residential",
//               icon: ResidentialIcon,
//             },
//             { path: "/commercial", label: "Commercial", icon: CommercialIcon },
//             {
//               path: "/agricultural",
//               label: "Agricultural",
//               icon: AgriculturalIcon,
//             },
//             { path: "/land", label: "Land", icon: LandIcon },
//           ],
//         },
//         // {
//         //   path: "/featured-properties",
//         //   label: "Prime Projects",
//         //   icon: FeaturedProjetsIcon,
//         // },
//         // {
//         //   path: "/highlight-projects",
//         //   label: "Top Selling Projects",
//         //   icon: HighlightedProjectsIcon,
//         // },
//         {
//           label: "Projects",
//           icon: FeaturedProjetsIcon,
//           key: "projects",
//           children: [
//             {
//               path: "/normal",
//               label: "Normal Projects",
//               icon: normal,
//             },
//             {
//               path: "/featured",
//               label: "Featured Projects",
//               icon: HighlightedProjectsIcon,
//             },
//             {
//               path: "/prime",
//               label: "Prime Projects",
//               icon: prime,
//             },
//             {
//               path: "/sponsored",
//               label: "Sponsored Projects",
//               icon: sponsored,
//             },
//           ],
//         },
//       ],

//       sales_agent: [
//         { path: "/", label: "Dashboard", icon: DashboardIcon },
//         {
//           label: "Properties",
//           icon: PropertiesIcon,
//           key: "properties",
//           children: [
//             {
//               path: "/residential",
//               label: "Residential",
//               icon: ResidentialIcon,
//             },
//             { path: "/commercial", label: "Commercial", icon: CommercialIcon },
//             {
//               path: "/agricultural",
//               label: "Agricultural",
//               icon: AgriculturalIcon,
//             },
//             { path: "/land", label: "Land", icon: LandIcon },
//           ],
//         },
//         {
//           path: "/property-progress",
//           label: "Property Progress",
//           icon: PropertyProgressIcon,
//         },
//         // {
//         //   path: "/featured-properties",
//         //   label: "Prime Projects",
//         //   icon: FeaturedProjetsIcon,
//         // },
//         // {
//         //   path: "/highlight-projects",
//         //   label: "Top Selling Projects",
//         //   icon: HighlightedProjectsIcon,
//         // },
//         {
//           label: "Projects",
//           icon: FeaturedProjetsIcon,
//           key: "projects",
//           children: [
//             {
//               path: "/normal",
//               label: "Normal Projects",
//               icon: normal,
//             },
//             {
//               path: "/prime",
//               label: "Prime Projects",
//               icon: prime,
//             },
//             {
//               path: "/featured",
//               label: "Top Selling Projects",
//               icon: HighlightedProjectsIcon,
//             },
//             // {
//             //   path: "/prime",
//             //   label: "Prime Projects",
//             //   icon: HighlightedProjectsIcon,
//             // },
//             {
//               path: "/sponsored",
//               label: "Sponsored Projects",
//               icon: sponsored,
//             },
//           ],
//         },
//       ],

//       customer_care: [
//         //{ path: "/", label: "Dashboard", icon: DashboardIcon },
//         {
//           label: "Properties",
//           icon: PropertiesIcon,
//           key: "properties",
//           children: [
//             {
//               path: "/residential",
//               label: "Residential",
//               icon: ResidentialIcon,
//             },
//             { path: "/commercial", label: "Commercial", icon: CommercialIcon },
//             {
//               path: "/agricultural",
//               label: "Agricultural",
//               icon: AgriculturalIcon,
//             },
//             { path: "/land", label: "Land", icon: LandIcon },
//           ],
//         },
//         {
//           path: "/property-progress",
//           label: "Property Progress",
//           icon: PropertyProgressIcon,
//         },
//         // {
//         //   path: "/featured-properties",
//         //   label: "Featured Projects",
//         //   icon: FeaturedProjetsIcon,
//         // },
//         // {
//         //   path: "/highlight-projects",
//         //   label: "Highlight Projects",
//         //   icon: HighlightedProjectsIcon,
//         // },
//       ],

//       accounts: [
//         { path: "/", label: "Dashboard", icon: DashboardIcon },
//         {
//           label: "Properties",
//           icon: PropertiesIcon,
//           key: "properties",
//           children: [
//             {
//               path: "/residential",
//               label: "Residential",
//               icon: ResidentialIcon,
//             },
//             { path: "/commercial", label: "Commercial", icon: CommercialIcon },
//             {
//               path: "/agricultural",
//               label: "Agricultural",
//               icon: AgriculturalIcon,
//             },
//             { path: "/land", label: "Land", icon: LandIcon },
//           ],
//         },
//         {
//           label: "Subscriptions",
//           icon: SubcriptinIcon,
//           key: "subscriptions",
//           children: [
//             { path: "/agent-payments", label: "Agent", icon: AgentIcon },
//             {
//               label: "Post Property",
//               key: "post-property",
//               icon: PostPropertyIcon,
//               children: [
//                 {
//                   path: "/owner-sell-property",
//                   label: "Owner-Sell",
//                   icon: PostPropertyIcon,
//                 },
//                 {
//                   path: "/owner-rent-property",
//                   label: "Owner-Rent",
//                   icon: postpropertyownerrent,
//                 },
//               ],
//             },
//             {
//               label: "Property View",
//               key: "property-view",
//               icon: PropertyViewIcon,
//               children: [
//                 {
//                   path: "/owner-buy-view",
//                   label: "Owner-Buy",
//                   icon: PropertyViewIcon,
//                 },
//                 {
//                   path: "/owner-rent-view",
//                   label: "Owner-Rent",
//                   icon: propertyviewrent,
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           label: "Accounts",
//           icon: AccountsIcon,
//           key: "accounts",
//           children: [
//             {
//               path: "/accounts-summary",
//               label: "Accounts Summary",
//               icon: AccountsSummaryIcon,
//             },
//             {
//               path: "/payments-list",
//               label: "Payments List",
//               icon: PaymentsListIcon,
//             },
//             {
//               path: "/active-subscriptions",
//               label: "Active Subscriptions",
//               icon: ActiveSubcriptionsIcon,
//             },
//             {
//               path: "/subscription-history",
//               label: "Subscription History",
//               icon: SubcriptionHistoryIcon,
//             },
//             {
//               path: "/Revenue-by-plan",
//               label: "Revenue By Plan",
//               icon: RevenueByPlanIcon,
//             },
//           ],
//         },
//       ],
//     })[role] || [];

//   const menuItems = user ? getMenuByRole(user.roleName) : [];
//   const showText = expanded || isMobileOpen;

//   /* ── render ── */
//   return (
//     <>
//       {/* Mobile overlay */}
//       {isMobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={closeMobile}
//         />
//       )}

//       <aside
//         onMouseEnter={onHoverStart}
//         onMouseLeave={onHoverEnd}
//         className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200
//           z-50 flex flex-col transition-all duration-200
//           ${expanded ? "lg:w-64" : "lg:w-[68px]"}
//           ${isMobileOpen ? "w-64" : "lg:translate-x-0 -translate-x-full"}`}
//       >
//         <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar space-y-0.5">
//           {menuItems.map((item) => {
//             const active = hasActiveDescendant(item);

//             /* ── Parent with children ── */
//             if (item.children) {
//               return (
//                 <div key={item.key}>
//                   {/* Parent toggle button */}
//                   <button
//                     onClick={() => toggleMenu(item.key)}
//                     className={`w-full flex items-center px-2 py-2 rounded-lg
//                       ${showText ? "justify-between" : "justify-center"}
//                       ${active ? "bg-green-50 text-[#27AE60]" : "hover:bg-gray-50 text-gray-700"}`}
//                   >
//                     <div className="flex items-center gap-2">
//                       {/* Parent toggle button icon */}
//                       <NavIcon
//                         src={item.icon}
//                         active={active}
//                         isParent={true}
//                       />
//                       {showText && (
//                         <span className="text-sm font-medium truncate">
//                           {item.label}
//                         </span>
//                       )}
//                     </div>
//                     {showText && (
//                       <ChevronDown
//                         className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
//                           ${openMenus[item.key] ? "rotate-180" : ""}`}
//                       />
//                     )}
//                   </button>

//                   {/* Children */}
//                   {openMenus[item.key] && showText && (
//                     <div className="relative ml-4 mt-0.5 space-y-0.5">
//                       {/* Vertical guide line — stops at the last child's midpoint */}
//                       <div
//                         className="absolute left-[15px] top-0 w-px bg-gray-200"
//                         style={{ height: `calc(100% - 23px)` }}
//                       />

//                       {item.children.map((child) => {
//                         const childSelfActive =
//                           child.path && isActiveRoute(child.path);
//                         const childHasActive = hasActiveDescendant(child);
//                         const childActive = childSelfActive || childHasActive;

//                         return (
//                           <div
//                             key={child.key || child.path}
//                             className="relative"
//                           >
//                             <div className="absolute left-[15px] top-1/2 w-3 h-px bg-gray-200" />

//                             <button
//                               onClick={() => {
//                                 if (child.action === "openCreateUserModal") {
//                                   setShowCreateModal(true);
//                                 } else if (
//                                   child.action === "openTranforCredentialsModal"
//                                 ){
//                                   setShowTrancforCredentails(true)                              
//                                  }
//                                  else if (
//                                   child.action === "openAssignAgentModal"
//                                 ) {
//                                   setShowAssignAgentModal(true);
//                                 } else if (child.children) {
//                                   toggleMenu(child.key);
//                                 } else {
//                                   navigate(child.path);
//                                 }
//                               }}
//                               className={`relative ml-7 w-[calc(100%-28px)] flex items-center justify-between
//           px-2 py-2 rounded-lg text-sm
//           ${
//             childSelfActive
//               ? "bg-[#27AE60] text-white" // only self-active = full green
//               : childHasActive
//                 ? "bg-green-50 text-[#27AE60]" // has active child = light green (like parent)
//                 : "hover:bg-gray-50 text-gray-700" // inactive = default
//           }`}
//                             >
//                               <div className="flex items-center gap-2">
//                                 <NavIcon
//                                   src={child.icon}
//                                   active={childActive}
//                                   isParent={childHasActive && !childSelfActive} // green icon when it's a parent of active
//                                 />
//                                 <span className="truncate">{child.label}</span>
//                               </div>
//                               {child.children && (
//                                 <ChevronRight
//                                   className={`w-4 h-4 flex-shrink-0 transition-transform duration-200
//               ${openMenus[child.key] ? "rotate-90" : ""}`}
//                                 />
//                               )}
//                             </button>

//                             {/* Sub-children */}
//                             {child.children && openMenus[child.key] && (
//                               <div className="relative ml-7 mt-0.5 space-y-0.5">
//                                 <div
//                                   className="absolute left-[15px] top-0 w-px bg-gray-200"
//                                   style={{ height: "calc(100% - 23px)" }}
//                                 />
//                                 {child.children.map((sub) => {
//                                   const subActive = isActiveRoute(sub.path);
//                                   return (
//                                     <div key={sub.path} className="relative">
//                                       <div className="absolute left-[15px] top-1/2 w-3 h-px bg-gray-200" />
//                                       <button
//                                         onClick={() => navigate(sub.path)}
//                                         className={`relative ml-7 w-[calc(100%-28px)] flex items-center gap-2
//                     px-2 py-2 rounded-lg text-xs
//                     ${
//                       subActive
//                         ? "bg-[#27AE60] text-white"
//                         : "hover:bg-gray-50 text-gray-700"
//                     }`}
//                                       >
//                                         <NavIcon
//                                           src={sub.icon}
//                                           active={subActive}
//                                           size="sm"
//                                         />
//                                         <span className="truncate">
//                                           {sub.label}
//                                         </span>
//                                       </button>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             }

//             /* ── Top-level leaf item ── */
//             return (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg
//                   ${showText ? "justify-start" : "justify-center"}
//                   ${
//                     isActiveRoute(item.path)
//                       ? "bg-[#27AE60] text-white"
//                       : "hover:bg-gray-50 text-gray-700"
//                   }`}
//               >
//                 <NavIcon src={item.icon} active={isActiveRoute(item.path)} />
//                 {showText && (
//                   <span className="text-sm font-medium truncate">
//                     {item.label}
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </nav>

//         {/* User profile footer */}
//         {user && (
//           <div className="border-t border-gray-100 p-4 bg-gray-50/50">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-full bg-[#27AE60] flex items-center justify-center shadow-sm flex-shrink-0">
//                 <UserCircle className="w-6 h-6 text-white" />
//               </div>
//               {showText && (
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-900 truncate uppercase">
//                     {user.name}
//                   </p>
//                   <p className="text-[11px] text-gray-500 capitalize truncate">
//                     {user.roleName?.replace("_", " ")}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </aside>

//       {showCreateModal && (
//         <CreateUserModal onClose={() => setShowCreateModal(false)} />
//       )}

//       {showAssignAgentModal && (
//         <AssignManagerPage onClose={() => setShowAssignAgentModal(false)} />
//       )}

//       {showTrancforCredentails && (
//         <TransferCredentials onClose={() => setShowTrancforCredentails(false)} />
//       )}
//     </>
//   );
// } 



///////////////  old running code above


// src/components/common/Sidebar.jsx  (also works as Siderbar.jsx)
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";

import DashboardIcon           from "../../assets/dashboard/dashboard.svg";
import PropertiesIcon          from "../../assets/dashboard/Properties.svg";
import PropertyProgressIcon    from "../../assets/dashboard/property_progress.svg";
import FeaturedProjetsIcon     from "../../assets/dashboard/prime_projects.svg";
import HighlightedProjectsIcon from "../../assets/dashboard/top_selling.svg";
import ResidentialIcon         from "../../assets/dashboard/residential.svg";
import AgriculturalIcon        from "../../assets/dashboard/agriculture.svg";
import CommercialIcon          from "../../assets/dashboard/commercial.svg";
import LandIcon                from "../../assets/dashboard/land.svg";
import UserIcon                from "../../assets/dashboard/user.svg";
import AllUsersIcon            from "../../assets/dashboard/all_user.svg";
import TeamManagementIcon      from "../../assets/dashboard/team_management.svg";
import SalesManagerIcon        from "../../assets/dashboard/sales_manager.svg";
import SalesAgentIcon          from "../../assets/dashboard/sales_agent.svg";
import BuilderIcon             from "../../assets/dashboard/builder.svg";
import AgentIcon               from "../../assets/dashboard/agent.svg";
import AccountsIcon            from "../../assets/dashboard/accounts.svg";
import CreateCredentialsIcon   from "../../assets/dashboard/create_credentials.svg";
import SubcriptinIcon          from "../../assets/dashboard/subscription.svg";
import PostPropertyIcon        from "../../assets/dashboard/post_property.svg";
import PropertyViewIcon        from "../../assets/dashboard/property_view.svg";
import OwnerIcon               from "../../assets/dashboard/owner.svg";
import PostProprtSellerIcon    from "../../assets/dashboard/users_Buyers.svg";
import LocationsIcon           from "../../assets/dashboard/location.svg";
import AccountsSummaryIcon     from "../../assets/dashboard/account.svg";
import PaymentsListIcon        from "../../assets/dashboard/payment_list.svg";
import ActiveSubcriptionsIcon  from "../../assets/dashboard/active_subscription.svg";
import SubcriptionHistoryIcon  from "../../assets/dashboard/subscription_history.svg";
import RevenueByPlanIcon       from "../../assets/dashboard/revenue_by_plan.svg";
import mailnotifications       from "../../assets/mailnotifications.svg";
import normal                  from "../../assets/normal.svg";
import prime                   from "../../assets/prime.svg";
import postpropertyownerrent   from "../../assets/postpropertyownerrent.svg";
import propertyviewrent        from "../../assets/propertyviewrent.svg";
import pushnotification        from "../../assets/pushnotification.svg";
import sponsored               from "../../assets/sponsored.svg";
import whatsappnotifications   from "../../assets/whatsappnotifications.svg";
import aumattionnotifications  from "../../assets/automationsnotifications.svg";

import { UserCircle, ChevronDown, ChevronRight } from "lucide-react";
import CreateUserModal     from "./CreateUserModal";
import AssignManagerPage   from "./AssignManager";
import TransferCredentials from "./TransferCredentials";

/* ─────────────────────────────────────────────────────────────────────
   SIZE TOKENS  — change these one place to rescale entire sidebar
───────────────────────────────────────────────────────────────────── */
const S = {
  /* sidebar widths */
  expandedW:  "240px",   // was 256px
  collapsedW: "56px",    // was 68px

  /* icon sizes */
  iconBox:    "w-6 h-6", // wrapper  (was w-7 h-7)
  iconMd:     "w-[16px] h-[16px]", // normal icon (was 17px)
  iconSm:     "w-[12px] h-[12px]", // child icon  (was 14px)

  /* top-level leaf / parent row */
  rowPy:      "py-[4px]",   // was py-2
  rowPx:      "px-1.5",     // was px-2
  rowRadius:  "rounded-md", // was rounded-lg
  rowGap:     "gap-1.5",    // was gap-2 / gap-2.5
  rowText:    "text-[11.5px]", // was text-[13px]
  rowFont:    "font-semibold",

  /* child row (2nd level) */
  childPy:    "py-[4px]",   // was py-[7px]
  childPx:    "px-2",       // was px-2.5
  childRadius:"rounded-md",
  childText:  "text-[11px]",// was text-[12px]
  childFont:  "font-medium",
  childML:    "ml-6",       // was ml-7
  childW:     "w-[calc(100%-24px)]", // was calc(100%-28px)

  /* sub-child row (3rd level) */
  subPy:      "py-[4px]",
  subPx:      "px-2",
  subRadius:  "rounded-md",
  subText:    "text-[10.5px]",
  subFont:    "font-medium",
  subML:      "ml-5",       // was ml-7
  subW:       "w-[calc(100%-20px)]",

  /* guide tree lines */
  guideML:    "ml-3",       // was ml-3.5
  guideLeft:  "left-[12px]",// was left-[14px]
  horizLeft:  "left-[12px]",
  horizW:     "w-2.5",      // was w-3

  /* sub-children container */
  subGuideML:  "ml-5",
  subGuideLeft:"left-[12px]",

  /* chevron */
  chevronSize: 12,   // was 14 / 13

  /* footer */
  footerP:    "p-2.5", // was p-3
  avatarSize: "w-8 h-8", // was w-9 h-9
  avatarIcon: "w-4 h-4", // was w-5 h-5

  /* nav container */
  navPy:  "py-2",   // was py-3
  navPx:  "px-1.5", // was px-2
  space:  "space-y-[1px]", // was space-y-0.5
};

/* ─── Animated collapse ─────────────────────────────────────────────── */
const CollapsePanel = ({ open, children }) => {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setHeight(ref.current.scrollHeight);
      const t = setTimeout(() => setHeight("auto"), 230);
      return () => clearTimeout(t);
    } else {
      setHeight(ref.current.scrollHeight);
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight(0)));
    }
  }, [open]);
  return (
    <div
      ref={ref}
      style={{ height: open ? height : 0 }}
      className="overflow-hidden transition-[height] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    >
      {children}
    </div>
  );
};

/* ─── Floating tooltip (icon-only mode) ─────────────────────────────── */
const FloatTooltip = ({ label, show }) => (
  <div
    className={`
      pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2
      z-[9999] px-2 py-1 rounded-md text-[10.5px] font-semibold
      whitespace-nowrap select-none bg-white
      transition-all duration-150
      ${show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}
    `}
    style={{
      color: "#27AE60",
      border: "1px solid #bbf7d0",
      boxShadow: "0 3px 12px rgba(39,174,96,0.13), 0 1px 4px rgba(0,0,0,0.07)",
    }}
  >
    {label}
    <span
      className="absolute right-full top-1/2 -translate-y-1/2 border-[3px] border-transparent"
      style={{ borderRightColor: "white" }}
    />
  </div>
);

/* ─── Nav icon wrapper ───────────────────────────────────────────────── */
const NavIcon = ({ src, active, isParent = false, size = "md" }) => {
  const dim = size === "sm" ? S.iconSm : S.iconMd;
  const filterStyle = active
    ? isParent
      ? { filter: "invert(47%) sepia(72%) saturate(500%) hue-rotate(104deg) brightness(92%) contrast(90%)" }
      : { filter: "brightness(0) invert(1)" }
    : { filter: "brightness(0) " };
  return (
    <span className={`flex items-center justify-center ${S.iconBox} flex-shrink-0`}>
      <img src={src} alt="" className={`${dim} object-contain transition-all duration-200`} style={filterStyle} />
    </span>
  );
};

/* ─── Sub-children (3rd level) ──────────────────────────────────────── */
const SubChildren = ({ items, navigate, isActiveRoute }) => (
  <div className={`relative ${S.subGuideML} mt-0.5 pb-0.5 space-y-[1px]`}>
    <div
      className={`absolute ${S.subGuideLeft} top-0 w-px bg-green-200`}
      style={{ height: "calc(100% - 18px)" }}
    />
    {items.map((sub) => {
      const active = isActiveRoute(sub.path);
      return (
        <div key={sub.path} className="relative">
          <div className={`absolute ${S.subGuideLeft} top-[15px] w-2.5 h-px bg-green-200`} />
          <button
            onClick={() => navigate(sub.path)}
            className={`relative ${S.subML} ${S.subW} flex items-center gap-1.5 ${S.subPx} ${S.subPy} ${S.subRadius} ${S.subText} ${S.subFont} transition-all duration-150`}
            style={
              active
                ? { background: "#27AE60", color: "white", boxShadow: "0 1px 6px rgba(39,174,96,0.25)" }
                : { color: "#64748b" }
            }
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#27AE60"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#64748b"; } }}
          >
            <NavIcon src={sub.icon} active={active} size="sm" />
            <span className="truncate">{sub.label}</span>
          </button>
        </div>
      );
    })}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN SIDEBAR
══════════════════════════════════════════════════════════════════════ */
export default function Sidebar({ expanded, isMobileOpen, closeMobile, onHoverStart, onHoverEnd }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCreateModal,         setShowCreateModal]         = useState(false);
  const [showAssignAgentModal,    setShowAssignAgentModal]    = useState(false);
  const [showTransferCredentials, setShowTransferCredentials] = useState(false);
  const [user,       setUser]       = useState(null);
  const [openMenus,  setOpenMenus]  = useState({});
  const [hoveredKey, setHoveredKey] = useState(null);

  const isActiveRoute       = (path) => location.pathname === path;
  const hasActiveDescendant = (item) => {
    if (!item?.children) return false;
    return item.children.some((c) => (c.path && isActiveRoute(c.path)) || hasActiveDescendant(c));
  };
  const toggleMenu = (key) => setOpenMenus((p) => ({ ...p, [key]: !p[key] }));

  useEffect(() => { fetchLoggedInUser().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    if (!user) return;
    const autoOpen = {};
    const walk = (items) => items.forEach((item) => {
      if (hasActiveDescendant(item) && item.key) autoOpen[item.key] = true;
      if (item.children) walk(item.children);
    });
    walk(getMenuByRole(user.roleName));
    setOpenMenus((p) => ({ ...p, ...autoOpen }));
  }, [location.pathname, user]);

  const handleChildClick = (child) => {
    if      (child.action === "openCreateUserModal")         setShowCreateModal(true);
    else if (child.action === "openTranforCredentialsModal") setShowTransferCredentials(true);
    else if (child.action === "openAssignAgentModal")        setShowAssignAgentModal(true);
    else if (child.children)                                 toggleMenu(child.key);
    else                                                     navigate(child.path);
  };

  /* ── Menu definitions ─────────────────────────────────────────────── */
  const getMenuByRole = (role) =>
    ({
      super_admin: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Projects",
          icon: FeaturedProjetsIcon,
          key: "projects",
          children: [
            { path: "/normal", label: "Normal Projects", icon: normal },
            { path: "/prime", label: "Prime Projects", icon: prime },
            {
              path: "/featured",
              label: "Top Selling Projects",
              icon: HighlightedProjectsIcon,
            },
            {
              path: "/sponsored",
              label: "Sponsored Projects",
              icon: sponsored,
            },
          ],
        },
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
          label: "Users",
          icon: UserIcon,
          key: "users",
          children: [
            { path: "/users", label: "All Users", icon: AllUsersIcon },
            {
              path: "/dashboard/team-management",
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
                  icon: postpropertyownerrent,
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
                  icon: propertyviewrent,
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
              path: "/payments-list",
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
          icon: pushnotification,
        },
        {
          path: "/email-notifications",
          label: "Email Notifications",
          icon: mailnotifications,
        },
        {
          path: "/whatsapp-notifications",
          label: "WhatsApp Notifications",
          icon: whatsappnotifications,
        },
        {
          path: "/automations",
          label: "Automations",
          icon: aumattionnotifications,
        },
      ],
      admin: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Projects",
          icon: FeaturedProjetsIcon,
          key: "projects",
          children: [
            { path: "/normal", label: "Normal Projects", icon: normal },
            { path: "/prime", label: "Prime Projects", icon: prime },
            {
              path: "/featured",
              label: "Top Selling Projects",
              icon: HighlightedProjectsIcon,
            },
            {
              path: "/sponsored",
              label: "Sponsored Projects",
              icon: sponsored,
            },
          ],
        },
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
                  icon: postpropertyownerrent,
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
                  icon: propertyviewrent,
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
              path: "/payments-list",
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
          label: "Projects",
          icon: FeaturedProjetsIcon,
          key: "projects",
          children: [
            { path: "/normal", label: "Normal Projects", icon: normal },
            {
              path: "/featured",
              label: "Featured Projects",
              icon: HighlightedProjectsIcon,
            },
            { path: "/prime", label: "Prime Projects", icon: prime },
            {
              path: "/sponsored",
              label: "Sponsored Projects",
              icon: sponsored,
            },
          ],
        },
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
      ],
      sales_agent: [
        { path: "/", label: "Dashboard", icon: DashboardIcon },
        {
          label: "Projects",
          icon: FeaturedProjetsIcon,
          key: "projects",
          children: [
            { path: "/normal", label: "Normal Projects", icon: normal },
            { path: "/prime", label: "Prime Projects", icon: prime },
            {
              path: "/featured",
              label: "Top Selling Projects",
              icon: HighlightedProjectsIcon,
            },
            {
              path: "/sponsored",
              label: "Sponsored Projects",
              icon: sponsored,
            },
          ],
        },
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
      ],
      customer_care: [
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
                  icon: postpropertyownerrent,
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
                  icon: propertyviewrent,
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
              path: "/payments-list",
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
  const showText  = expanded || isMobileOpen;

  return (
    <>
      <style>{`
        .sb-scroll::-webkit-scrollbar       { width: 2px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: #bbf7d0; border-radius: 10px; }
        .sb-scroll::-webkit-scrollbar-thumb:hover { background: #27AE60; }
      `}</style>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
          onClick={closeMobile}
        />
      )}

      {/* ═══════════════════════════════════════
          ASIDE — compact sizing
          collapsed:  56px wide, icon only
          expanded:  240px wide, icon + text
      ═══════════════════════════════════════ */}
      <aside
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        className={`
          fixed left-0 z-50 flex flex-col bg-white
          transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobileOpen ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"}
        `}
        style={{
          top:         "64px",
          height:      "calc(100vh - 64px)",
          width:       expanded || isMobileOpen ? S.expandedW : S.collapsedW,
          borderRight: "1px solid #e8f5e9",
          boxShadow:   "2px 0 10px rgba(39,174,96,0.06)",
        }}
      >
        {/* Green top accent line */}
        <div
          className="flex-shrink-0 h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, #27AE60, #4ade80, #27AE60)" }}
        />

        {/* ── Navigation ── */}
        <nav className={`sb-scroll flex-1 ${S.navPy} ${S.navPx} overflow-y-auto overflow-x-hidden ${S.space}`}>

          {menuItems.map((item) => {
            const parentActive = hasActiveDescendant(item);

            /* ── Parent with children ── */
            if (item.children) {
              return (
                <div key={item.key}>
                  {/* Parent toggle button */}
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(item.key)}
                      //onMouseEnter={() => !showText && setHoveredKey(item.key)}
                      //onMouseLeave={() => setHoveredKey(null)}
                      className={`w-full flex items-center ${S.rowPx} ${S.rowPy} ${S.rowRadius} transition-all duration-150 relative ${showText ? "justify-between" : "justify-center"}`}
                      style={
                        parentActive
                          ? { background: "#f0fdf4", color: "#27AE60" }
                          : { color: "#64748b" }
                      }
                      onMouseEnter={(e) => { 
                        if (!showText && setHoveredKey(item.key))
                          if (!parentActive)
                            e.currentTarget.style.background = "#f8fffe"; }}
                      onMouseLeave={(e) => { 
                        setHoveredKey(null);
                        if (!parentActive) e.currentTarget.style.background = "";       }}
                    >
                      {/* Left accent */}
                      {parentActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full"
                          style={{ background: "#27AE60" }}
                        />
                      )}

                      <div className={`flex items-center ${S.rowGap} min-w-0`}>
                        <NavIcon src={item.icon} active={parentActive} isParent />
                        {showText && (
                          <span className={`${S.rowText} ${S.rowFont} truncate pb-0.5`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {showText && (
                        <ChevronDown
                          className="flex-shrink-0 transition-transform duration-200"
                          style={{
                            width: S.chevronSize, height: S.chevronSize,
                            color: parentActive ? "#27AE60" : "#94a3b8",
                            transform: openMenus[item.key] ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      )}
                    </button>

                    {!showText && <FloatTooltip label={item.label} show={hoveredKey === item.key} />}
                  </div>

                  {/* Animated children list */}
                  {showText && (
                    <CollapsePanel open={!!openMenus[item.key]}>
                      <div className={`relative ${S.guideML} mt-0.5 pb-0.5 space-y-[1px]`}>
                        {/* Vertical guide line */}
                        <div
                          className={`absolute ${S.guideLeft} top-0 w-px bg-green-200`}
                          style={{ height: "calc(100% - 18px)" }}
                        />

                        {item.children.map((child) => {
                          const childSelf      = child.path && isActiveRoute(child.path);
                          const childHasActive = hasActiveDescendant(child);
                          const childActive    = childSelf || childHasActive;

                          return (
                            <div key={child.key || child.path} className="relative">
                              {/* Horizontal connector */}
                              <div className={`absolute ${S.horizLeft} top-[15px] ${S.horizW} h-px bg-green-200`} />

                              <button
                                onClick={() => handleChildClick(child)}
                                className={`relative ${S.childML} ${S.childW} flex items-center justify-between ${S.childPx} ${S.childPy} ${S.childRadius} ${S.childText} ${S.childFont} transition-all duration-150`}
                                style={
                                  childSelf
                                    ? { background: "#27AE60", color: "white", boxShadow: "0 1px 8px rgba(39,174,96,0.25)" }
                                    : childHasActive
                                    ? { background: "#f0fdf4", color: "#27AE60", border: "1px solid #bbf7d0" }
                                    : { color: "#64748b" }
                                }
                                onMouseEnter={e => {
                                  if (!childActive) { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#27AE60"; }
                                }}
                                onMouseLeave={e => {
                                  if (!childActive) { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#64748b"; }
                                }}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <NavIcon
                                    src={child.icon}
                                    active={childActive}
                                    isParent={childHasActive && !childSelf}
                                    size="sm"
                                  />
                                  <span className="truncate">{child.label}</span>
                                </div>

                                {child.children ? (
                                  <ChevronRight
                                    style={{
                                      width: S.chevronSize, height: S.chevronSize,
                                      flexShrink: 0,
                                      color: childHasActive ? "#27AE60" : "#94a3b8",
                                      transform: openMenus[child.key] ? "rotate(90deg)" : "rotate(0deg)",
                                      transition: "transform 0.2s",
                                    }}
                                  />
                                ) : null}
                              </button>

                              {/* 3rd level sub-children */}
                              {child.children && (
                                <CollapsePanel open={!!openMenus[child.key]}>
                                  <SubChildren
                                    items={child.children}
                                    navigate={navigate}
                                    isActiveRoute={isActiveRoute}
                                  />
                                </CollapsePanel>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CollapsePanel>
                  )}
                </div>
              );
            }

            /* ── Top-level leaf ── */
            const leafActive = isActiveRoute(item.path);
            return (
              <div key={item.path} className="relative">
                <button
                  onClick={() => navigate(item.path)}
                  // onMouseEnter={() => !showText && setHoveredKey(item.path)}
                  // onMouseLeave={() => setHoveredKey(null)}
                  className={`w-full flex items-center ${S.rowGap} ${S.rowPx} ${S.rowPy} ${S.rowRadius} transition-all duration-150 ${showText ? "justify-start" : "justify-center"}`}
                  style={
                    leafActive
                      ? {
                          background: "#27AE60",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(39,174,96,0.28)",
                        }
                      : { color: "#64748b" }
                  }
                  onMouseEnter={(e) => {
                    if (!showText && setHoveredKey(item.path));
                    if (!leafActive) {
                      e.currentTarget.style.background = "#f0fdf4";
                      e.currentTarget.style.color = "#27AE60";
                    }
                  }}
                  onMouseLeave={(e) => {
                    setHoveredKey(null);
                    if (!leafActive) {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  <NavIcon src={item.icon} active={leafActive} />
                  {showText && (
                    // <span className={`${S.rowText} ${S.rowFont} truncate leading-none`}>
                    <span
                      className={`${S.rowText} ${S.rowFont} truncate leading-[1.3] p-[2px]`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>

                {!showText && (
                  <FloatTooltip
                    label={item.label}
                    show={hoveredKey === item.path}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* ── User footer ── */}
        {user && (
          <div
            className={`flex-shrink-0 ${S.footerP}`}
            style={{ borderTop: "1px solid #e8f5e9", background: "#fafffe" }}
          >
            <div className={`flex items-center gap-2 ${!showText && "justify-center"}`}>
              {/* Avatar */}
              <div
                className={`relative ${S.avatarSize} rounded-full flex items-center justify-center flex-shrink-0`}
                style={{
                  background: "linear-gradient(135deg, #27AE60, #1a8a49)",
                  boxShadow: "0 0 0 2px #bbf7d0",
                }}
              >
                <UserCircle className={`${S.avatarIcon} text-white`} />
                {/* Online dot */}
                <span
                  className="absolute -bottom-[2px] -right-[2px] w-[8px] h-[8px] rounded-full"
                  style={{ background: "#22c55e", border: "2px solid white" }}
                />
              </div>

              {showText && (
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate uppercase tracking-wide leading-none" style={{ color: "#1e293b" }}>
                    {user.name}
                  </p>
                  <p className="text-[9.5px] truncate mt-0.5 capitalize leading-none" style={{ color: "#27AE60" }}>
                    {user.roleName?.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ── Modals ── */}
      {showCreateModal         && <CreateUserModal     onClose={() => setShowCreateModal(false)}         />}
      {showAssignAgentModal    && <AssignManagerPage   onClose={() => setShowAssignAgentModal(false)}    />}
      {showTransferCredentials && <TransferCredentials onClose={() => setShowTransferCredentials(false)} />}
    </>
  );
}