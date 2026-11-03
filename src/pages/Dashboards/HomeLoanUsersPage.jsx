import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, UsersRound } from "lucide-react";
import { listHomeLoanApplications } from "../../features/property/propertyService";

const PAGE_SIZE = 50;

const SEGMENTS = [
  { id: "existing", label: "Existing users" },
  { id: "new", label: "New leads" },
];

const whenLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusClass = (status) => {
  if (status === "new") return "bg-sky-50 text-sky-800";
  if (status === "contacted" || status === "follow_up") return "bg-amber-50 text-amber-800";
  if (status === "converted") return "bg-emerald-50 text-emerald-800";
  return "bg-slate-100 text-slate-600";
};

/** Owner / Builder / Agent chip — colors stay distinct in the list. */
const roleBadgeClass = (roleName, roleLabel) => {
  const key = String(roleName || roleLabel || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  if (key === "user" || key === "owner" || roleLabel === "Owner") {
    return "bg-emerald-50 text-emerald-800 ring-emerald-100";
  }
  if (key === "builder" || roleLabel === "Builder") {
    return "bg-violet-50 text-violet-800 ring-violet-100";
  }
  if (key === "agent" || roleLabel === "Agent") {
    return "bg-sky-50 text-sky-800 ring-sky-100";
  }
  if (key.includes("sales")) return "bg-indigo-50 text-indigo-800 ring-indigo-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

/** Collapse form rows into one person (existing → userId, new → mobile). */
function groupPeople(rows = [], audience) {
  const map = new Map();
  for (const row of rows) {
    const isExisting = audience === "existing" || row.kind === "existing";
    const key = isExisting
      ? String(row.user?.id || row.id)
      : String(row.mobileNumber || row.id);
    if (!map.has(key)) {
      map.set(key, {
        key,
        kind: isExisting ? "existing" : "new",
        userId: row.user?.id || null,
        fullName: row.user?.name || row.fullName || "—",
        mobileNumber: row.mobileNumber || "—",
        email: row.email || null,
        accountStep: row.user?.accountStep || null,
        accountStatus: row.user?.accountStatus || null,
        roleName: row.user?.roleName || (isExisting ? "user" : null),
        // Existing Propenu accounts without role payload are Owners (role "user").
        roleLabel:
          row.user?.roleLabel ||
          (isExisting ? "Owner" : null),
        formCount: 0,
        latestAt: row.createdAt,
        latestStatus: row.status,
        location: [row.user?.locality, row.user?.city, row.user?.state]
          .filter(Boolean)
          .join(", "),
      });
    }
    const person = map.get(key);
    person.formCount += 1;
    if (row.user?.roleLabel && !person.roleLabel) {
      person.roleName = row.user.roleName || person.roleName;
      person.roleLabel = row.user.roleLabel;
    }
    if (new Date(row.createdAt || 0) > new Date(person.latestAt || 0)) {
      person.latestAt = row.createdAt;
      person.latestStatus = row.status;
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0),
  );
}

export default function HomeLoanUsersPage() {
  const navigate = useNavigate();
  const [audience, setAudience] = useState("existing");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["home-loan-users", audience, debouncedSearch, page],
    queryFn: async () => {
      const res = await listHomeLoanApplications({
        audience,
        q: debouncedSearch,
        page,
        limit: PAGE_SIZE,
      });
      return res.data;
    },
    placeholderData: (previous) => previous,
    staleTime: 15_000,
  });

  const rows = query.data?.data || [];
  const meta = query.data?.meta || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
    counts: { all: 0, existing: 0, new: 0 },
  };
  const counts = meta.counts || {
    all: 0,
    existing: 0,
    new: 0,
    existingPeople: 0,
    newPeople: 0,
  };
  const people = useMemo(() => groupPeople(rows, audience), [rows, audience]);
  // Badge must be unique people — never use form totals (counts.existing / counts.new).
  const hasPeopleMeta =
    typeof counts.existingPeople === "number" ||
    typeof counts.newPeople === "number";
  const existingPeopleCount = hasPeopleMeta
    ? Number(counts.existingPeople || 0)
    : people.length;
  const newPeopleCount = hasPeopleMeta
    ? Number(counts.newPeople || 0)
    : people.length;
  const firstLoad = query.isLoading && !query.data;

  const openPerson = (person) => {
    if (person.kind === "existing" && person.userId) {
      navigate(`/dashboard/users/${person.userId}`);
      return;
    }
    const mobile = encodeURIComponent(String(person.mobileNumber || "").trim());
    navigate(`/home-loans/leads/${mobile}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-3">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <UsersRound className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Home Loan Users</h1>
          <p className="text-xs text-slate-500">
            Existing accounts open the full user profile. New leads open a loan-only detail page.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {SEGMENTS.map((item) => {
            const count =
              item.id === "existing" ? existingPeopleCount : newPeopleCount;
            const active = audience === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAudience(item.id);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  active
                    ? "bg-[#0f3d2e] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
                <span className="ml-1 tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block w-full max-w-[220px] shrink-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or mobile"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-500"
          />
        </label>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {firstLoad ? (
          <div className="space-y-px p-2" aria-hidden>
            <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-lg bg-emerald-50/70" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="space-y-2 px-4 py-14 text-center">
            <p className="text-sm font-semibold text-rose-600">Could not load home loan users</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Retry
            </button>
          </div>
        ) : people.length === 0 ? (
          <p className="px-4 py-14 text-center text-sm text-slate-500">
            No {audience === "existing" ? "existing users" : "new leads"} in this list.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Person</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Forms</th>
                  <th className="px-3 py-2">Latest status</th>
                  <th className="px-3 py-2">Last submitted</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr
                    key={person.key}
                    onClick={() => openPerson(person)}
                    className="cursor-pointer hover:bg-emerald-50/40"
                  >
                    <td className="border-t border-slate-100 px-3 py-2.5">
                      <p className="text-sm font-semibold text-slate-900">{person.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        {person.mobileNumber}
                        {person.email ? ` · ${person.email}` : ""}
                      </p>
                      {person.location ? (
                        <p className="text-[11px] text-slate-400">{person.location}</p>
                      ) : null}
                    </td>
                    <td className="border-t border-slate-100 px-3 py-2.5">
                      <p
                        className={`text-xs font-semibold ${
                          person.kind === "new" ? "text-amber-700" : "text-emerald-800"
                        }`}
                      >
                        {person.kind === "new" ? "New lead" : "Existing user"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {person.accountStep || "No Propenu account"}
                      </p>
                    </td>
                    <td className="border-t border-slate-100 px-3 py-2.5">
                      {person.kind === "existing" && person.roleLabel ? (
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${roleBadgeClass(
                            person.roleName,
                            person.roleLabel,
                          )}`}
                        >
                          {person.roleLabel}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border-t border-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-800">
                      {person.formCount}
                    </td>
                    <td className="border-t border-slate-100 px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(person.latestStatus)}`}
                      >
                        {String(person.latestStatus || "new").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-t border-slate-100 px-3 py-2.5 text-xs text-slate-600">
                      {whenLabel(person.latestAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!firstLoad && meta.total > 0 ? (
          <footer className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5 text-xs text-slate-500">
            <span>
              {people.length} people on this page ·{" "}
              {audience === "existing" ? existingPeopleCount : newPeopleCount} total people ·{" "}
              {meta.total} forms · page {meta.page} of {meta.pages}
              {query.isFetching ? " · Updating" : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                type="button"
                disabled={page >= meta.pages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
