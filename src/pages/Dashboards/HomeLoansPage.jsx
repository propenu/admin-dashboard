import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Landmark, Search } from "lucide-react";
import { listHomeLoanApplications } from "../../features/property/propertyService";

const PAGE_SIZE = 12;

const AUDIENCES = [
  { id: "all", label: "All forms" },
  { id: "existing", label: "Existing users" },
  { id: "new", label: "New users" },
];

const methodLabel = (method) => {
  if (method === "location_round_robin") return "Location round robin";
  if (method === "round_robin") return "Round robin";
  if (method === "existing_owner") return "Same owner as the account";
  return "Waiting";
};

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

const show = (value) => {
  if (value == null || value === "") return "—";
  return String(value);
};

const requestTitle = (form) => {
  if (form?.selectedOffer?.bankName) return form.selectedOffer.bankName;
  if (form?.calculator?.type === "eligibility") return "Eligibility check";
  if (form?.calculator?.type === "emi") return "EMI calculator";
  if (form?.sourceSection) return String(form.sourceSection).replace(/_/g, " ");
  return "Home loan form";
};

const requestMeta = (form) => {
  const offer = form?.selectedOffer;
  if (offer) {
    return [
      offer.loanAmount ? `Amount ${offer.loanAmount}` : "",
      offer.interest ? `${offer.interest} interest` : "",
      offer.monthlyEmi ? `EMI ${offer.monthlyEmi}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }
  const calc = form?.calculator;
  if (calc?.type === "emi") {
    return [
      calc.loanAmount ? `Amount ${calc.loanAmount}` : "",
      calc.interestRate ? `${calc.interestRate}%` : "",
      calc.calculatedEmi ? `EMI ${calc.calculatedEmi}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (calc?.type === "eligibility") {
    return [
      calc.monthlyIncome ? `Income ${calc.monthlyIncome}` : "",
      calc.maxEligibleLoan ? `Max ${calc.maxEligibleLoan}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return "Name and mobile only";
};

const statusClass = (status) => {
  if (status === "new") return "bg-sky-50 text-sky-800";
  if (status === "contacted" || status === "follow_up") return "bg-amber-50 text-amber-800";
  if (status === "converted") return "bg-emerald-50 text-emerald-800";
  return "bg-slate-100 text-slate-600";
};

const locationLabel = (user) => {
  if (!user) return "No account location";
  const parts = [user.locality, user.city, user.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location form not filled";
};

function DetailGrid({ items }) {
  const visible = items.filter((item) => item.value != null && item.value !== "");
  if (!visible.length) return null;
  return (
    <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map((item) => (
        <div key={item.label} className="rounded-lg bg-white px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-xs font-semibold text-slate-800">{show(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-px p-2" aria-hidden>
      <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-lg bg-emerald-50/70" />
      ))}
    </div>
  );
}

export default function HomeLoansPage() {
  const [audience, setAudience] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["home-loans", audience, debouncedSearch, page],
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
  const counts = meta.counts || { all: 0, existing: 0, new: 0 };
  const firstLoad = query.isLoading && !query.data;

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-3">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Landmark className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Home Loans</h1>
          <p className="text-xs text-slate-500">
            One row per form. The same person can appear more than once when they apply from different offers.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCES.map((item) => {
            const count =
              item.id === "existing"
                ? counts.existing
                : item.id === "new"
                  ? counts.new
                  : counts.all;
            const active = audience === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAudience(item.id);
                  setPage(1);
                  setOpenId("");
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
          <SkeletonTable />
        ) : query.isError ? (
          <div className="space-y-2 px-4 py-14 text-center">
            <p className="text-sm font-semibold text-rose-600">Could not load home loans</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-14 text-center text-sm text-slate-500">
            No home loan forms in this list.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Applicant</th>
                  <th className="px-3 py-2">Application</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const open = openId === row.id;
                  const offer = row.form?.selectedOffer;
                  const calc = row.form?.calculator;
                  return (
                    <Fragment key={row.id}>
                      <tr
                        onClick={() => setOpenId(open ? "" : row.id)}
                        className="cursor-pointer hover:bg-emerald-50/40"
                      >
                        <td className="border-t border-slate-100 px-3 py-2.5">
                          <p className="text-sm font-semibold text-slate-900">{row.fullName}</p>
                          <p className="text-[11px] text-slate-500">{row.mobileNumber}</p>
                        </td>
                        <td className="border-t border-slate-100 px-3 py-2.5">
                          <p className="text-xs font-semibold text-slate-800">{requestTitle(row.form)}</p>
                          <p className="text-[11px] text-slate-500">{requestMeta(row.form)}</p>
                        </td>
                        <td className="border-t border-slate-100 px-3 py-2.5">
                          <p className={`text-xs font-semibold ${row.kind === "new" ? "text-amber-700" : "text-emerald-800"}`}>
                            {row.kind === "new" ? "New user" : "Existing user"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {row.user?.accountStep || "No account yet"}
                          </p>
                        </td>
                        <td className="border-t border-slate-100 px-3 py-2.5">
                          <p className="text-xs font-semibold capitalize text-slate-800">
                            {row.assignee?.name || "Assigning"}
                          </p>
                          <p className="text-[11px] text-slate-500">{methodLabel(row.assignMethod)}</p>
                        </td>
                        <td className="whitespace-nowrap border-t border-slate-100 px-3 py-2.5 text-xs text-slate-600">
                          {whenLabel(row.createdAt)}
                        </td>
                        <td className="border-t border-slate-100 px-3 py-2.5">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(row.status)}`}>
                            {String(row.status || "new").replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="border-t border-slate-100 px-3 py-3">
                            <div className="space-y-3">
                              <DetailGrid
                                items={
                                  offer
                                    ? [
                                        { label: "Bank", value: offer.bankName },
                                        { label: "Loan amount", value: offer.loanAmount },
                                        { label: "Interest", value: offer.interest },
                                        { label: "Tenure", value: offer.tenure },
                                        { label: "Monthly EMI", value: offer.monthlyEmi },
                                        { label: "Processing fee", value: offer.processingFee },
                                        { label: "Processing time", value: offer.processingTime },
                                        { label: "Fee discount", value: offer.discountOnProcessing },
                                        { label: "Login fee", value: offer.loginFee },
                                      ]
                                    : [
                                        { label: "Calculator", value: calc?.type },
                                        { label: "Loan amount", value: calc?.loanAmount },
                                        { label: "Interest", value: calc?.interestRate },
                                        { label: "Tenure", value: calc?.tenureYears },
                                        { label: "EMI", value: calc?.calculatedEmi },
                                        { label: "Monthly income", value: calc?.monthlyIncome },
                                        { label: "Existing EMIs", value: calc?.existingEmis },
                                        { label: "Max eligible", value: calc?.maxEligibleLoan },
                                      ]
                                }
                              />
                              <p className="text-[11px] text-slate-500">
                                {locationLabel(row.user)}
                                {row.email ? ` · ${row.email}` : ""}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!firstLoad && meta.total > 0 ? (
          <footer className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5 text-xs text-slate-500">
            <span>
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
