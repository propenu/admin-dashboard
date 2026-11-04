import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, FileText, ImagePlus, Loader2, Paperclip, Plus, ShieldAlert, Trash2, X,
} from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";
import BrandSelect from "./BrandSelect";
import { PAYMENT_METHODS } from "./PaymentMethodSelect";

const CHEQUE_STATUSES = [
  { value: "received", label: "Received", hint: "Collected, not yet deposited", icon: FileText, tone: "bg-slate-100 text-slate-600" },
  { value: "deposited", label: "Deposited", hint: "In the bank, awaiting clearance", icon: FileText, tone: "bg-sky-100 text-sky-700" },
  { value: "cleared", label: "Cleared", hint: "Money credited — counts as paid", icon: BadgeCheck, tone: "bg-emerald-100 text-emerald-700" },
  { value: "bounced", label: "Bounced", hint: "Returned unpaid", icon: ShieldAlert, tone: "bg-rose-100 text-rose-700" },
  { value: "cancelled", label: "Cancelled", hint: "Withdrawn", icon: X, tone: "bg-slate-100 text-slate-500" },
];
const CHEQUE_TONE = {
  received: "bg-slate-100 text-slate-700", deposited: "bg-sky-100 text-sky-700", cleared: "bg-emerald-100 text-emerald-700",
  bounced: "bg-rose-100 text-rose-700", cancelled: "bg-slate-100 text-slate-500",
};
const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM", "Amazon Pay", "Bank app", "Other"];
const CARD_NETWORKS = ["Visa", "Mastercard", "RuPay", "Amex", "Diners", "Other"];

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const dateText = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const methodMeta = (value) => PAYMENT_METHODS.find((item) => item.value === value) || PAYMENT_METHODS[PAYMENT_METHODS.length - 1];
const input = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100";
const counts = (entry) => (entry.method === "cheque" ? entry.cheque?.status === "cleared" : true);
const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

