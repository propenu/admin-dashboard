// src/components/common/Navbar.jsx
import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/logo.svg";
import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { clearAuthToken } from "../../utils/authToken";
import { useAuthUserProfile } from "../../hooks/useAuthUser";
import {
  SIDEBAR_ACTIVITY_EVENT,
  getSidebarHamburgerTotal,
  readSidebarCounts,
} from "../../utils/sidebarActivity";
import { getSiteLogo } from "../../features/siteBranding/siteBrandingService";
import { isLogoVideoMedia } from "../../features/siteBranding/siteBrandingUtils";

export const SITE_LOGO_UPDATED_EVENT = "propenu:site-logo-updated";

export default function Navbar({ toggleSidebar, hideSidebarToggle = false }) {
  const navigate = useNavigate();
  const { user } = useAuthUserProfile();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [menuBadge, setMenuBadge] = useState(0);
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const dropRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadBrandLogo = () => {
      getSiteLogo()
        .then((res) => {
          if (cancelled) return;
          const url = res?.data?.data?.logoUrl || "";
          setBrandLogoUrl(typeof url === "string" ? url.trim() : "");
        })
        .catch(() => {
          if (!cancelled) setBrandLogoUrl("");
        });
    };
    loadBrandLogo();
    window.addEventListener(SITE_LOGO_UPDATED_EVENT, loadBrandLogo);
    window.addEventListener("focus", loadBrandLogo);
    return () => {
      cancelled = true;
      window.removeEventListener(SITE_LOGO_UPDATED_EVENT, loadBrandLogo);
      window.removeEventListener("focus", loadBrandLogo);
    };
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
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
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
        @keyframes navAccent {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes navAvatarGlow {
          0%, 100% { box-shadow: 0 0 0 2px #bbf7d0, 0 0 0 0 rgba(39,174,96,0.28); }
          50% { box-shadow: 0 0 0 2px #bbf7d0, 0 0 0 6px rgba(39,174,96,0); }
        }
        .nav-dropdown-animate { animation: dropdown-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nav-menu-btn:hover { background: #e8f8ee !important; color: #27AE60 !important; }
        .nav-drop-item:hover { background: #e8f8ee !important; color: #27AE60 !important; }
        .nav-drop-logout:hover { background: #fef2f2 !important; color: #dc2626 !important; }
        .nav-badge-pop { animation: nav-badge-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nav-badge-ping { animation: nav-badge-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .nav-accent {
          background: linear-gradient(90deg, #1e8f4d, #27AE60, #86efac, #27AE60, #1e8f4d);
          background-size: 220% 100%;
          animation: navAccent 3.8s linear infinite;
        }
        .nav-avatar-ring { animation: navAvatarGlow 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .nav-accent, .nav-avatar-ring, .nav-dropdown-animate { animation: none; }
        }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-[50] h-16">
        <div
          className="relative flex h-full items-center"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,251,248,0.94) 100%)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid #c8f3d9",
            boxShadow: "0 8px 24px -12px rgba(39,174,96,0.28)",
          }}
        >
          <div className="flex h-full w-full items-center justify-between px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {!hideSidebarToggle ? (
              <button
                onClick={toggleSidebar}
                className="nav-menu-btn relative lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[#c8f3d9] bg-white transition-colors"
                style={{ color: "#5c7d6d" }}
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
              className="flex min-w-0 cursor-pointer select-none items-center gap-2 rounded-2xl border border-[#c8f3d9] bg-white px-2.5 py-1 shadow-[0_4px_14px_rgba(39,174,96,0.10)] transition hover:border-[#27AE60] hover:shadow-[0_8px_18px_rgba(39,174,96,0.16)]"
              title="Propenu"
            >
              {brandLogoUrl && isLogoVideoMedia(brandLogoUrl) ? (
                <video
                  key={brandLogoUrl}
                  src={brandLogoUrl}
                  className="h-8 w-auto max-w-[160px] object-contain sm:h-9 sm:max-w-[200px]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Propenu logo"
                />
              ) : (
                <img
                  key={brandLogoUrl || "fallback-logo"}
                  src={brandLogoUrl || LOGO}
                  alt="Propenu"
                  className="h-8 w-auto max-w-[160px] object-contain sm:h-9 sm:max-w-[200px]"
                  onError={(e) => {
                    if (e.currentTarget.src !== LOGO) {
                      e.currentTarget.src = LOGO;
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2" ref={dropRef}>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown((p) => !p)}
                className="flex items-center gap-2 rounded-full border px-2 py-1 pr-2.5 transition-all duration-200"
                style={{
                  borderColor: openDropdown ? "#27AE60" : "#b7e4c7",
                  background: openDropdown
                    ? "linear-gradient(180deg, #27AE60 0%, #1e9a4f 100%)"
                    : "#ffffff",
                  boxShadow: openDropdown
                    ? "0 8px 18px rgba(39,174,96,0.28)"
                    : "0 4px 12px rgba(39,174,96,0.10)",
                }}
                onMouseEnter={(e) => {
                  if (!openDropdown) {
                    e.currentTarget.style.borderColor = "#27AE60";
                    e.currentTarget.style.boxShadow = "0 8px 18px rgba(39,174,96,0.16)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!openDropdown) {
                    e.currentTarget.style.borderColor = "#b7e4c7";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(39,174,96,0.10)";
                  }
                }}
              >
                <div
                  className="nav-avatar-ring relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #3dcc73, #27AE60, #1a8a49)" }}
                >
                  <User className="h-4 w-4 text-white" />
                </div>

                <div className="hidden min-w-0 max-w-[180px] text-left sm:block">
                  <p
                    className="truncate text-[13px] font-semibold leading-tight"
                    style={{ color: openDropdown ? "#ffffff" : "#0f3d2e" }}
                    title={user?.name || "Sign In"}
                  >
                    {user?.name || "Sign In"}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[11px] font-medium leading-tight"
                    style={{ color: openDropdown ? "rgba(255,255,255,0.86)" : "#27AE60" }}
                    title={displayRole}
                  >
                    {displayRole}
                  </p>
                </div>

                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: openDropdown ? "#ffffff" : "#5c7d6d",
                    transform: openDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {openDropdown && (
                <div
                  className="nav-dropdown-animate absolute right-0 top-full z-[70] mt-2.5 w-60 overflow-hidden rounded-2xl bg-white"
                  style={{
                    border: "1px solid #8fd0a8",
                    boxShadow:
                      "0 1px 2px rgba(15,61,46,0.05), 0 18px 36px -12px rgba(39,174,96,0.38)",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{
                      borderBottom: "1px solid #d8f0e2",
                      background: "linear-gradient(180deg, #f7fbf8 0%, #ffffff 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg, #3dcc73, #27AE60, #1a8a49)" }}
                      >
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold" style={{ color: "#0f3d2e" }}>
                          {user?.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-medium" style={{ color: "#27AE60" }}>
                          {displayRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5">
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
                        className="nav-drop-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150"
                        style={{ color: "#5c7d6d" }}
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e8f8ee]">
                          <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "#27AE60" }} />
                        </span>
                        {label}
                      </button>
                    ))}

                    <div style={{ height: "1px", background: "#d8f0e2", margin: "6px 8px" }} />

                    <button
                      onClick={handleLogout}
                      className="nav-drop-logout flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150"
                      style={{ color: "#ef4444" }}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-50">
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
          <div className="nav-accent absolute inset-x-0 bottom-0 h-[2.5px]" />
        </div>
      </nav>
    </>
  );
}
