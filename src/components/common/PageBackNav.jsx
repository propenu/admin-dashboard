import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/** Top-level homes — no back control. */
const HIDDEN_EXACT = new Set(["/", "/sign-in", "/sign-up", "/login"]);

/**
 * Pages that already render their own Back / Go Back control.
 * Hide the layout-level button to avoid duplicates.
 */
const HIDDEN_PREFIXES = [
  "/post-property",
  "/create-featured-project",
  "/edit-property",
  "/access-control/roles",
  "/access-control/credentials",
  "/dashboard/workflow/",
  "/dashboard/users/",
  "/featured-project",
  "/highlight-property",
  "/highlighted-project-details",
  "/land-property-details",
  "/land-property-verification",
  "/residential-property-verification",
  "/commercial-property-verification",
  "/agricultural-property-verification",
  "/property/",
  "/commercial/",
  "/residential/",
  "/agricultural/",
  "/sales-executives/onboard-user",
];

function shouldHideBack(pathname) {
  if (HIDDEN_EXACT.has(pathname)) return true;

  return HIDDEN_PREFIXES.some((prefix) => {
    if (prefix.endsWith("/")) {
      return pathname.startsWith(prefix);
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export default function PageBackNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (shouldHideBack(pathname)) return null;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-[#27AE60]"
        aria-label="Go back"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>
    </div>
  );
}