function F({ label, children, wide = false }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[10px] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const emptyForm = (balance) => ({
  method: "cash", amount: balance > 0 ? String(balance) : "", paidAt: today(),
  receivedByName: "", receiptNumber: "", payerName: "", transactionId: "", note: "",
  cheque: { instrumentType: "cheque", number: "", date: "", bankName: "", branch: "", ifsc: "", accountHolder: "", status: "received" },
  upi: { upiId: "", app: "GPay" },
  card: { cardType: "debit", network: "Visa", last4: "", cardHolder: "", approvalCode: "", terminalId: "" },
  netbanking: { transferMode: "neft", bankName: "", accountLast4: "" },
  other: { methodName: "", reference: "" },
});

function detailLines(entry) {
  const lines = [];
  if (entry.receivedByName) lines.push(["Received by", entry.receivedByName]);
  if (entry.payerName) lines.push(["Paid by", entry.payerName]);
  if (entry.receiptNumber) lines.push(["Receipt no", entry.receiptNumber]);
  if (entry.method === "cheque" && entry.cheque) {
    const c = entry.cheque;
    lines.push([c.instrumentType === "dd" ? "DD no" : "Cheque no", c.number]);
    if (c.date) lines.push(["Dated", dateText(c.date)]);
    lines.push(["Bank", [c.bankName, c.branch].filter(Boolean).join(", ")]);
    if (c.ifsc) lines.push(["IFSC", c.ifsc]);
    if (c.accountHolder) lines.push(["Account holder", c.accountHolder]);
    if (c.statusNote) lines.push(["Status note", c.statusNote]);
  }
  if (entry.method === "upi" && entry.upi) {
    if (entry.upi.upiId) lines.push(["UPI ID", entry.upi.upiId]);
    if (entry.upi.app) lines.push(["App", entry.upi.app]);
  }
  if (entry.method === "card" && entry.card) {
    const c = entry.card;
    lines.push(["Card", [c.cardType, c.network, c.last4 ? `•••• ${c.last4}` : ""].filter(Boolean).join(" · ")]);
    if (c.cardHolder) lines.push(["Card holder", c.cardHolder]);
    if (c.approvalCode) lines.push(["Approval code", c.approvalCode]);
    if (c.terminalId) lines.push(["Terminal", c.terminalId]);
  }
  if (entry.method === "netbanking" && entry.netbanking) {
    const n = entry.netbanking;
    lines.push(["Transfer", [n.transferMode?.toUpperCase(), n.bankName, n.accountLast4 ? `A/c ••${n.accountLast4}` : ""].filter(Boolean).join(" · ")]);
  }
  if (entry.method === "other" && entry.other) {
    lines.push(["Method", entry.other.methodName]);
    if (entry.other.reference) lines.push(["Reference", entry.other.reference]);
  }
  if (entry.transactionId) lines.push([entry.method === "razorpay" ? "Payment ID" : "Txn / UTR", entry.transactionId]);
  return lines.filter(([, value]) => value);
}

function ProofList({ proofs = [] }) {
  if (!proofs.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {proofs.map((proof) => (
        <a key={proof._id || proof.url} href={proof.url} target="_blank" rel="noreferrer" title={proof.name} className="group block">
          {String(proof.mimeType || "").startsWith("image/") ? (
            <img src={proof.url} alt={proof.name} className="h-14 w-14 rounded-lg border border-slate-200 object-cover group-hover:border-[#27AE60]" />
          ) : (
            <span className="flex h-14 w-24 items-center gap-1 rounded-lg border border-slate-200 px-2 text-[9px] text-slate-600 group-hover:border-[#27AE60]">
              <Paperclip size={11} className="shrink-0" /><span className="line-clamp-2">{proof.name}</span>
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

function PaymentCard({ entry, invoiceId, canUpdate, canDelete, onChanged }) {
  const meta = methodMeta(entry.method);
  const Icon = meta.icon;
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const label = entry.method === "other" && entry.other?.methodName ? entry.other.methodName : meta.label;

  const run = async (task, success) => {
    setBusy(true);
    try {
      const result = await task();
      if (success) toast.success(success);
      onChanged(result?.invoice);
    } catch (error) {
      toast.error(errorMessage(error, "Update failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`rounded-xl border p-3 ${counts(entry) ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/40"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.tone}`}><Icon size={14} /></span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800">{money(entry.amount)} <span className="font-normal text-slate-500">· {label}</span></p>
            <p className="text-[10px] text-slate-400">{dateText(entry.paidAt)}{entry.recordedByName ? ` · recorded by ${entry.recordedByName}` : ""}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {entry.method === "cheque" && <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${CHEQUE_TONE[entry.cheque?.status] || CHEQUE_TONE.received}`}>{entry.cheque?.status || "received"}</span>}
          {canUpdate && (
            <button type="button" disabled={busy} title="Add proof" onClick={() => fileRef.current?.click()} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-[#219653]"><ImagePlus size={13} /></button>
          )}
          {canDelete && (
            <button type="button" disabled={busy} title="Remove payment" onClick={() => window.confirm("Remove this payment entry?") && run(() => builderPlanService.removePayment(invoiceId, entry._id), "Payment removed")} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
          )}
          {busy && <Loader2 size={13} className="animate-spin text-[#27AE60]" />}
        </div>
      </div>
      <dl className="mt-2 grid gap-x-3 gap-y-0.5 text-[10px] sm:grid-cols-2">
        {detailLines(entry).map(([key, value]) => (
          <div key={key} className="flex gap-1"><dt className="shrink-0 text-slate-400">{key}:</dt><dd className="truncate text-slate-700">{value}</dd></div>
        ))}
      </dl>
      {entry.note && <p className="mt-1 text-[10px] italic text-slate-500">{entry.note}</p>}
      <ProofList proofs={entry.proofs} />
      {entry.method === "cheque" && canUpdate && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
          <span className="text-[10px] text-slate-500">Cheque status:</span>
          {CHEQUE_STATUSES.filter((item) => item.value !== (entry.cheque?.status || "received")).map((item) => (
            <button
              key={item.value}
              type="button"
              disabled={busy}
              onClick={() => {
                const statusNote = item.value === "bounced" ? window.prompt("Reason for bounce (optional)") ?? undefined : undefined;
                run(() => builderPlanService.updatePayment(invoiceId, entry._id, { cheque: { status: item.value, ...(statusNote !== undefined ? { statusNote } : {}) } }), `Cheque marked ${item.label.toLowerCase()}`);
              }}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.tone} hover:opacity-80`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        accept="image/*,.pdf"
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          event.target.value = "";
          if (files.length) run(() => builderPlanService.updatePayment(invoiceId, entry._id, {}, files), "Proof uploaded");
        }}
      />
    </li>
  );
}

export default function InvoicePaymentsPanel({ invoice, canUpdate, canDelete, onChanged }) {
  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
  const received = payments.filter(counts).reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const awaiting = payments.filter((entry) => entry.method === "cheque" && ["received", "deposited"].includes(entry.cheque?.status || "received"))
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const balance = Math.max(0, Math.round((Number(invoice.totalAmount || 0) - received) * 100) / 100);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(balance));
  const [proofs, setProofs] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setNested = (group, key, value) => setForm((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));

  const submit = async () => {
    const amount = Number(form.amount);
    if (!(amount > 0)) return toast.error("Enter the amount received");
    if (form.method === "cash" && !form.receivedByName.trim()) return toast.error("Enter who received the cash");
    if (form.method === "cheque" && (!form.cheque.number.trim() || !form.cheque.bankName.trim())) return toast.error("Cheque/DD number and bank are required");
    if (["upi", "netbanking", "razorpay"].includes(form.method) && !form.transactionId.trim()) return toast.error("Enter the transaction / UTR / payment ID");
    if (form.method === "card" && form.card.last4 && !/^\d{4}$/.test(form.card.last4)) return toast.error("Card last 4 digits must be 4 numbers");
    if (form.method === "card" && !form.transactionId.trim() && !form.card.approvalCode.trim()) return toast.error("Enter the card transaction ID or approval code");
    if (form.method === "other" && !form.other.methodName.trim()) return toast.error("Enter the payment method name");

    const entry = {
      method: form.method, amount, paidAt: form.paidAt, receivedByName: form.receivedByName, receiptNumber: form.receiptNumber,
      payerName: form.payerName, transactionId: form.transactionId, note: form.note,
      ...(form.method === "cheque" ? { cheque: form.cheque } : {}),
      ...(form.method === "upi" ? { upi: form.upi } : {}),
      ...(form.method === "card" ? { card: form.card } : {}),
      ...(form.method === "netbanking" ? { netbanking: form.netbanking } : {}),
      ...(form.method === "other" ? { other: form.other } : {}),
    };
    setSaving(true);
    try {
      const result = await builderPlanService.recordPayment(invoice._id, entry, proofs);
      toast.success(result?.message || "Payment recorded");
      setOpen(false);
      setProofs([]);
      onChanged(result?.invoice);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to record payment"));
    } finally {
      setSaving(false);
    }
  };

  const m = form.method;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Payments received</p>
        {canUpdate && !open && invoice.promotionStatus !== "cancelled" && (
          <button type="button" onClick={() => { setForm(emptyForm(balance)); setOpen(true); }} className="flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#219653]"><Plus size={12} />Record payment</button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2"><p className="text-[9px] uppercase text-slate-400">Total</p><p className="text-[12px] font-semibold text-slate-800">{money(invoice.totalAmount)}</p></div>
        <div className="rounded-xl bg-emerald-50 p-2"><p className="text-[9px] uppercase text-emerald-600">Received</p><p className="text-[12px] font-semibold text-emerald-700">{money(received)}</p></div>
        <div className="rounded-xl bg-amber-50 p-2"><p className="text-[9px] uppercase text-amber-600">Balance</p><p className="text-[12px] font-semibold text-amber-700">{money(balance)}</p></div>
      </div>
      {awaiting > 0 && <p className="mt-2 rounded-lg bg-sky-50 px-3 py-1.5 text-[10px] text-sky-800">{money(awaiting)} in cheques/DD waiting to clear. Mark them Cleared to count them as paid.</p>}

      {open && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <F label="Method *" wide><BrandSelect value={m} onChange={(value) => set("method", value)} options={PAYMENT_METHODS} title="Payment method" /></F>
            <F label="Amount received (₹) *"><input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={input} /></F>
            <F label="Payment date"><input type="date" value={form.paidAt} max={today()} onChange={(e) => set("paidAt", e.target.value)} className={input} /></F>
            <F label={m === "cash" ? "Received by (staff name) *" : "Received / verified by"}><input value={form.receivedByName} onChange={(e) => set("receivedByName", e.target.value)} className={input} placeholder="Who collected / verified it" /></F>
            <F label="Paid by (payer name)"><input value={form.payerName} onChange={(e) => set("payerName", e.target.value)} className={input} /></F>
            {m === "cash" && <F label="Receipt number"><input value={form.receiptNumber} onChange={(e) => set("receiptNumber", e.target.value)} className={input} /></F>}

            {m === "cheque" && (
              <>
                <F label="Instrument">
                  <select value={form.cheque.instrumentType} onChange={(e) => setNested("cheque", "instrumentType", e.target.value)} className={input}>
                    <option value="cheque">Cheque</option><option value="dd">Demand draft (DD)</option>
                  </select>
                </F>
                <F label={`${form.cheque.instrumentType === "dd" ? "DD" : "Cheque"} number *`}><input value={form.cheque.number} onChange={(e) => setNested("cheque", "number", e.target.value)} className={`${input} font-mono`} /></F>
                <F label="Cheque / DD date"><input type="date" value={form.cheque.date} onChange={(e) => setNested("cheque", "date", e.target.value)} className={input} /></F>
                <F label="Bank name *"><input value={form.cheque.bankName} onChange={(e) => setNested("cheque", "bankName", e.target.value)} className={input} /></F>
                <F label="Branch"><input value={form.cheque.branch} onChange={(e) => setNested("cheque", "branch", e.target.value)} className={input} /></F>
                <F label="IFSC"><input value={form.cheque.ifsc} onChange={(e) => setNested("cheque", "ifsc", e.target.value.toUpperCase().slice(0, 11))} className={`${input} font-mono`} /></F>
                <F label="Account holder"><input value={form.cheque.accountHolder} onChange={(e) => setNested("cheque", "accountHolder", e.target.value)} className={input} /></F>
                <F label="Status"><BrandSelect value={form.cheque.status} onChange={(value) => setNested("cheque", "status", value)} options={CHEQUE_STATUSES} title="Cheque status" /></F>
              </>
            )}

            {m === "upi" && (
              <>
                <F label="UTR / transaction ID *"><input value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} className={`${input} font-mono`} /></F>
                <F label="Payer UPI ID"><input value={form.upi.upiId} onChange={(e) => setNested("upi", "upiId", e.target.value)} className={input} placeholder="name@bank" /></F>
                <F label="UPI app">
                  <select value={form.upi.app} onChange={(e) => setNested("upi", "app", e.target.value)} className={input}>{UPI_APPS.map((app) => <option key={app}>{app}</option>)}</select>
                </F>
              </>
            )}

            {m === "card" && (
              <>
                <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-800 sm:col-span-2"><ShieldAlert size={12} />Never enter the full card number or CVV — only the last 4 digits.</p>
                <F label="Card type">
                  <select value={form.card.cardType} onChange={(e) => setNested("card", "cardType", e.target.value)} className={input}>
                    <option value="debit">Debit</option><option value="credit">Credit</option><option value="prepaid">Prepaid</option>
                  </select>
                </F>
                <F label="Network">
                  <select value={form.card.network} onChange={(e) => setNested("card", "network", e.target.value)} className={input}>{CARD_NETWORKS.map((n) => <option key={n}>{n}</option>)}</select>
                </F>
                <F label="Last 4 digits"><input inputMode="numeric" value={form.card.last4} onChange={(e) => setNested("card", "last4", e.target.value.replace(/\D/g, "").slice(0, 4))} className={`${input} font-mono`} placeholder="1234" /></F>
                <F label="Card holder name"><input value={form.card.cardHolder} onChange={(e) => setNested("card", "cardHolder", e.target.value)} className={input} /></F>
                <F label="Approval / auth code"><input value={form.card.approvalCode} onChange={(e) => setNested("card", "approvalCode", e.target.value)} className={`${input} font-mono`} /></F>
                <F label="Transaction ID"><input value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} className={`${input} font-mono`} /></F>
                <F label="POS terminal ID"><input value={form.card.terminalId} onChange={(e) => setNested("card", "terminalId", e.target.value)} className={input} /></F>
              </>
            )}

            {m === "netbanking" && (
              <>
                <F label="Transfer mode">
                  <select value={form.netbanking.transferMode} onChange={(e) => setNested("netbanking", "transferMode", e.target.value)} className={input}>
                    <option value="neft">NEFT</option><option value="rtgs">RTGS</option><option value="imps">IMPS</option><option value="other">Other</option>
                  </select>
                </F>
                <F label="UTR / reference *"><input value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} className={`${input} font-mono`} /></F>
                <F label="Payer bank"><input value={form.netbanking.bankName} onChange={(e) => setNested("netbanking", "bankName", e.target.value)} className={input} /></F>
                <F label="Payer account (last 4)"><input value={form.netbanking.accountLast4} onChange={(e) => setNested("netbanking", "accountLast4", e.target.value.replace(/\D/g, "").slice(0, 4))} className={`${input} font-mono`} /></F>
              </>
            )}

            {m === "razorpay" && <F label="Razorpay payment ID *" wide><input value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} className={`${input} font-mono`} placeholder="pay_XXXXXXXX" /></F>}

            {m === "other" && (
              <>
                <F label="Method name *"><input value={form.other.methodName} onChange={(e) => setNested("other", "methodName", e.target.value)} className={input} placeholder="e.g. Adjustment, Barter, Wallet" /></F>
                <F label="Reference"><input value={form.other.reference} onChange={(e) => setNested("other", "reference", e.target.value)} className={input} /></F>
              </>
            )}

            <F label="Note" wide><input value={form.note} onChange={(e) => set("note", e.target.value)} className={input} /></F>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-[10px] text-slate-500">Proof ({m === "cheque" ? "cheque / DD image" : m === "cash" ? "receipt photo" : "screenshot or slip"})</span>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded-lg border border-dashed border-emerald-300 px-3 py-1.5 text-[11px] text-[#219653] hover:bg-emerald-50"><ImagePlus size={12} />Add files</button>
                {proofs.map((file, index) => (
                  <span key={`${file.name}-${index}`} className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] text-slate-600 ring-1 ring-slate-200">
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button type="button" onClick={() => setProofs((c) => c.filter((_, i) => i !== index))} className="text-slate-400 hover:text-red-600"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                accept="image/*,.pdf"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  event.target.value = "";
                  const tooBig = files.find((file) => file.size > 10 * 1024 * 1024);
                  if (tooBig) return toast.error(`${tooBig.name} is larger than 10 MB`);
                  setProofs((current) => [...current, ...files].slice(0, 10));
                }}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={() => { setOpen(false); setProofs([]); }} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600">Cancel</button>
            <button type="button" disabled={saving} onClick={submit} className="flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#219653] disabled:opacity-50">
              {saving && <Loader2 size={12} className="animate-spin" />}Save payment
            </button>
          </div>
        </div>
      )}

      {payments.length ? (
        <ul className="mt-3 space-y-2">
          {[...payments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).map((entry) => (
            <PaymentCard key={entry._id} entry={entry} invoiceId={invoice._id} canUpdate={canUpdate} canDelete={canDelete} onChanged={onChanged} />
          ))}
        </ul>
      ) : (
        !open && <p className="mt-3 text-[11px] text-slate-400">No payments recorded yet. Use Record payment for each amount received — cash, cheque/DD, UPI, card, net banking or any other method.</p>
      )}
    </div>
  );
}
