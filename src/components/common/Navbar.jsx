// src/components/common/Navbar.jsx
import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/logo.svg";
import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import { clearAuthToken } from "../../utils/authToken";
import {
  SIDEBAR_ACTIVITY_EVENT,
  getSidebarHamburgerTotal,
  readSidebarCounts,
} from "../../utils/sidebarActivity";

export default function Navbar({ toggleSidebar, hideSidebarToggle = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [menuBadge, setMenuBadge] = useState(0);
  const dropRef = useRef(null);

  useEffect(() => {
    fetchLoggedInUser().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const syncBadge = (counts) => {
      setMenuBadge(getSidebarHamburgerTotal(counts || readSidebarCounts()));
    };
    syncBadge(readSidebarCounts());
    const onCounts = (event) => syncBadge(event.detail);
    window.addEventListener(SIDEBAR_ACTIVITY_EVENT, onCounts);
    return () => window.removeEventListener(SIDEBAR_ACTIVITY_EVENT, onCounts);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    navigate("/signin");
  };

  const roleLabels = {
    sales_agent: "Sales Executive",
    super_admin: "Super Admin",
    admin: "Admin",
  };

  const displayRole = (
    roleLabels[user?.roleName] ||
    user?.roleName?.replace(/_/g, " ") ||
    ""
  ).replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nav-badge-pop {
          0% { transform: scale(0.6); opacity: 0.4; }
          60% { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes nav-badge-ping {
          0% { transform: scale(1); opacity: 0.55; }
          75%, 100% { transform: scale(1.85); opacity: 0; }
        }
        .nav-dropdown-animate { animation: dropdown-in 0.15s ease forwards; }
        .nav-menu-btn:hover { background: #f0fdf4 !important; }
        .nav-drop-item:hover { background: #f0fdf4 !important; color: #27AE60 !important; }
        .nav-drop-logout:hover { background: #fef2f2 !important; color: #dc2626 !important; }
        .nav-badge-pop { animation: nav-badge-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nav-badge-ping { animation: nav-badge-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 z-[50] h-16 flex items-center bg-white"
        style={{
          borderBottom: "1px solid #e8f5e9",
          boxShadow: "0 1px 8px rgba(39,174,96,0.08)",
        }}
      >
        <div className="w-full px-4 sm:px-5 flex items-center justify-between h-full">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {!hideSidebarToggle ? (
              <button
                onClick={toggleSidebar}
                className="nav-menu-btn relative lg:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                style={{ color: "#64748b" }}
                aria-label={
                  menuBadge > 0
                    ? `Open menu, ${menuBadge} new alerts`
                    : "Toggle Sidebar"
                }
              >
                <Menu className="w-5 h-5" />
                {menuBadge > 0 ? (
                  <span className="pointer-events-none absolute -right-0.5 -top-0.5">
                    <span className="nav-badge-ping absolute inline-flex h-full w-full rounded-full bg-red-400" />
                    <span className="nav-badge-pop relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black leading-none text-white shadow-sm ring-2 ring-white">
                      {menuBadge > 99 ? "99+" : menuBadge}
                    </span>
                  </span>
                ) : null}
              </button>
            ) : null}

            <div
              onClick={() => navigate("/")}
              className="flex min-w-0 cursor-pointer select-none items-center gap-2"
            >
              <img
                src={LOGO}
                alt="Logo"
                className="h-8 w-auto object-contain sm:h-9"
              />
            </div>
          </div>

          {/* ── RIGHT: User dropdown ── */}
          <div className="flex items-center gap-2" ref={dropRef}>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown((p) => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-150 border"
                style={{
                  borderColor: openDropdown ? "#27AE60" : "#e2e8f0",
                  background: openDropdown ? "#f0fdf4" : "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#27AE60";
                  e.currentTarget.style.background = "#f0fdf4";
                }}
                onMouseLeave={(e) => {
                  if (!openDropdown) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "white";
                  }
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #27AE60, #1a8a49)",
                  }}
                >
                  <User className="w-4 h-4 text-white" />
                </div>

                <div className="hidden sm:block text-left min-w-0 max-w-[180px]">
                  <p
                    className="text-[13px] font-semibold truncate leading-tight"
                    style={{ color: "#1e293b" }}
                    title={user?.name || "Sign In"}
                  >
                    {user?.name || "Sign In"}
                  </p>
                  <p
                    className="text-[11px] font-medium truncate leading-tight mt-0.5"
                    style={{ color: "#27AE60" }}
                    title={displayRole}
                  >
                    {displayRole}
                  </p>
                </div>

                <ChevronDown
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: "#94a3b8",
                    transform: openDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Dropdown */}
              {openDropdown && (
                <div
                  className="nav-dropdown-animate absolute right-0 top-full mt-2 w-56 z-[70] rounded-xl overflow-hidden bg-white"
                  style={{
                    border: "1px solid #e8f5e9",
                    boxShadow:
                      "0 8px 32px rgba(39,174,96,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Arrow */}
                  <div
                    className="absolute -top-[5px] right-[100px] w-[10px] h-[10px] rotate-45 bg-green-500"
                    style={{
                      border: "1px solid #e8f5e9",
                      borderBottom: "none",
                      borderRight: "none",
                    }}
                  />

                  {/* User info header */}
                  <div
                    className="px-4 py-3 "
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#f8fffe",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #27AE60, #1a8a49)",
                        }}
                      >
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[13px] font-semibold truncate"
                          style={{ color: "#1e293b" }}
                        >
                          {user?.name}
                        </p>
                        <p
                          className="text-[11px] font-medium truncate mt-0.5"
                          style={{ color: "#27AE60" }}
                        >
                          {displayRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {[
                      {
                        icon: User,
                        label: "Profile",
                        action: () => navigate("/profile"),
                      },
                      {
                        icon: Settings,
                        label: "Settings",
                        action: () => navigate("/settings"),
                      },
                    ].map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        onClick={() => {
                          action();
                          setOpenDropdown(false);
                        }}
                        className="nav-drop-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] transition-all duration-150"
                        style={{ color: "#475569" }}
                      >
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "#27AE60" }}
                        />
                        {label}
                      </button>
                    ))}

                    <div
                      style={{
                        height: "1px",
                        background: "#f1f5f9",
                        margin: "4px 12px",
                      }}
                    />

                    <button
                      onClick={handleLogout}
                      className="nav-drop-logout flex items-center gap-3 w-full px-4 py-2.5 text-[13px] transition-all duration-150"
                      style={{ color: "#ef4444" }}
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
