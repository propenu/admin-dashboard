// // src/components/Layout/Layout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar";
import Sidebar from "../common/Siderbar";

export default function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with Menu Toggle for Mobile */}
      <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

      <div className="flex">
        <Sidebar
          expanded={isHovered}
          isMobileOpen={isMobileOpen}
          closeMobile={() => setIsMobileOpen(false)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        />

        {/* Main content area shifts when the sidebar expands on desktop */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 mt-16
            ${isHovered ? "lg:ml-64" : "lg:ml-[68px]"}
          `}
        >
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}