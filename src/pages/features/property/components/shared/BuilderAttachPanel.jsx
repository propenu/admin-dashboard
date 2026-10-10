import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Mail, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  getUserSearch,
  unpackUserSearch,
} from "../../../../../features/user/userService";
import {
  assignExistingBuilderToProject,
  directCreateBuilderOnProject,
  sendBuilderInviteEmail,
  submitProjectForApproval,
} from "../../../../../features/property/propertyService";
import { useCurrentUser } from "../../../../../store/properties/useCurrentUser";
import { canDirectCreateBuilder } from "../../../../../utils/projectAccessControl";

const SEARCH_PAGE_SIZE = 6;

/** Page buttons 1, 2, 3… with a short window when there are many pages. */
const builderPageNumbers = (current, total) => {
  const count = Math.max(0, Number(total) || 0);
  const page = Math.min(Math.max(1, Number(current) || 1), Math.max(count, 1));
  if (count <= 1) return count === 1 ? [1] : [];
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const start = Math.max(1, Math.min(page - 2, count - 4));
  const end = Math.min(count, start + 4);
  const pages = [];
  for (let number = start; number <= end; number += 1) pages.push(number);
  if (pages[0] !== 1) pages.unshift(1);
  if (pages[pages.length - 1] !== count) pages.push(count);
  return pages;
};

const inp =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10";

const builderInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "B";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const builderDetailLine = (person) =>
  [person?.email, person?.phone, person?.city || person?.locality]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" · ");

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
  const [pickedBuilder, setPickedBuilder] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const builderListRef = useRef(null);
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

  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchQuery.trim();
      setDebouncedQ((current) => {
        if (current === next) return current;
        setSearchPage(1);
        setActiveIndex(0);
        return next;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const buildersQuery = useQuery({
    queryKey: [
      "builder-attach-panel",
      "builders",
      debouncedQ,
      searchPage,
      SEARCH_PAGE_SIZE,
    ],
    enabled: editing && mode === "existing_builder",
    queryFn: async () => {
      const res = await getUserSearch({
        role: "builder",
        page: searchPage,
        limit: SEARCH_PAGE_SIZE,
        lean: 1,
        ...(debouncedQ ? { q: debouncedQ } : {}),
      });
      return unpackUserSearch(res);
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const searchMeta = buildersQuery.data?.meta;
  const builders = Array.isArray(buildersQuery.data?.results)
    ? buildersQuery.data.results
    : [];
  const builderTotal = Number(searchMeta?.total) || 0;
  const totalPages = Math.max(
    1,
    Number(searchMeta?.pages) ||
      Math.ceil(builderTotal / SEARCH_PAGE_SIZE) ||
      1,
  );
  const pageNumbers = builderPageNumbers(
    Math.min(searchPage, totalPages),
    builderTotal > 0 ? totalPages : 0,
  );

  const resetForm = () => {
    setMode("");
    setBuilderId("");
    setPickedBuilder(null);
    setActiveIndex(0);
    setSearchQuery("");
    setDebouncedQ("");
    setSearchPage(1);
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

  const pickBuilder = (row) => {
    if (!row?._id) return;
    setBuilderId(String(row._id));
    setPickedBuilder(row);
  };

  const clearPickedBuilder = () => {
    setBuilderId("");
    setPickedBuilder(null);
  };

  useEffect(() => {
    if (!builderId || pickedBuilder?.name || pickedBuilder?.email) return;
    const match = builders.find((row) => String(row._id) === String(builderId));
    if (match) setPickedBuilder(match);
  }, [builders, builderId, pickedBuilder]);

  useEffect(() => {
    if (!buildersQuery.isSuccess || buildersQuery.isFetching) return;
    if (searchPage > totalPages) {
      setSearchPage(totalPages);
      setActiveIndex(0);
    }
  }, [buildersQuery.isSuccess, buildersQuery.isFetching, searchPage, totalPages]);

  const listLoading = buildersQuery.isFetching && builders.length === 0;
  const listRefreshing = buildersQuery.isFetching && builders.length > 0;
  const rangeStart = builders.length
    ? (Math.min(searchPage, totalPages) - 1) * SEARCH_PAGE_SIZE + 1
    : 0;
  const rangeEnd = builders.length ? rangeStart + builders.length - 1 : 0;

  useEffect(() => {
    const root = builderListRef.current;
    const row = builders[activeIndex];
    if (!root || !row?._id) return;
    const node = root.querySelector(
      `[data-builder-id="${String(row._id)}"]`,
    );
    if (!node) return;
    const rootRect = root.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    if (nodeRect.top < rootRect.top) {
      root.scrollTop -= rootRect.top - nodeRect.top;
    } else if (nodeRect.bottom > rootRect.bottom) {
      root.scrollTop += nodeRect.bottom - rootRect.bottom;
    }
  }, [activeIndex, builders]);

  const onBuilderSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!builders.length) return;
      setActiveIndex((index) => Math.min(builders.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!builders.length) return;
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" && builders[activeIndex]) {
      event.preventDefault();
      pickBuilder(builders[activeIndex]);
    }
  };

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
              setPickedBuilder(
                existing && (existing.name || existing.email) ? existing : null,
              );
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
              const nextMode = e.target.value;
              setMode(nextMode);
              const keepCurrent =
                nextMode === "existing_builder" && existing?._id
                  ? existing
                  : null;
              setBuilderId(keepCurrent?._id ? String(keepCurrent._id) : "");
              setPickedBuilder(
                keepCurrent && (keepCurrent.name || keepCurrent.email)
                  ? keepCurrent
                  : null,
              );
              setActiveIndex(0);
              if (nextMode === "existing_builder") {
                setSearchQuery("");
                setDebouncedQ("");
                setSearchPage(1);
              }
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
              <p className="text-xs font-semibold leading-relaxed text-slate-600">
                Search by name, email, or phone, then select one builder.
              </p>

              {pickedBuilder ? (
                <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-white px-3 py-2.5">
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">
                    {builderInitials(pickedBuilder.name || pickedBuilder.email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {pickedBuilder.name || "Unnamed builder"}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      {builderDetailLine(pickedBuilder) || "Selected to assign"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearPickedBuilder}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Clear selected builder"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
              ) : null}

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inp} pl-9`}
                  placeholder="Search builder by name, email, phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={onBuilderSearchKeyDown}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="existing-builder-list"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    builders[activeIndex]
                      ? `existing-builder-option-${builders[activeIndex]._id}`
                      : undefined
                  }
                />
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
                <div
                  id="existing-builder-list"
                  ref={builderListRef}
                  role="listbox"
                  aria-label="Existing builders"
                  className="max-h-72 overflow-y-auto"
                >
                  {listLoading && !builders.length ? (
                    <div className="space-y-2 p-3" aria-busy="true">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`builder-skel-${index}`}
                          className="flex animate-pulse items-center gap-3"
                        >
                          <div className="h-9 w-9 rounded-full bg-slate-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/3 rounded bg-slate-100" />
                            <div className="h-2.5 w-2/3 rounded bg-slate-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : buildersQuery.isError && !builders.length ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-bold text-slate-800">
                        Couldn’t load builders
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                        onClick={() => buildersQuery.refetch()}
                      >
                        Try again
                      </button>
                    </div>
                  ) : !builders.length ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-bold text-slate-800">
                        No builders found
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {debouncedQ
                          ? `Nothing matches “${debouncedQ}”. Try a name, email, or phone.`
                          : "No builder accounts are available to assign."}
                      </p>
                    </div>
                  ) : (
                    builders.map((builder, index) => {
                      const id = String(builder._id);
                      const selected = id === String(builderId || "");
                      const active = index === activeIndex;
                      const company = String(builder.companyName || "").trim();
                      const showCompany =
                        company &&
                        company.toLowerCase() !==
                          String(builder.name || "").trim().toLowerCase();
                      return (
                        <button
                          key={id}
                          id={`existing-builder-option-${id}`}
                          data-builder-id={id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => pickBuilder(builder)}
                          className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 ${
                            selected
                              ? "bg-emerald-50"
                              : active
                                ? "bg-slate-50"
                                : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-black ${
                              selected
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {builderInitials(builder.name || builder.email)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-bold text-slate-900">
                                {builder.name || "Unnamed builder"}
                              </span>
                              {showCompany ? (
                                <span className="truncate text-[11px] font-semibold text-slate-400">
                                  {company}
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                              {builderDetailLine(builder) || "No contact details"}
                            </span>
                          </span>
                          {selected ? (
                            <Check
                              className="h-4 w-4 flex-shrink-0 text-emerald-600"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-slate-50 px-3 py-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {listLoading
                      ? "Loading builders…"
                      : listRefreshing
                        ? "Updating builders…"
                        : builders.length && builderTotal
                          ? `Showing ${rangeStart}–${rangeEnd} of ${builderTotal}`
                          : builderTotal
                            ? `Showing 0 of ${builderTotal}`
                            : "0 builders"}
                  </span>
                  {pageNumbers.length ? (
                    <nav
                      className="flex flex-wrap items-center gap-1"
                      aria-label="Builder pages"
                    >
                      {pageNumbers.map((page, index) => {
                        const previous = pageNumbers[index - 1];
                        const gap = previous && page - previous > 1;
                        const active = page === searchPage;
                        return (
                          <span key={`builder-page-${page}`} className="flex items-center gap-1">
                            {gap ? (
                              <span className="px-1 text-xs font-bold text-slate-400">…</span>
                            ) : null}
                            <button
                              type="button"
                              aria-label={`Builder page ${page}`}
                              aria-current={active ? "page" : undefined}
                              disabled={buildersQuery.isFetching && active}
                              onClick={() => {
                                setSearchPage(page);
                                setActiveIndex(0);
                                builderListRef.current?.scrollTo?.({ top: 0 });
                              }}
                              className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-bold ${
                                active
                                  ? "bg-emerald-600 text-white"
                                  : "border border-gray-200 bg-white text-slate-700 hover:bg-emerald-50"
                              }`}
                            >
                              {page}
                            </button>
                          </span>
                        );
                      })}
                    </nav>
                  ) : null}
                </div>
              </div>
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
              disabled={
                attachMutation.isPending ||
                (mode === "existing_builder" && !builderId)
              }
              onClick={() => attachMutation.mutate()}
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {attachMutation.isPending
                ? "Saving…"
                : mode === "invite_link"
                  ? "Send invite"
                  : mode === "direct_create"
                    ? "Create builder & assign"
                    : mode === "existing_builder" && !builderId
                      ? "Select a builder to assign"
                      : mode === "existing_builder" && pickedBuilder?.name
                        ? hasBuilder
                          ? `Update to ${pickedBuilder.name}`
                          : `Assign ${pickedBuilder.name}`
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
