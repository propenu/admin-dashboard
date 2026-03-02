// src/components/common/Sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";

import {
  Home,
  FolderKanban,
  Star,
  Building2,
  Users,
  UserCircle,
  Store,
  Leaf,
  MapPin,
  Shield,
  SubscriptIcon,
  Locate,
  ChevronDown,
  ChevronRight,
  ActivitySquare,
} from "lucide-react";
import CreateUserModal from "./CreateUserModal";

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
  const [user, setUser] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  /* ---------------- HELPERS ---------------- */

  const isActiveRoute = (path) => location.pathname === path;

  const hasActiveDescendant = (item) => {
    if (!item?.children) return false;
    return item.children.some(
      (child) =>
        (child.path && isActiveRoute(child.path)) ||
        hasActiveDescendant(child),
    );
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ---------------- LOAD USER ---------------- */

  useEffect(() => {
    fetchLoggedInUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  /* ---------------- AUTO OPEN ACTIVE PATH ---------------- */

  useEffect(() => {
    if (!user) return;

    const autoOpen = {};

    const walk = (items) => {
      items.forEach((item) => {
        if (hasActiveDescendant(item) && item.key) {
          autoOpen[item.key] = true;
        }
        if (item.children) walk(item.children);
      });
    };

    walk(getMenuByRole(user.roleName));
    setOpenMenus((prev) => ({ ...prev, ...autoOpen }));
  }, [location.pathname, user]);

  /* ---------------- MENU CONFIG ---------------- */

  const getMenuByRole = (role) =>
    ({
      super_admin: [
        { path: "/", label: "Dashboard", icon: Home },
        {
          label: "Properties",
          icon: FolderKanban,
          key: "properties",
          children: [
            { path: "/residential", label: "Residential", icon: Home },
            { path: "/commercial", label: "Commercial", icon: Store },
            { path: "/agricultural", label: "Agricultural", icon: Leaf },
            { path: "/land", label: "Land", icon: MapPin },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: ActivitySquare,
        },
        {
          path: "/featured-properties",
          label: "Featured Projects",
          icon: Star,
        },
        {
          path: "/highlight-projects",
          label: "Highlight Projects",
          icon: Building2,
        },
        {
          label: "Users",
          icon: Users,
          key: "users",
          children: [
            { path: "/users", label: "All Users", icon: Users },
            // { path: "/users/builder", label: "Builders", icon: Building2 },
            {
              path: "/team-management",
              label: "Team Management",
              icon: UserCircle,
            },
            {
              path: "/sales-managers",
              label: "Sales Managers",
              icon: UserCircle,
            },
            {
              path: "/sales-agents",
              label: "Sales Agents",
              icon: UserCircle,
            },
            {
              path: "/builders",
              label: "Builders",
              icon: UserCircle,
            },
            {
              path: "/all-agents",
              label: "Agents",
              icon: UserCircle,
            },
            {
              path: "/accounts",
              label: "Accounts",
              icon: UserCircle,
            },
            {
              label: "Create Credentials",
              icon: UserCircle,
              key: "create-credentials",
              action: "openCreateUserModal",
            },
            {
              path: "/users/roles",
              label: "Roles & Permissions",
              icon: Shield,
            },
          ],
        },
        {
          label: "Subscriptions",
          icon: SubscriptIcon,
          key: "subscriptions",
          children: [
            { path: "/agent-payments", label: "Agent", icon: Users },
            {
              label: "Post Property",
              key: "post-property",
              icon: Shield,
              children: [
                {
                  path: "/owner-sell-property",
                  label: "Owner-Sell",
                  icon: UserCircle,
                },
                {
                  path: "/owner-rent-property",
                  label: "Owner-Rent",
                  icon: Shield,
                },
              ],
            },
            {
              label: "Property View",
              key: "property-view",
              icon: Shield,
              children: [
                {
                  path: "/owner-buy-view",
                  label: "Owner-Buy",
                  icon: UserCircle,
                },
                { path: "/owner-rent-view", label: "Owner-Rent", icon: Shield },
              ],
            },
            {
              path: "/create-payments",
              label: "Create-Payments",
              icon: Shield,
            },
          ],
        },
        { path: "/locations", label: "Locations", icon: Locate },
        {
          label: "Accounts",
          icon: Users,
          key: "accounts",
          children: [
            {
              path: "/accounts-summary",
              label: "Accounts Summary",
              icon: Users,
            },
            { path: "/paymets-list", label: "Payments List", icon: Users },
            {
              path: "/active-subscriptions",
              label: "Active Subscriptions",
              icon: Users,
            },
            {
              path: "/subscription-history",
              label: "Subscription History",
              icon: Users,
            },
            {
              path: "/Revenue-by-plan",
              label: "Revenue By Plan",
              icon: Users,
            },
          ],
        },
      ],
      builder: [
        { path: "/", label: "Dashboard", icon: Home },
        {
          label: "Properties",
          icon: FolderKanban,
          key: "properties",
          children: [
            { path: "/residential", label: "Residential", icon: Home },
            { path: "/commercial", label: "Commercial", icon: Store },
            { path: "/agricultural", label: "Agricultural", icon: Leaf },
            { path: "/land", label: "Land", icon: MapPin },
          ],
        },
        // {
        //   path: "/property-progress",
        //   label: "Property Progress",
        //   icon: ActivitySquare,
        // },
        {
          path: "/featured-properties",
          label: "Featured Projects",
          icon: Star,
        },
        {
          path: "/highlight-projects",
          label: "Highlight Projects",
          icon: Building2,
        },
        // {
        //   label: "Users",
        //   icon: Users,
        //   key: "users",
        //   children: [
        //     { path: "/users", label: "All Users", icon: Users },
        //     // { path: "/users/builder", label: "Builders", icon: Building2 },
        //     {
        //       path: "/team-management",
        //       label: "Team Management",
        //       icon: UserCircle,
        //     },
        //     {
        //       path: "/sales-managers",
        //       label: "Sales Managers",
        //       icon: UserCircle,
        //     },
        //     {
        //       path: "/sales-agents",
        //       label: "Sales Agents",
        //       icon: UserCircle,
        //     },
        //     {
        //       path: "/builders",
        //       label: "Builders",
        //       icon: UserCircle,
        //     },
        //     {
        //       path: "/all-agents",
        //       label: "Agents",
        //       icon: UserCircle,
        //     },
        //     {
        //       path: "/accounts",
        //       label: "Accounts",
        //       icon: UserCircle,
        //     },
        //     {
        //       label: "Create Credentials",
        //       icon: UserCircle,
        //       key: "create-credentials",
        //       action: "openCreateUserModal",
        //     },
        //     {
        //       path: "/users/roles",
        //       label: "Roles & Permissions",
        //       icon: Shield,
        //     },
        //   ],
        // },
        // {
        //   label: "Subscriptions",
        //   icon: SubscriptIcon,
        //   key: "subscriptions",
        //   children: [
        //     { path: "/agent-payments", label: "Agent", icon: Users },
        //     {
        //       label: "Post Property",
        //       key: "post-property",
        //       icon: Shield,
        //       children: [
        //         {
        //           path: "/owner-sell-property",
        //           label: "Owner-Sell",
        //           icon: UserCircle,
        //         },
        //         {
        //           path: "/owner-rent-property",
        //           label: "Owner-Rent",
        //           icon: Shield,
        //         },
        //       ],
        //     },
        //     {
        //       label: "Property View",
        //       key: "property-view",
        //       icon: Shield,
        //       children: [
        //         {
        //           path: "/owner-buy-view",
        //           label: "Owner-Buy",
        //           icon: UserCircle,
        //         },
        //         { path: "/owner-rent-view", label: "Owner-Rent", icon: Shield },
        //       ],
        //     },
        //     {
        //       path: "/create-payments",
        //       label: "Create-Payments",
        //       icon: Shield,
        //     },
        //   ],
        // },
        // { path: "/locations", label: "Locations", icon: Locate },
        // {
        //   label: "Accounts",
        //   icon: Users,
        //   key: "accounts",
        //   children: [
        //     {
        //       path: "/accounts-summary",
        //       label: "Accounts Summary",
        //       icon: Users,
        //     },
        //     { path: "/paymets-list", label: "Payments List", icon: Users },
        //     {
        //       path: "/active-subscriptions",
        //       label: "Active Subscriptions",
        //       icon: Users,
        //     },
        //     {
        //       path: "/subscription-history",
        //       label: "Subscription History",
        //       icon: Users,
        //     },
        //     {
        //       path: "/Revenue-by-plan",
        //       label: "Revenue By Plan",
        //       icon: Users,
        //     },
        //   ],
        // },
      ],
      admin: [
        { path: "/", label: "Dashboard", icon: Home },
        {
          label: "Properties",
          icon: FolderKanban,
          key: "properties",
          children: [
            { path: "/residential", label: "Residential", icon: Home },
            { path: "/commercial", label: "Commercial", icon: Store },
            { path: "/agricultural", label: "Agricultural", icon: Leaf },
            { path: "/land", label: "Land", icon: MapPin },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: ActivitySquare,
        },
        {
          path: "/featured-properties",
          label: "Featured Projects",
          icon: Star,
        },
        {
          path: "/highlight-projects",
          label: "Highlight Projects",
          icon: Building2,
        },
        {
          label: "Users",
          icon: Users,
          key: "users",
          children: [
            { path: "/users", label: "All Users", icon: Users },
            // { path: "/users/builder", label: "Builders", icon: Building2 },
            {
              path: "/team-management",
              label: "Team Member Details",
              icon: UserCircle,
            },
            {
              label: "Create Credentials",
              icon: UserCircle,
              key: "create-credentials",
              action: "openCreateUserModal",
            },
            {
              path: "/users/roles",
              label: "Roles & Permissions",
              icon: Shield,
            },
          ],
        },
        {
          label: "Subscriptions",
          icon: SubscriptIcon,
          key: "subscriptions",
          children: [
            { path: "/agent-payments", label: "Agent", icon: Users },
            {
              label: "Post Property",
              key: "post-property",
              icon: Shield,
              children: [
                {
                  path: "/owner-sell-property",
                  label: "Owner-Sell",
                  icon: UserCircle,
                },
                {
                  path: "/owner-rent-property",
                  label: "Owner-Rent",
                  icon: Shield,
                },
              ],
            },
            {
              label: "Property View",
              key: "property-view",
              icon: Shield,
              children: [
                {
                  path: "/owner-buy-view",
                  label: "Owner-Buy",
                  icon: UserCircle,
                },
                { path: "/owner-rent-view", label: "Owner-Rent", icon: Shield },
              ],
            },
            {
              path: "/create-payments",
              label: "Create-Payments",
              icon: Shield,
            },
          ],
        },
        { path: "/locations", label: "Locations", icon: Locate },
        {
          label: "Accounts",
          icon: Users,
          key: "accounts",
          children: [
            {
              path: "/accounts-summary",
              label: "Accounts Summary",
              icon: Users,
            },
            { path: "/paymets-list", label: "Payments List", icon: Users },
            {
              path: "/active-subscriptions",
              label: "Active Subscriptions",
              icon: Users,
            },
            {
              path: "/subscription-history",
              label: "Subscription History",
              icon: Users,
            },
            {
              path: "/Revenue-by-plan",
              label: "Revenue By Plan",
              icon: Users,
            },
          ],
        },
      ],
      sales_manager: [
        { path: "/", label: "Dashboard", icon: Home },
        {
          label: "Properties",
          icon: FolderKanban,
          key: "properties",
          children: [
            { path: "/residential", label: "Residential", icon: Home },
            { path: "/commercial", label: "Commercial", icon: Store },
            { path: "/agricultural", label: "Agricultural", icon: Leaf },
            { path: "/land", label: "Land", icon: MapPin },
          ],
        },
        // {
        //   path: "/property-progress",
        //   label: "Property Progress",
        //   icon: ActivitySquare,
        // },
        {
          path: "/featured-properties",
          label: "Featured Projects",
          icon: Star,
        },
        {
          path: "/highlight-projects",
          label: "Highlight Projects",
          icon: Building2,
        },
        // {
        //   label: "Users",
        //   icon: Users,
        //   key: "users",
        //   children: [
        //     { path: "/users", label: "All Users", icon: Users },
        //     // { path: "/users/builder", label: "Builders", icon: Building2 },
        //     {
        //       path: "/team-management",
        //       label: "Team Member Details",
        //       icon: UserCircle,
        //     },
        //     {
        //       label: "Create Credentials",
        //       icon: UserCircle,
        //       key: "create-credentials",
        //       action: "openCreateUserModal",
        //     },
        //     {
        //       path: "/users/roles",
        //       label: "Roles & Permissions",
        //       icon: Shield,
        //     },
        //   ],
        // },
        // {
        //   label: "Subscriptions",
        //   icon: SubscriptIcon,
        //   key: "subscriptions",
        //   children: [
        //     { path: "/agent-payments", label: "Agent", icon: Users },
        //     {
        //       label: "Post Property",
        //       key: "post-property",
        //       icon: Shield,
        //       children: [
        //         {
        //           path: "/owner-sell-property",
        //           label: "Owner-Sell",
        //           icon: UserCircle,
        //         },
        //         {
        //           path: "/owner-rent-property",
        //           label: "Owner-Rent",
        //           icon: Shield,
        //         },
        //       ],
        //     },
        //     {
        //       label: "Property View",
        //       key: "property-view",
        //       icon: Shield,
        //       children: [
        //         {
        //           path: "/owner-buy-view",
        //           label: "Owner-Buy",
        //           icon: UserCircle,
        //         },
        //         { path: "/owner-rent-view", label: "Owner-Rent", icon: Shield },
        //       ],
        //     },
        //     {
        //       path: "/create-payments",
        //       label: "Create-Payments",
        //       icon: Shield,
        //     },
        //   ],
        // },
        //{ path: "/locations", label: "Locations", icon: Locate },
        // {
        //   label: "Accounts",
        //   icon: Users,
        //   key: "accounts",
        //   children: [
        //     {
        //       path: "/accounts-summary",
        //       label: "Accounts Summary",
        //       icon: Users,
        //     },
        //     { path: "/paymets-list", label: "Payments List", icon: Users },
        //     {
        //       path: "/active-subscriptions",
        //       label: "Active Subscriptions",
        //       icon: Users,
        //     },
        //     {
        //       path: "/subscription-history",
        //       label: "Subscription History",
        //       icon: Users,
        //     },
        //     {
        //       path: "/Revenue-by-plan",
        //       label: "Revenue By Plan",
        //       icon: Users,
        //     },
        //   ],
        // },
      ],
      sales_agent: [
        { path: "/", label: "Dashboard", icon: Home },
        {
          label: "Properties",
          icon: FolderKanban,
          key: "properties",
          children: [
            { path: "/residential", label: "Residential", icon: Home },
            { path: "/commercial", label: "Commercial", icon: Store },
            { path: "/agricultural", label: "Agricultural", icon: Leaf },
            { path: "/land", label: "Land", icon: MapPin },
          ],
        },
        {
          path: "/property-progress",
          label: "Property Progress",
          icon: ActivitySquare,
        },
        {
          path: "/featured-properties",
          label: "Featured Projects",
          icon: Star,
        },
        {
          path: "/highlight-projects",
          label: "Highlight Projects",
          icon: Building2,
        },
        // {
        //   label: "Users",
        //   icon: Users,
        //   key: "users",
        //   children: [
        //     { path: "/users", label: "All Users", icon: Users },
        //     // { path: "/users/builder", label: "Builders", icon: Building2 },
        //     {
        //       path: "/team-management",
        //       label: "Team Member Details",
        //       icon: UserCircle,
        //     },
        //     {
        //       label: "Create Credentials",
        //       icon: UserCircle,
        //       key: "create-credentials",
        //       action: "openCreateUserModal",
        //     },
        //     {
        //       path: "/users/roles",
        //       label: "Roles & Permissions",
        //       icon: Shield,
        //     },
        //   ],
        // },
        // {
        //   label: "Subscriptions",
        //   icon: SubscriptIcon,
        //   key: "subscriptions",
        //   children: [
        //     { path: "/agent-payments", label: "Agent", icon: Users },
        //     {
        //       label: "Post Property",
        //       key: "post-property",
        //       icon: Shield,
        //       children: [
        //         {
        //           path: "/owner-sell-property",
        //           label: "Owner-Sell",
        //           icon: UserCircle,
        //         },
        //         {
        //           path: "/owner-rent-property",
        //           label: "Owner-Rent",
        //           icon: Shield,
        //         },
        //       ],
        //     },
        //     {
        //       label: "Property View",
        //       key: "property-view",
        //       icon: Shield,
        //       children: [
        //         {
        //           path: "/owner-buy-view",
        //           label: "Owner-Buy",
        //           icon: UserCircle,
        //         },
        //         { path: "/owner-rent-view", label: "Owner-Rent", icon: Shield },
        //       ],
        //     },
        //     {
        //       path: "/create-payments",
        //       label: "Create-Payments",
        //       icon: Shield,
        //     },
        //   ],
        // },
        //{ path: "/locations", label: "Locations", icon: Locate },
        // {
        //   label: "Accounts",
        //   icon: Users,
        //   key: "accounts",
        //   children: [
        //     {
        //       path: "/accounts-summary",
        //       label: "Accounts Summary",
        //       icon: Users,
        //     },
        //     { path: "/paymets-list", label: "Payments List", icon: Users },
        //     {
        //       path: "/active-subscriptions",
        //       label: "Active Subscriptions",
        //       icon: Users,
        //     },
        //     {
        //       path: "/subscription-history",
        //       label: "Subscription History",
        //       icon: Users,
        //     },
        //     {
        //       path: "/Revenue-by-plan",
        //       label: "Revenue By Plan",
        //       icon: Users,
        //     },
        //   ],
        // },
      ],
      accounts: [
        { path: "/", label: "Dashboard", icon: Home },
        {
          label: "Properties",
          icon: FolderKanban,
          key: "properties",
          children: [
            { path: "/residential", label: "Residential", icon: Home },
            { path: "/commercial", label: "Commercial", icon: Store },
            { path: "/agricultural", label: "Agricultural", icon: Leaf },
            { path: "/land", label: "Land", icon: MapPin },
          ],
        },
        // {
        //   path: "/property-progress",
        //   label: "Property Progress",
        //   icon: ActivitySquare,
        // },
        // {
        //   path: "/featured-properties",
        //   label: "Featured Projects",
        //   icon: Star,
        // },
        // {
        //   path: "/highlight-projects",
        //   label: "Highlight Projects",
        //   icon: Building2,
        // },
        // {
        //   label: "Users",
        //   icon: Users,
        //   key: "users",
        //   children: [
        //     { path: "/users", label: "All Users", icon: Users },
        //     // { path: "/users/builder", label: "Builders", icon: Building2 },
        //     {
        //       path: "/team-management",
        //       label: "Team Member Details",
        //       icon: UserCircle,
        //     },
        //     {
        //       label: "Create Credentials",
        //       icon: UserCircle,
        //       key: "create-credentials",
        //       action: "openCreateUserModal",
        //     },
        //     {
        //       path: "/users/roles",
        //       label: "Roles & Permissions",
        //       icon: Shield,
        //     },
        //   ],
        // },
        {
          label: "Subscriptions",
          icon: SubscriptIcon,
          key: "subscriptions",
          children: [
            { path: "/agent-payments", label: "Agent", icon: Users },
            {
              label: "Post Property",
              key: "post-property",
              icon: Shield,
              children: [
                {
                  path: "/owner-sell-property",
                  label: "Owner-Sell",
                  icon: UserCircle,
                },
                {
                  path: "/owner-rent-property",
                  label: "Owner-Rent",
                  icon: Shield,
                },
              ],
            },
            {
              label: "Property View",
              key: "property-view",
              icon: Shield,
              children: [
                {
                  path: "/owner-buy-view",
                  label: "Owner-Buy",
                  icon: UserCircle,
                },
                { path: "/owner-rent-view", label: "Owner-Rent", icon: Shield },
              ],
            },
            {
              path: "/create-payments",
              label: "Create-Payments",
              icon: Shield,
            },
          ],
        },
        //{ path: "/locations", label: "Locations", icon: Locate },
        {
          label: "Accounts",
          icon: Users,
          key: "accounts",
          children: [
            {
              path: "/accounts-summary",
              label: "Accounts Summary",
              icon: Users,
            },
            { path: "/paymets-list", label: "Payments List", icon: Users },
            {
              path: "/active-subscriptions",
              label: "Active Subscriptions",
              icon: Users,
            },
            {
              path: "/subscription-history",
              label: "Subscription History",
              icon: Users,
            },
            {
              path: "/Revenue-by-plan",
              label: "Revenue By Plan",
              icon: Users,
            },
          ],
        },
      ],
    })[role] || [];

  const menuItems = user ? getMenuByRole(user.roleName) : [];
  const showText = expanded || isMobileOpen;

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 z-50 flex flex-col transition-all
          ${expanded ? "lg:w-64" : "lg:w-[68px]"}
          ${isMobileOpen ? "w-64" : "lg:translate-x-0 -translate-x-full"}`}
      >
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = hasActiveDescendant(item);

            if (item.children) {
              return (
                <div key={item.key} className="mb-1">
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                      ${active ? "bg-green-50 text-[#27AE60]" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {showText && <span>{item.label}</span>}
                    </div>
                    {showText && (
                      <ChevronDown
                        className={`w-4 h-4 transition ${
                          openMenus[item.key] ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {openMenus[item.key] && showText && (
                    <div className="ml-4 mt-1 space-y-1 relative">
                      <div className="absolute left-2 top-0 bottom-4 w-px bg-gray-200" />

                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive =
                          (child.path && isActiveRoute(child.path)) ||
                          hasActiveDescendant(child);

                        return (
                          <div
                            key={child.key || child.path}
                            className="relative"
                          >
                            <div className="absolute left-2 top-1/2 w-3 h-px bg-gray-200" />

                            <button
                              // onClick={() =>
                              //   child.children
                              //     ? toggleMenu(child.key)
                              //     : navigate(child.path)
                              // }
                              onClick={() => {
                                if (child.action === "openCreateUserModal") {
                                  setShowCreateModal(true);
                                } else if (child.children) {
                                  toggleMenu(child.key);
                                } else {
                                  navigate(child.path);
                                }
                              }}
                              className={`ml-5 w-[calc(100%-20px)] px-3 py-2 rounded-lg text-sm flex justify-between
                                ${
                                  childActive
                                    ? "bg-[#27AE60] text-white"
                                    : "hover:bg-gray-50"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <ChildIcon className="w-4 h-4" />
                                {child.label}
                              </div>

                              {child.children && (
                                <ChevronRight
                                  className={`w-4 h-4 ${
                                    openMenus[child.key] ? "rotate-90" : ""
                                  }`}
                                />
                              )}
                            </button>

                            {child.children && openMenus[child.key] && (
                              <div className="ml-8 mt-1 relative space-y-1">
                                <div className="absolute left-2 top-0 bottom-3 w-px bg-gray-200" />
                                {child.children.map((sub) => {
                                  const SubIcon = sub.icon;

                                  return (
                                    <div
                                      key={sub.path}
                                      className="relative top-1"
                                    >
                                      <div className="absolute left-2 top-1/2 w-3 h-px bg-gray-200" />

                                      <button
                                        onClick={() => navigate(sub.path)}
                                        className={`ml-5 mb-1 w-[calc(100%-20px)] px-3 py-2 rounded-lg text-xs
          flex items-center gap-2
          ${
            isActiveRoute(sub.path)
              ? "bg-[#27AE60] text-white"
              : "hover:bg-gray-50"
          }`}
                                      >
                                        {/* ✅ SUB ICON */}
                                        {SubIcon && (
                                          <SubIcon className="w-3.5 h-3.5 shrink-0" />
                                        )}

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

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full px-3 py-2.5 rounded-lg flex gap-3
                  ${
                    isActiveRoute(item.path)
                      ? "bg-[#27AE60] text-white"
                      : "hover:bg-gray-50"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {showText && item.label}
              </button>
            );
          })}
        </nav>

        {user && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-[#27AE60] flex items-center justify-center shadow-sm">
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
    </>
  );
}
