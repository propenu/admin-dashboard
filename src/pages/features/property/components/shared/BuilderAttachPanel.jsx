import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { getUserSearch } from "../../../../../features/user/userService";
import {
  assignExistingBuilderToProject,
  directCreateBuilderOnProject,
  sendBuilderInviteEmail,
  submitProjectForApproval,
} from "../../../../../features/property/propertyService";
import { useCurrentUser } from "../../../../../store/properties/useCurrentUser";
import { canDirectCreateBuilder } from "../../../../../utils/projectAccessControl";

const inp =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10";

const builderPerson = (createdBy) => {
  if (!createdBy) return null;
  if (typeof createdBy === "string" && createdBy.trim()) {
    return { _id: createdBy.trim(), name: null };
  }
  if (typeof createdBy === "object") {
    const id = createdBy._id || createdBy.id || createdBy.userId;
    if (!id && !createdBy.name && !createdBy.email) return null;
    return { ...createdBy, _id: id ? String(id) : undefined };
  }
  return null;
};

/**
 * Attach or change builder (Created By) on project detail/edit.
 * Modes: existing_builder | invite_link | direct_create (SA / BDH only)
 */
export default function BuilderAttachPanel({
  projectId,
  currentBuilder,
  onAttached,
}) {
  const queryClient = useQueryClient();
  const { data: userPayload } = useCurrentUser();
  const currentUser = userPayload?.user || userPayload;
  const allowDirectCreate = canDirectCreateBuilder(currentUser);

  const existing = builderPerson(currentBuilder);
  const hasBuilder = Boolean(existing?._id || existing?.name || existing?.email);

  const [editing, setEditing] = useState(!hasBuilder);
  const [mode, setMode] = useState("");
  const [builderId, setBuilderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState([""]);
  const [company, setCompany] = useState("");
  const [directForm, setDirectForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
  });
  const [directFieldErrors, setDirectFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const buildersQuery = useQuery({
    queryKey: ["builder-attach-panel", "builders"],
    enabled: editing && mode === "existing_builder",
    queryFn: async () => {
      const res = await getUserSearch({ role: "builder", limit: 200 });
      const rows =
        res?.data?.results ||
        res?.data?.data?.results ||
        res?.data?.data ||
        (Array.isArray(res?.data) ? res.data : []);
      return Array.isArray(rows) ? rows : [];
    },
    staleTime: 60_000,
  });

  const builders = buildersQuery.data || [];
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return builders;
    return builders.filter((b) =>
      [b.name, b.email, b.phone, b.city, b.locality]
        .map((x) => String(x || "").toLowerCase())
        .join(" ")
        .includes(q),
    );
  }, [builders, searchQuery]);

  const resetForm = () => {
    setMode("");
    setBuilderId("");
    setSearchQuery("");
    setEmails([""]);
    setCompany("");
    setDirectForm({ name: "", email: "", phone: "", companyName: "" });
    setDirectFieldErrors({ name: "", email: "", phone: "" });
  };

  const attachMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("Project id missing");

      if (mode === "existing_builder") {
        const id = String(builderId || "").trim();
        if (!id) throw new Error("Select an existing builder");
        const assignRes = await assignExistingBuilderToProject(projectId, id);
        const assignData =
          assignRes?.data?.data || assignRes?.data || assignRes || {};
        if (
          !assignData?.wentLive &&
          String(assignData?.status || "draft").toLowerCase() === "draft"
        ) {
          try {
            await submitProjectForApproval(projectId);
          } catch {
            /* optional */
          }
        }
        return { mode: "existing_builder", assign: assignData };
      }

      if (mode === "invite_link") {
        const list = emails
          .map((e) => String(e || "").trim().toLowerCase())
          .filter(Boolean);
        if (!list.length) throw new Error("Add at least one invite email");
        const bad = list.find((em) => !/^\S+@\S+\.\S+$/.test(em));
        if (bad) throw new Error(`Invalid email: ${bad}`);
        const inviteRes = await sendBuilderInviteEmail(projectId, {
          emails: list,
          companyName: String(company || "").trim() || undefined,
        });
        return {
          mode: "invite_link",
          invite: inviteRes?.data?.data || inviteRes?.data || inviteRes,
        };
      }

      if (mode === "direct_create") {
        if (!allowDirectCreate) {
          throw new Error(
            "Only Super Admin or Business Development Head can create a builder without OTP",
          );
        }
        const name = String(directForm.name || "").trim();
        const email = String(directForm.email || "").trim().toLowerCase();
        const phone = String(directForm.phone || "").replace(/\D/g, "");
        const companyName = String(directForm.companyName || "").trim();
        const nextErrors = { name: "", email: "", phone: "" };
        if (!name) nextErrors.name = "Builder name is required";
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
          nextErrors.email = "Enter a valid email, or leave it empty";
        }
        if (phone.length < 10) nextErrors.phone = "Enter a valid 10-digit phone number";
        setDirectFieldErrors(nextErrors);
        if (nextErrors.name || nextErrors.email || nextErrors.phone) {
          throw new Error(
            nextErrors.phone || nextErrors.email || nextErrors.name,
          );
        }
        const createRes = await directCreateBuilderOnProject(projectId, {
          name,
          email: email || undefined,
          phone,
          companyName: companyName || undefined,
        });
        return {
          mode: "direct_create",
          assign: createRes?.data?.data || createRes?.data || createRes,
        };
      }

      throw new Error("Choose how to set Created By");
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["getFeaturedProjectById", projectId],
      });
      if (result?.mode === "invite_link") {
        toast.success("Builder invite email sent");
      } else if (result?.mode === "direct_create") {
        toast.success(
          result?.assign?.createdNewUser
            ? "New builder created and assigned (no OTP)"
            : result?.assign?.wentLive
              ? "Builder assigned — project live"
              : "Builder created / linked as Created By",
        );
      } else {
        toast.success(
          result?.assign?.wentLive
            ? hasBuilder
              ? "Builder updated — project live"
              : "Builder assigned — project live"
            : hasBuilder
              ? "Builder (Created By) updated"
              : "Builder assigned",
        );
      }
      resetForm();
      setEditing(false);
      onAttached?.(result);
    },
    onError: (err) => {
      const payload = err?.response?.data || {};
      const message =
        payload.error ||
        payload.message ||
        err?.message ||
        "Could not update builder";
      const field = String(payload.conflictField || "").toLowerCase();
      if (mode === "direct_create") {
        setDirectFieldErrors({
          name: "",
          email: field === "email" ? message : "",
          phone: field === "phone" ? message : "",
        });
      }
      toast.error(message);
    },
  });

  const borderClass = hasBuilder
    ? "border-emerald-200 bg-emerald-50/30"
    : "border-amber-200 bg-amber-50/40";
  const eyebrowClass = hasBuilder ? "text-emerald-700" : "text-amber-700";

  const updateDirect = (key) => (event) =>
    setDirectForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section className={`rounded-2xl border-2 ${borderClass} p-4 shadow-sm`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
              border: "2px solid #bbf7d0",
            }}
          >
            <Building2 size={17} style={{ color: "#27AE60" }} />
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${eyebrowClass}`}
            >
              Created By · Builder
            </p>
            <h3 className="text-sm font-black text-slate-900">
              {hasBuilder
                ? "Project builder (Created By)"
                : "No builder on this project — add now"}
            </h3>
          </div>
        </div>

        {hasBuilder && !editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMode("existing_builder");
              if (existing?._id) setBuilderId(String(existing._id));
            }}
            className="rounded-xl border-2 border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
          >
            Change builder
          </button>
        ) : null}
      </div>

      {hasBuilder && !editing ? (
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-3 text-sm">
          <p className="font-bold text-slate-900">
            {existing?.name || "Builder"}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {[existing?.email, existing?.phone, existing?.city]
              .filter(Boolean)
              .join(" · ") ||
              (existing?._id ? `ID: ${existing._id}` : "—")}
          </p>
        </div>
      ) : null}

      {editing ? (
        <>
          {hasBuilder ? (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs">
              <span className="font-semibold text-slate-600">
                Current:{" "}
                <span className="font-bold text-slate-900">
                  {existing?.name || existing?.email || "Builder"}
                </span>
              </span>
              <button
                type="button"
                className="font-bold text-slate-500 hover:text-slate-800"
                onClick={() => {
                  resetForm();
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          ) : null}

          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
            Builder option
          </label>
          <select
            className={inp}
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setBuilderId(
                e.target.value === "existing_builder" && existing?._id
                  ? String(existing._id)
                  : "",
              );
              setEmails([""]);
              setDirectForm({ name: "", email: "", phone: "", companyName: "" });
              setDirectFieldErrors({ name: "", email: "", phone: "" });
            }}
          >
            <option value="">— Choose how to set Created By —</option>
            <option value="existing_builder">Existing Builder</option>
            <option value="invite_link">Builder Invite (email)</option>
            {allowDirectCreate ? (
              <option value="direct_create">
                Create new builder (direct — no OTP)
              </option>
            ) : null}
          </select>

          {mode === "existing_builder" ? (
            <div className="mt-4 space-y-3 border-t border-emerald-100/80 pt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inp} pl-9`}
                  placeholder="Search builder by name, email, phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className={inp}
                value={builderId}
                disabled={buildersQuery.isLoading}
                onChange={(e) => setBuilderId(e.target.value)}
              >
                <option value="">
                  {buildersQuery.isLoading
                    ? "Loading builders…"
                    : filtered.length
                      ? "— Select existing builder —"
                      : "No builders found"}
                </option>
                {filtered.map((b) => (
                  <option key={b._id} value={String(b._id)}>
                    {b.name || "Unnamed"}
                    {b.city ? ` · ${b.city}` : ""}
                    {b.email ? ` (${b.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {mode === "invite_link" ? (
            <div className="mt-4 space-y-3 border-t border-emerald-100/80 pt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Mail className="h-3.5 w-3.5" />
                Invite builder by email
              </p>
              {emails.map((email, idx) => (
                <div key={`ba-email-${idx}`} className="flex gap-2">
                  <input
                    className={inp}
                    type="email"
                    placeholder="builder@company.com"
                    value={email}
                    onChange={(e) => {
                      const next = [...emails];
                      next[idx] = e.target.value;
                      setEmails(next);
                    }}
                  />
                  {emails.length > 1 ? (
                    <button
                      type="button"
                      className="rounded-xl border-2 border-gray-200 px-3 text-sm font-bold text-red-500"
                      onClick={() =>
                        setEmails((prev) => {
                          const next = prev.filter((_, i) => i !== idx);
                          return next.length ? next : [""];
                        })
                      }
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="text-xs font-bold text-emerald-700"
                onClick={() => setEmails((prev) => [...prev, ""])}
              >
                + Add another email
              </button>
              <input
                className={inp}
                placeholder="Company name (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          ) : null}

          {mode === "direct_create" && allowDirectCreate ? (
            <div className="mt-4 space-y-3 border-t border-emerald-100/80 pt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <UserPlus className="h-3.5 w-3.5" />
                Create builder account (role = builder). Phone saved directly — no OTP.
              </p>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Name
                </label>
                <input
                  className={`${inp} ${directFieldErrors.name ? "border-red-400" : ""}`}
                  placeholder="Builder full name"
                  value={directForm.name}
                  onChange={(e) => {
                    updateDirect("name")(e);
                    setDirectFieldErrors((c) => ({ ...c, name: "" }));
                  }}
                />
                {directFieldErrors.name ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">{directFieldErrors.name}</p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Email (optional)
                  </label>
                  <input
                    className={`${inp} ${directFieldErrors.email ? "border-red-400" : ""}`}
                    type="email"
                    placeholder="builder@company.com (optional)"
                    value={directForm.email}
                    onChange={(e) => {
                      updateDirect("email")(e);
                      setDirectFieldErrors((c) => ({ ...c, email: "" }));
                    }}
                  />
                  {directFieldErrors.email ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">{directFieldErrors.email}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Phone
                  </label>
                  <input
                    className={`${inp} ${directFieldErrors.phone ? "border-red-400" : ""}`}
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="10-digit mobile"
                    value={directForm.phone}
                    onChange={(e) => {
                      setDirectForm((current) => ({
                        ...current,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 15),
                      }));
                      setDirectFieldErrors((c) => ({ ...c, phone: "" }));
                    }}
                  />
                  {directFieldErrors.phone ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">{directFieldErrors.phone}</p>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Company (optional)
                </label>
                <input
                  className={inp}
                  placeholder="Company name"
                  value={directForm.companyName}
                  onChange={updateDirect("companyName")}
                />
              </div>
            </div>
          ) : null}

          {mode ? (
            <button
              type="button"
              disabled={attachMutation.isPending}
              onClick={() => attachMutation.mutate()}
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {attachMutation.isPending
                ? "Saving…"
                : mode === "invite_link"
                  ? "Send invite"
                  : mode === "direct_create"
                    ? "Create builder & assign"
                    : hasBuilder
                      ? "Update Created By"
                      : "Assign builder"}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
