
// src/components/common/Navbar.jsx
import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/logo.svg";
import * as Popover from "@radix-ui/react-popover";
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import Cookies from "js-cookie";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Load user
  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchLoggedInUser();
        setUser(data);
      } catch (err) {
        console.error("Navbar user load failed", err);
      }
    }
    loadUser();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/signin");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src={LOGO} alt="App Logo" className="h-10 w-auto" />
            </div>
          </div>

          {/* SEARCH */}
          {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#27AE60]
                focus:outline-none focus:ring-1 focus:ring-[#27AE60] bg-slate-50 outline-none"
              />
            </div>
          </div> */}

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* NOTIFICATION */}
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* USER DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown(true)}
              onMouseLeave={() => setOpenDropdown(false)}
            >
              <button
                onClick={() => setOpenDropdown((p) => !p)}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>

                <span className="hidden sm:block text-sm font-medium text-[#27AE60] capitalize">
                  {user?.name || "SignIn"}
                </span>
              </button>

              {/* DROPDOWN */}
              {openDropdown && (
                <div className="absolute  right-0 top-full pt-2 w-56 z-50">
                  {/* Arrow */}
                  <div className="absolute -top-0 right-8 w-4 h-4 bg-white rotate-45 border-l  border-t border-slate-200  max-sm:right-4"></div>
                  <div className="bg-[#FFFFFF] shadow-xl rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-[#27AE60] capitalize">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {user?.roleName}
                      </p>
                    </div>

                    {/* <button
                      onClick={() => navigate("/signin")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-slate-100 transition"
                    >
                      <LogIn className="w-4 h-4 text-[#27AE60]" />
                      Login
                    </button> */}

                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-slate-100 transition"
                    >
                      <User className="w-4 h-4 text-[#27AE60]" />
                      Profile
                    </button>

                    <button
                      onClick={() => navigate("/settings")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-slate-100 transition"
                    >
                      <Settings className="w-4 h-4 text-[#27AE60]" />
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE SIDEBAR TOGGLE */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}