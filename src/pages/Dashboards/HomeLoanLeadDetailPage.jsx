import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Landmark, Phone } from "lucide-react";
import { listHomeLoanApplications } from "../../features/property/propertyService";

const whenLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const statusClass = (status) => {
  if (status === "new") return "bg-sky-50 text-sky-800";
  if (status === "contacted" || status === "follow_up") return "bg-amber-50 text-amber-800";
  if (status === "converted") return "bg-emerald-50 text-emerald-800";
  return "bg-slate-100 text-slate-600";
};

/**
 * Loan-only detail for applicants who do not have a Propenu account yet.
 * Existing users are opened on /dashboard/users/:id instead.
 */
export default function HomeLoanLeadDetailPage() {
  const navigate = useNavigate();
  const { mobile = "" } = useParams();
  const mobileNumber = decodeURIComponent(mobile).trim();

  const query = useQuery({
    queryKey: ["home-loan-lead", mobileNumber],
    enabled: Boolean(mobileNumber),
    queryFn: async () => {
      const res = await listHomeLoanApplications({
        audience: "new",
        q: mobileNumber,
        page: 1,
        limit: 50,
      });
      return res.data;
    },
    staleTime: 15_000,
  });

  const rows = useMemo(() => {
    const all = query.data?.data || [];
    return all.filter((row) => String(row.mobileNumber || "").trim() === mobileNumber);
  }, [query.data, mobileNumber]);

  const head = rows[0];
  const linkedExisting = rows.find((row) => row.kind === "existing" && row.user?.id);

  useEffect(() => {
    if (linkedExisting?.user?.id) {
      // Safety: if search matched an existing account, send ops to the real profile.
      navigate(`/dashboard/users/${linkedExisting.user.id}`, { replace: true });
    }
  }, [linkedExisting?.user?.id, navigate]);

  if (linkedExisting?.user?.id) return null;

  return (
    <div className="mx-auto w-full max-w-[900px] space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/home-loans/users"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home Loan Users
        </Link>
      </div>

      <header className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Landmark className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
              New lead · no Propenu account
            </p>
            <h1 className="mt-0.5 truncate text-xl font-bold text-slate-900">
              {head?.fullName || "Home loan lead"}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {mobileNumber || "—"}
              </span>
              {head?.email ? <span>{head.email}</span> : null}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              This person is not in Properties users yet. Manage loan forms here until they create
              an account.
            </p>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Loan applications</h2>
          <p className="text-[11px] text-slate-500">All forms submitted with this mobile number</p>
        </div>

        {query.isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-semibold text-rose-600">Could not load lead forms</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No new-lead forms found for this mobile.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => {
              const offer = row.form?.selectedOffer;
              const calc = row.form?.calculator;
              return (
                <li key={row.id} className="px-4 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {requestTitle(row.form)}
                      </p>
                      <p className="text-[11px] text-slate-500">{whenLabel(row.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(row.status)}`}
                    >
                      {String(row.status || "new").replace(/_/g, " ")}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(offer
                      ? [
                          ["Bank", offer.bankName],
                          ["Amount", offer.loanAmount],
                          ["Interest", offer.interest],
                          ["EMI", offer.monthlyEmi],
                          ["Tenure", offer.tenure],
                        ]
                      : [
                          ["Calculator", calc?.type],
                          ["Amount", calc?.loanAmount],
                          ["Interest", calc?.interestRate],
                          ["EMI", calc?.calculatedEmi],
                          ["Income", calc?.monthlyIncome],
                          ["Max eligible", calc?.maxEligibleLoan],
                        ]
                    ).map(([label, value]) =>
                      value != null && value !== "" ? (
                        <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {label}
                          </dt>
                          <dd className="mt-0.5 text-xs font-semibold text-slate-800">
                            {show(value)}
                          </dd>
                        </div>
                      ) : null,
                    )}
                  </dl>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Assigned: {row.assignee?.name || "Assigning"}
                    {row.source ? ` · Source ${row.source}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
