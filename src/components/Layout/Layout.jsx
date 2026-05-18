// // // // // src/components/Layout/Layout.jsx
// // // import { useState } from "react";
// // // import { Outlet } from "react-router-dom";
// // // import Navbar from "../common/Navbar";
// // // import Sidebar from "../common/Siderbar";

// // // export default function MainLayout() {
// // //   const [isMobileOpen, setIsMobileOpen] = useState(false);
// // //   const [isHovered, setIsHovered] = useState(false);

// // //   return (
// // //     <div className="min-h-screen bg-gray-50">
// // //       {/* Navbar with Menu Toggle for Mobile */}
// // //       <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

// // //       <div className="flex">
// // //         <Sidebar
// // //           expanded={isHovered}
// // //           isMobileOpen={isMobileOpen}
// // //           closeMobile={() => setIsMobileOpen(false)}
// // //           onHoverStart={() => setIsHovered(true)}
// // //           onHoverEnd={() => setIsHovered(false)}
// // //         />

// // //         {/* Main content area shifts when the sidebar expands on desktop */}
// // //         <main
// // //           className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 mt-16
// // //             ${isHovered ? "lg:ml-64" : "lg:ml-[68px]"}
// // //           `}
// // //         >
// // //           <Outlet /> 
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // } 

// ///////////////  old running code above


// // // src/components/Layout/Layout.jsx
// // import { useState } from "react";
// // import { Outlet } from "react-router-dom";
// // import Navbar from "../common/Navbar";
// // import Sidebar from "../common/Siderbar";

// // // Must match the sidebar CSS widths exactly
// // const SIDEBAR_EXPANDED = 256;  // w-64  = 256px
// // const SIDEBAR_COLLAPSED = 68;  // lg:w-[68px]

// // export default function MainLayout() {
// //   const [isMobileOpen, setIsMobileOpen] = useState(false);
// //   const [isHovered, setIsHovered] = useState(false);

// //   return (
// //     <div className="min-h-screen" style={{ background: "#f0f5f2" }}>

// //       {/* ── Fixed Navbar, full width, z-60 ── */}
// //       <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

// //       {/* ── Body below navbar ── */}
// //       <div className="flex" style={{ paddingTop: "64px" /* h-16 = 64px */ }}>

// //         {/* ── Sidebar: fixed, starts at top:64px ── */}
// //         <Sidebar
// //           expanded={isHovered}
// //           isMobileOpen={isMobileOpen}
// //           closeMobile={() => setIsMobileOpen(false)}
// //           onHoverStart={() => setIsHovered(true)}
// //           onHoverEnd={() => setIsHovered(false)}
// //         />

// //         {/* ── Main content: shifts right by sidebar width ── */}
// //         <main
// //           className="flex-1 min-h-[calc(100vh-64px)] transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
// //           style={{
// //             marginLeft: isHovered ? `${SIDEBAR_EXPANDED}px` : `${SIDEBAR_COLLAPSED}px`,
// //           }}
// //         >
// //           {/* On mobile: full width (sidebar is drawer overlay, no margin shift) */}
// //           <div
// //             className="lg:hidden"
// //             style={{ marginLeft: 0 }}
// //           />

// //           <div className="p-3 sm:p-4 lg:p-6">
// //             <Outlet />
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // } 




// // src/components/Layout/Layout.jsx
// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import Navbar from "../common/Navbar";
// import Sidebar from "../common/Siderbar";

// const SIDEBAR_EXPANDED  = 256; // 64 * 4px = w-64
// const SIDEBAR_COLLAPSED = 68;  // icon-only width

// export default function MainLayout() {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div className="min-h-screen" style={{ background: "#f8fafc" }}>

//       {/* Fixed navbar — always on top */}
//       <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

//       {/* Body starts exactly below navbar */}
//       <div className="flex" style={{ paddingTop: "64px" }}>

//         <Sidebar
//           expanded={isHovered}
//           isMobileOpen={isMobileOpen}
//           closeMobile={() => setIsMobileOpen(false)}
//           onHoverStart={() => setIsHovered(true)}
//           onHoverEnd={() => setIsHovered(false)}
//         />

//         {/* Main content shifts right by sidebar width on desktop */}
//         <main
//           className="flex-1 min-h-[calc(100vh-64px)] transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]  "
//           style={{ marginLeft: isHovered ? `${SIDEBAR_EXPANDED}px` : `${SIDEBAR_COLLAPSED}px` }} 
//         >
//           <div className="p-3 sm:p-4 lg:p-6">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// } 


//new laoyt for this code

// src/components/Layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Sidebar from "../common/Siderbar";

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 68;

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
    <div className="min-h-screen bg-slate-50">
      
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