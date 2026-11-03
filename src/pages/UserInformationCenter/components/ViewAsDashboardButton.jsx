import React, { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startUserImpersonation } from "../../../features/user/userService";
import { resolveWebAppUrl } from "../../../config/env";
import { useAuthUserProfile } from "../../../hooks/useAuthUser";
import { C } from "./shared";

const VIEWABLE_ROLES = new Set([
  "user",
  "builder",
  "builder_staff",
  "agent",
  "customer_care",
  "relationship_manager",
]);

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function labelForRole(roleName) {
  if (roleName === "builder" || roleName === "builder_staff") {
    return "View builder dashboard";
  }
  if (
    roleName === "agent" ||
    roleName === "customer_care" ||
    roleName === "relationship_manager"
  ) {
    return "View agent dashboard";
  }
  if (roleName === "user") {
    return "View owner account";
  }
  return "View dashboard";
}

/**
 * SuperAdmin only — opens frontend/web in a new tab with a read-only view-as session.
 */
export default function ViewAsDashboardButton({ userId, roleName }) {
  const { roleName: actorRole } = useAuthUserProfile();
  const [loading, setLoading] = useState(false);

  const actor = normalizeRole(actorRole);
  const targetRole = normalizeRole(roleName);

  if (actor !== "super_admin") return null;
  if (!userId || !VIEWABLE_ROLES.has(targetRole)) return null;

  const onClick = async () => {
    if (loading) return;
    setLoading(true);

    // Open synchronously inside the click handler so production browsers
    // do not block the tab (async window.open after await is blocked).
    const tab = window.open("about:blank", "_blank");
    if (tab) {
      try {
        tab.document.title = "Opening view-as…";
        tab.document.body.innerHTML =
          '<p style="font-family:system-ui;padding:24px;color:#334155">Opening read-only dashboard…</p>';
      } catch {
        /* cross-origin / restricted about:blank — ignore */
      }
    }

    try {
      const data = await startUserImpersonation(userId);
      const code = data?.exchangeCode;
      if (!code) {
        throw new Error(data?.message || "No exchange code returned");
      }

      const webBase = resolveWebAppUrl();
      const returnUrl = encodeURIComponent(window.location.href);
      const url = `${webBase}/view-as?code=${encodeURIComponent(code)}&returnUrl=${returnUrl}`;

      if (tab && !tab.closed) {
        tab.location.href = url;
        try {
          tab.opener = null;
        } catch {
          /* ignore */
        }
        toast.success("Opened read-only web dashboard (expires soon)");
      } else {
        // Popup blocked — same-tab fallback so production still works
        toast.message("Popup blocked — opening view-as in this tab");
        window.location.assign(url);
      }
    } catch (err) {
      if (tab && !tab.closed) {
        try {
          tab.close();
        } catch {
          /* ignore */
        }
      }
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start view-as session",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="Super Admin read-only: exact web screens for this user"
      style={{
        marginLeft: "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 14px",
        borderRadius: "10px",
        border: `1px solid ${C.accent}40`,
        background: C.accent + "12",
        color: C.accentDark || C.accent,
        fontSize: "12px",
        fontWeight: 700,
        fontFamily: "'Outfit', system-ui, sans-serif",
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.75 : 1,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : (
        <ExternalLink size={14} strokeWidth={2.4} />
      )}
      {labelForRole(targetRole)}
    </button>
  );
}
