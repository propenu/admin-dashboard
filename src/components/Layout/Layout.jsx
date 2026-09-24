

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

  const hideSidebar = HIDE_SIDEBAR_PREFIXES.some(

    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),

  );

  const fullWidthContent = FULL_WIDTH_PREFIXES.some(

    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),

  );

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

    <div className="min-h-screen" style={hideSidebar ? { backgroundColor: "#eef1f4" } : APP_BACKGROUND}>

      {/* Stage 1 — chrome first */}

      <Navbar

        toggleSidebar={() => setIsMobileOpen(true)}

        hideSidebarToggle={hideSidebar}

      />



      <div className="flex min-w-0 pt-16">

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

          className="min-h-[calc(100vh-64px)] min-w-0 flex-1 transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"

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

                : "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:p-4 lg:p-6"

            }`}

          >

            {!hideSidebar && !fullWidthContent ? <PageBackNav /> : null}

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

  );

}


