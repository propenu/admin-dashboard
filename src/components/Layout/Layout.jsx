

// src/components/Layout/Layout.jsx

import { useState, useEffect } from "react";

import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../common/Navbar";

import Sidebar from "../common/Siderbar";

import PageBackNav from "../common/PageBackNav";

import { ContentSkeleton } from "../common/RouteFallback";

import { useSidebarActivityBadges } from "../../hooks/useSidebarActivityBadges";

import { usePresenceHeartbeat } from "../../hooks/usePresenceHeartbeat";

import { useAuthUserProfile } from "../../hooks/useAuthUser";
import { AdminWorkspaceProvider } from "../../features/adminWorkspace/AdminWorkspaceContext";
import { InventoryKindProvider } from "../../features/inventoryKind/InventoryKindContext";
import OperationsHorizontalNav from "../../features/operations/OperationsHorizontalNav";
import { isOperationsPath } from "../../features/operations/operationsNavConfig";



const SIDEBAR_EXPANDED = 208;

const SIDEBAR_COLLAPSED = 56;



/** Full-bleed flows (no sidebar) — email-style SE user onboarding, etc. */

const HIDE_SIDEBAR_PREFIXES = ["/sales-executives/onboard-user"];



/** Pages that should use the full content width (no extra inner padding). */

const FULL_WIDTH_PREFIXES = ["/whatsapp-notifications"];



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



/**

 * Progressive shell (industry pattern):

 * 1) Navbar + Sidebar paint immediately

 * 2) Shared /me loads once

 * 3) Badges / heavy APIs start after session is ready

 * 4) Page content (Outlet) shows after shell — skeleton only in main area

 */

export default function MainLayout() {

  const { pathname } = useLocation();

  // Mobile fixed nav covers the top — always land at the page top so
  // Dashboard / Main Desk content is not hidden under the tab strip.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  const hideSidebar = HIDE_SIDEBAR_PREFIXES.some(

    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),

  );

  const fullWidthContent = FULL_WIDTH_PREFIXES.some(

    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),

  );

  const onOperations = isOperationsPath(pathname);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isHovered, setIsHovered] = useState(false);



  const { user, isPending, isFetched } = useAuthUserProfile();

  const sessionReady = Boolean(user) || (isFetched && !isPending);



  // Heavy sidebar badge polls — only after /me is available
  useSidebarActivityBadges({
    enabled: sessionReady && Boolean(user),
    user,
  });
  usePresenceHeartbeat({ enabled: sessionReady && Boolean(user) });



  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);



  useEffect(() => {

    const handleResize = () => {

      setIsDesktop(window.innerWidth >= 1024);

    };



    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);



  useEffect(() => {

    if (hideSidebar) {

      setIsMobileOpen(false);

      setIsHovered(false);

    }

  }, [hideSidebar]);



  return (
    <AdminWorkspaceProvider>
    <InventoryKindProvider>
      <div className="min-h-screen" style={hideSidebar ? { backgroundColor: "#eef1f4" } : APP_BACKGROUND}>

        {/* Stage 1 — chrome first */}

        <Navbar
          toggleSidebar={() => {
            setIsMobileOpen((open) => !open);
            setIsHovered(false);
          }}
          hideSidebarToggle={hideSidebar}
          sidebarOpen={isMobileOpen || isHovered}
          onWorkspaceDropdownOpen={() => {
            setIsMobileOpen(false);
            setIsHovered(false);
          }}
        />



        <div
          className={`flex min-w-0 lg:pt-16 ${
            onOperations ? "pt-14" : "pt-32"
          }`}
        >

          {!hideSidebar ? (

            <Sidebar

              expanded={isHovered}

              isMobileOpen={isMobileOpen}

              closeMobile={() => setIsMobileOpen(false)}

              onHoverStart={() => setIsHovered(true)}

              onHoverEnd={() => setIsHovered(false)}

            />

          ) : null}



          <main

            className={`min-w-0 flex-1 transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] lg:min-h-[calc(100vh-4rem)] ${
              onOperations
                ? "min-h-[calc(100vh-3.5rem)]"
                : "min-h-[calc(100vh-8rem)]"
            }`}

            style={{

              ...(hideSidebar ? { backgroundColor: "#eef1f4" } : CONTENT_BACKGROUND),

              marginLeft: hideSidebar

                ? "0px"

                : isDesktop

                  ? isHovered

                    ? `${SIDEBAR_EXPANDED}px`

                    : `${SIDEBAR_COLLAPSED}px`

                  : "0px",

            }}

          >

            <div

              className={`min-w-0 max-w-full ${

                hideSidebar || fullWidthContent

                  ? "p-0"

                  : onOperations

                    ? "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-0 sm:px-4 lg:px-6"

                    : "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:p-4 lg:p-6"

              }`}

            >

              {!hideSidebar && !fullWidthContent ? (
                <OperationsHorizontalNav />
              ) : null}

              {!hideSidebar && !fullWidthContent && !onOperations ? (
                <PageBackNav />
              ) : null}

              {fullWidthContent && !hideSidebar ? (

                <div className="px-3 pt-2 sm:px-4">

                  <PageBackNav />

                </div>

              ) : null}

              {/* Stage 2 — page body after shell; soft skeleton while /me settles */}

              {!sessionReady ? (

                <ContentSkeleton rows={4} />

              ) : (

                <Outlet />

              )}

            </div>

          </main>

        </div>

      </div>
    </InventoryKindProvider>
    </AdminWorkspaceProvider>
  );

}


