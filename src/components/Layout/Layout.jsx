// // src/components/Layout/Layout.jsx
// import { useState } from "react";
import Navbar from "../common/navbar";
import Sidebar from "../common/Siderbar";
// import { Outlet } from "react-router-dom";

// export default function Layout() {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

//       {/* Sidebar */}
//       <Sidebar
//         expanded={isHovered}
//         isMobileOpen={isMobileOpen}
//         closeMobile={() => setIsMobileOpen(false)}
//         onHoverStart={() => setIsHovered(true)}
//         onHoverEnd={() => setIsHovered(false)}
//       />

//       {/* Mobile Backdrop */}
//       {isMobileOpen && (
//         <div
//           onClick={() => setIsMobileOpen(false)}
//           className="fixed inset-0 bg-black/40 z-30 lg:hidden"
//         />
//       )}

//       {/* Main Content */}
//       <main
//         className={`
//           transition-all duration-300
//           lg:${isHovered ? "ml-64" : "ml-[68px]"}
//         `}
//       >
//         <div className="ml-16 p-4 sm:p-6">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// }




// // src/components/Layout/Layout.jsx
// import { useState } from "react";
// import { Outlet } from "react-router-dom";


// export default function Layout() {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Navbar is usually fixed at top: height 64px (h-16) */}
//       <Navbar toggleSidebar={() => setIsMobileOpen(true)} />

//       <div className="flex">
//         {/* Sidebar Component */}
//         <Sidebar
//           isHovered={isHovered}
//           isMobileOpen={isMobileOpen}
//           closeMobile={() => setIsMobileOpen(false)}
//           onHoverStart={() => setIsHovered(true)}
//           onHoverEnd={() => setIsHovered(false)}
//         />

//         {/* Mobile Backdrop - Only visible on small screens when sidebar is open */}
//         {isMobileOpen && (
//           <div
//             onClick={() => setIsMobileOpen(false)}
//             className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
//           />
//         )}

//         {/* Main Content Area */}
//         <main
//           className={`flex-1 transition-all duration-300 min-h-[calc(100vh-64px)]
//             ${isHovered ? "lg:ml-64" : "lg:ml-[70px]"}
//           `}
//         >
//           <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }  gemini one 





// // src/components/Layout/MainLayout.jsx
// import { useState } from "react";
// import { Outlet } from "react-router-dom";


// export default function MainLayout() {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Navbar with Menu Toggle for Mobile */}
//       <Navbar onMenuClick={() => setIsMobileOpen(true)} />

//       <div className="flex">
//         <Sidebar
//           expanded={isHovered}
//           isMobileOpen={isMobileOpen}
//           closeMobile={() => setIsMobileOpen(false)}
//           onHoverStart={() => setIsHovered(true)}
//           onHoverEnd={() => setIsHovered(false)}
//         />

//         {/* This main area shifts when the sidebar expands */}
//         <main
//           className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6
//             ${isHovered ? "lg:ml-64" : "lg:ml-[68px]"}
//           `}
//         >
//           <Outlet /> 
//         </main>
//       </div>
//     </div>
//   );
// }


// src/components/Layout/MainLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";


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