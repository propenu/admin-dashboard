import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, Link2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  createSubscriptionPaymentLink,
  getSubscriptionPlansForLink,
} from "../../../features/user/paymentLinkService";
import { useLivePermissions } from "../../../utils/useLivePermissions";
import { hasPermission } from "../../../utils/planAccessControl";
import {
  normalizeInboxWaId,
  saveInboxComposePayload,
} from "../../WhatsAppNotifications/utils/inboxCompose";

const GST_RATE = 0.18;

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

/** Same mapping as payment-service admin subscription payment links. */
export function roleToPaymentLinkUserType(roleName) {
  const role = normalizeRole(roleName);
  if (role === "owner" || role === "user" || role === "users" || role === "owners") {
    return "owner";
  }
  if (role === "agent" || role === "agents") return "agent";
  return null;
}

function money(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function planLabel(plan) {
  const name = plan?.name || plan?.code || "Plan";
  const bits = [name];
  if (plan?.tier) bits.push(String(plan.tier).toUpperCase());
  if (plan?.category) bits.push(String(plan.category));
  if (plan?.durationDays) bits.push(`${plan.durationDays}d`);
  return bits.join(" · ");
}

function estimateTotals(listPrice, discountPercent) {
  const price = Math.max(0, Number(listPrice) || 0);
  const discount = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const discountAmount = Math.round(((price * discount) / 100) * 100) / 100;
  const subtotal = Math.round((price - discountAmount) * 100) / 100;
  const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100;
  const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;
  return { discountAmount, subtotal, gstAmount, totalAmount };
}

/**
 * Client Progress Queue — create / share subscription payment links while on a call.
 */
export default function ClientPaymentLinkPanel({
  userId,
  roleName,
  customerName,
  customerPhone,
}) {
  const navigate = useNavigate();
  const { user: staff, loading: permsLoading } = useLivePermissions();
  const canCreate = hasPermission(staff, "payment:create");
  const userType = roleToPaymentLinkUserType(roleName);

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planId, setPlanId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCreated(null);
    setCopied(false);
    setDiscountPercent(0);
    setPlanId("");
  }, [userId]);

  useEffect(() => {
    if (!canCreate || !userType || !userId) return;
    let cancelled = false;
    setPlansLoading(true);
    getSubscriptionPlansForLink(userType)
      .then((list) => {
        if (cancelled) return;
        setPlans(list);
        setPlanId(list[0]?._id ? String(list[0]._id) : "");
      })
      .catch((err) => {
        if (!cancelled) toast.error(err?.message || "Could not load subscription plans");
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canCreate, userType, userId]);

  const selectedPlan = useMemo(
    () => plans.find((p) => String(p._id) === String(planId)),
    [plans, planId],
  );

  const estimate = useMemo(
    () => estimateTotals(selectedPlan?.price, discountPercent),
    [selectedPlan?.price, discountPercent],
  );

  if (permsLoading || !canCreate || !userType || !userId) return null;

  async function handleCreate(e) {
    e.preventDefault();
    if (!planId) {
      toast.error("Select a paid plan first");
      return;
    }
    setCreating(true);
    setCreated(null);
    try {
      const data = await createSubscriptionPaymentLink({
        userId,
        planId,
        discountPercent: Number(discountPercent) || 0,
      });
      setCreated(data);
      toast.success("Payment link ready — share it with the customer");
    } catch (err) {
      toast.error(err?.message || "Could not create payment link");
    } finally {
      setCreating(false);
    }
  }

  async function copyUrl() {
    const url = created?.link?.url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  function shareWhatsApp() {
    const url = created?.link?.url;
    if (!url) return;

    const phone = normalizeInboxWaId(customerPhone);
    if (!phone) {
      toast.error("This customer has no phone number for WhatsApp Inbox");
      return;
    }

    const name = String(customerName || "Customer").trim() || "Customer";
    const planName = String(created?.plan?.name || "subscription").trim();
    const amount =
      created?.plan?.totalAmount != null
        ? money(created.plan.totalAmount)
        : "";
    const draft = [
      `Hi ${name},`,
      "",
      `Your Propenu ${planName} payment link is ready${amount ? ` (${amount})` : ""}.`,
      "Open the link, sign in, and complete payment:",
      url,
      "",
      "This link is valid for a limited time.",
    ].join("\n");

    const saved = saveInboxComposePayload({ phone, name, draft });
    if (!saved) {
      toast.error("Could not open WhatsApp Inbox with this message");
      return;
    }

    // Open admin Inbox with this customer chat + message autofilled for telesales send
    navigate(`/whatsapp-notifications?section=inbox&compose=1&phone=${encodeURIComponent(phone)}`);
    toast.success("Opening Inbox — message is ready to send");
  }

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5 text-emerald-600" />
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Payment link
        </p>
        <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
          {userType === "agent" ? "Agent" : "Owner"} · 7 days
        </span>
      </div>

      <form onSubmit={handleCreate} className="space-y-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold text-slate-500">Plan</span>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            disabled={plansLoading || creating}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-800 outline-none focus:border-emerald-400"
          >
            {plansLoading && <option value="">Loading plans…</option>}
            {!plansLoading && plans.length === 0 && (
              <option value="">No paid plans available</option>
            )}
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {planLabel(plan)} — ₹
                {Number(plan.price || 0).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-bold text-slate-500">
            Discount %
          </span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={
                discountPercent === "" ||
                discountPercent == null ||
                Number(discountPercent) === 0
                  ? ""
                  : String(Number(discountPercent))
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                if (raw === "") {
                  setDiscountPercent("");
                  return;
                }
                // Drop leading zeros: 01 → 1, 034 → 34
                const cleaned = raw.replace(/^0+(?=\d)/, "");
                const next = Number(cleaned);
                if (!Number.isFinite(next)) return;
                setDiscountPercent(Math.min(100, Math.max(0, Math.round(next))));
              }}
              onBlur={() => {
                if (
                  discountPercent === "" ||
                  discountPercent == null ||
                  !Number.isFinite(Number(discountPercent))
                ) {
                  setDiscountPercent(0);
                }
              }}
              disabled={creating || !selectedPlan}
              className="payment-discount-input w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-8 text-[11px] font-semibold tabular-nums text-slate-800 outline-none focus:border-emerald-400 disabled:opacity-50"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
              %
            </span>
          </div>
          <style>{`
            .payment-discount-input {
              -moz-appearance: textfield;
              appearance: textfield;
            }
            .payment-discount-input::-webkit-outer-spin-button,
            .payment-discount-input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}</style>
        </label>

        {selectedPlan ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-[10px] text-slate-500">
            <span>List</span>
            <span className="text-right font-semibold text-slate-800">
              {money(selectedPlan.price)}
            </span>
            <span>Discount</span>
            <span className="text-right font-semibold text-rose-600">
              − {money(estimate.discountAmount)}
            </span>
            <span>GST 18%</span>
            <span className="text-right font-semibold text-slate-800">
              {money(estimate.gstAmount)}
            </span>
            <span className="font-bold text-slate-800">Total</span>
            <span className="text-right font-bold text-emerald-700">
              {money(estimate.totalAmount)}
            </span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={creating || plansLoading || !planId}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {creating ? "Creating…" : "Generate payment link"}
        </button>
      </form>

      {created?.link?.url ? (
        <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-white p-2">
          <p className="break-all font-mono text-[10px] leading-snug text-slate-600">
            {created.link.url}
          </p>
          {created.link.expiresAt ? (
            <p className="text-[10px] font-semibold text-slate-400">
              Expires {new Date(created.link.expiresAt).toLocaleString()}
              {created.plan?.totalAmount != null
                ? ` · ${money(created.plan.totalAmount)}`
                : ""}
            </p>
          ) : null}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#25D366] px-2 py-1.5 text-[10px] font-bold text-white hover:brightness-95"
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-1.5 text-[10px] text-slate-400">
        Customer opens the link, signs in, and pays. Subscription activates after payment.
      </p>
    </div>
  );
}
