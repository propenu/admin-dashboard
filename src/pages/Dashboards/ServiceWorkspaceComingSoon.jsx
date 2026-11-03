import { Hammer, HeartHandshake, Landmark, Paintbrush } from "lucide-react";
import { useAdminWorkspace } from "../../features/adminWorkspace/AdminWorkspaceContext";

const ICONS = {
  construction: Hammer,
  interior: Paintbrush,
  home_care: HeartHandshake,
  home_loans: Landmark,
};

/**
 * Lightweight placeholder for service workspaces that are not live in admin yet.
 * Safe additive page — does not touch existing Home Loans or Main Admin screens.
 */
export default function ServiceWorkspaceComingSoon() {
  const { workspace } = useAdminWorkspace();
  const Icon = ICONS[workspace?.id] || Hammer;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div
        className="mb-5 grid h-16 w-16 place-items-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #e8f8ee, #c8f3d9)",
          color: "#1e9a4f",
          boxShadow: "0 10px 24px rgba(39,174,96,0.16)",
        }}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0f3d2e" }}>
        {workspace?.label || "Service"} workspace
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "#5c7d6d" }}>
        This product tab is ready in the admin shell. Ops screens, queues, and team
        lists for this service will land here without changing Main Admin.
      </p>
      <p
        className="mt-5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{ borderColor: "#b7e4c7", color: "#27AE60", background: "#f7fbf8" }}
      >
        Coming soon
      </p>
    </div>
  );
}
