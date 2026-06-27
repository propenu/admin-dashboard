

// src/components/Layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Sidebar from "../common/Siderbar";

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 68;

const APP_BACKGROUND = {
  backgroundColor: "#f8fffb",
  backgroundImage:
    "radial-gradient(circle at 88% 4%, rgba(34, 197, 94, 0.10), transparent 30rem), linear-gradient(135deg, #ffffff 0%, #fbfffd 46%, #eefaf3 100%)",
  backgroundAttachment: "fixed",
};

const CONTENT_BACKGROUND = {
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.64) 0%, rgba(248, 255, 251, 0.82) 100%)",
};

export default function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ detect tablet/mobile
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen" style={APP_BACKGROUND}>
      
      {/* Navbar */}
      <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

      {/* Body */}
      <div className="flex pt-16">

        <Sidebar
          expanded={isHovered}
          isMobileOpen={isMobileOpen}
          closeMobile={() => setIsMobileOpen(false)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        />

        {/* Main Content */}
        <main
          className="flex-1 min-h-[calc(100vh-64px)] transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            ...CONTENT_BACKGROUND,
            marginLeft: isDesktop
              ? isHovered
                ? `${SIDEBAR_EXPANDED}px`
                : `${SIDEBAR_COLLAPSED}px`
              : "0px",
          }}
        >
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
