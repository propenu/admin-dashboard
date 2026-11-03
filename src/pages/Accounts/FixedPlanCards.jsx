import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Eye, Loader2, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";
import { FIXED_PLAN_PRESETS } from "../../features/builderPlans/fixedPlans";

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(Number(value || 0));

const shortDate = (value) => (value
  ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
  : "");

const toForm = (plan) => ({
  price: plan ? String(plan.price ?? "") : "",
  discount: plan ? String(plan.discount ?? 0) : "0",
  durationDays: plan ? String(plan.durationDays ?? 30) : "30",
  isActive: plan ? Boolean(plan.isActive) : true,
});

const stripZeros = (value) => value.replace(/^0+(?=\d)/, "");

function validate(form) {
  const errors = {};
  const price = Number(form.price);
  if (form.price === "" || !Number.isFinite(price) || price < 0) errors.price = "Enter a price";
  if (!Number.isFinite(Number(form.discount)) || Number(form.discount) < 0) errors.discount = "Discount can't be negative";
  else if (!errors.price && Number(form.discount) > price) errors.discount = "Discount can't be more than the price";
  if (!Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) < 1) errors.durationDays = "At least 1 day";
  return errors;
}

function ActorLine({ label, actor, date }) {
  return (
    <p className="truncate text-[10px] text-slate-500">
      <span className="text-slate-400">{label} </span>
      <span className="font-medium text-slate-700">{actor?.name || actor?.email || "Unknown"}</span>
      {date ? <span className="text-slate-400"> · {shortDate(date)}</span> : null}
    </p>
  );
}

function DeletePlanDialog({ preset, deleting, onCancel, onConfirm }) {
  return createPortal(
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && !deleting && onCancel()}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ animation: "planDialogIn .18s ease-out" }}>
        <style>{"@keyframes planDialogIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}"}</style>
        <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><AlertTriangle size={18} /></span>
            <div>
              <p className="text-[14px] font-semibold">Delete {preset.title} plan?</p>
              <p className="text-[10px] text-rose-50">This permanently removes it from the database.</p>
            </div>
          </div>
          <button type="button" disabled={deleting} onClick={onCancel} className="rounded-lg p-1 text-white/80 hover:bg-white/15"><X size={16} /></button>
        </div>
        <div className="space-y-2 px-5 py-4 text-[11px] leading-5 text-slate-600">
          <p>The card will go back to <b>Not set up</b> and can't be used for new invoices until it is created again.</p>
          <p>Invoices already created keep their own copy of the plan, and the change history is kept.</p>
        </div>
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" disabled={deleting} onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50">Keep plan</button>
          <button type="button" disabled={deleting} onClick={onConfirm} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FixedPlanCard({ preset, plan, canCreate, canUpdate, canDelete, canCreateInvoice, onSaved, onCreateInvoice }) {
  const [form, setForm] = useState(() => toForm(plan));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exists = Boolean(plan?._id);
  const editable = exists ? canUpdate && editing : canCreate;
  const initial = toForm(plan);
  const dirty = Object.keys(initial).some((key) => String(initial[key]) !== String(form[key]));
  const finalPrice = Math.max(Number(form.price || 0) - Number(form.discount || 0), 0);
  const percentOff = Number(form.price) > 0 && Number(form.discount) > 0
    ? Math.round((Number(form.discount) / Number(form.price)) * 100)
    : 0;

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const cancelEdit = () => {
    setForm(toForm(plan));
    setErrors({});
    setEditing(false);
  };

  const save = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const days = Number(form.durationDays);
    const payload = {
      code: preset.code,
      title: preset.title,
      description: `${preset.title} promotion for ${days} days. Locations are set by our team when the promotion starts.`,
      price: Number(form.price),
      discount: Number(form.discount || 0),
      durationDays: days,
      isActive: form.isActive,
      mainPlacement: preset.mainPlacement,
      sponsoredEnabled: preset.sponsoredEnabled,
      locationRule: "team_picks",
      mainCoverage: {},
      sponsoredSameAsMain: true,
      sponsoredAd: {},
      visibleLeadLimit: Number(plan?.visibleLeadLimit || 0),
      startMode: "auto",
    };
    setSaving(true);
    try {
      if (exists) await builderPlanService.update(plan._id, payload);
      else await builderPlanService.create(payload);
      toast.success(`${preset.title} plan ${exists ? "saved" : "created"}`);
      setEditing(false);
      await onSaved?.();
    } catch (e) {
      toast.error(e.response?.data?.message || `Could not save the ${preset.title} plan`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await builderPlanService.remove(plan._id);
      toast.success(`${preset.title} plan deleted`);
      setConfirmDelete(false);
      await onSaved?.();
    } catch (e) {
      toast.error(e.response?.data?.message || `Could not delete the ${preset.title} plan`);
    } finally {
      setDeleting(false);
    }
  };

  const status = !exists
    ? { label: "Not set up", tone: "bg-slate-100 text-slate-500" }
    : editing
      ? { label: "Editing", tone: "bg-sky-50 text-sky-700" }
      : plan.isActive
        ? { label: "Active", tone: "bg-emerald-50 text-[#219653]" }
        : { label: "Hidden", tone: "bg-amber-50 text-amber-700" };

  const inputClass = (error) => `w-full rounded-xl border bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600 ${
    error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-[#27AE60] focus:ring-emerald-100"
  }`;

  const numberField = (key, label, required = false) => (
    <label className="block">
      <span className="mb-1 block text-[11px] text-slate-600">{label}{required && editable ? " *" : ""}</span>
      <input
        type="number"
        min="0"
        step="1"
        disabled={!editable || saving}
        value={form[key]}
        onFocus={(e) => e.target.select()}
        onChange={(e) => set(key, stripZeros(e.target.value))}
        className={inputClass(errors[key])}
      />
      {errors[key] ? <span className="mt-0.5 block text-[10px] text-red-600">{errors[key]}</span> : null}
    </label>
  );

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_4px_18px_rgba(15,23,42,.04)] transition ${editing ? "border-[#27AE60] ring-2 ring-emerald-100" : exists ? "border-slate-200" : "border-dashed border-slate-300"} ${preset.ring}`}>
      <div className={`h-1.5 w-full bg-gradient-to-r ${exists && plan.isActive ? preset.strip : "from-slate-200 to-slate-300"}`} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`flex items-center gap-1 rounded-xl p-2 ${preset.iconWrap}`}>
            {preset.icons.map((Icon, index) => <Icon key={index} size={16} />)}
          </span>
          <div className="flex items-center gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${status.tone}`}>{status.label}</span>
            {exists && canDelete && !editing && (
              <button
                type="button"
                title="Delete plan"
                onClick={() => setConfirmDelete(true)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <h3 className="mt-3 text-[16px] font-semibold text-slate-900">{preset.title}</h3>
        <span className="mt-1 w-fit rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-slate-500">{preset.code}</span>
        <p className="mt-2 min-h-8 text-[11px] leading-4 text-slate-500">{preset.meaning}</p>

        <div className="mt-3 rounded-xl bg-[#f4fbf7] px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-[.14em] text-slate-400">Final price</p>
          <div className="mt-0.5 flex flex-wrap items-end gap-x-2">
            <span className="text-[22px] font-semibold leading-none text-slate-900">{money(finalPrice)}</span>
            <span className="pb-0.5 text-[10px] text-slate-500">/ {Number(form.durationDays) || 0} days</span>
          </div>
          {percentOff > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 line-through">{money(form.price)}</span>
              <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-[#219653]">{percentOff}% OFF</span>
            </p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {numberField("price", "Base price (₹)", true)}
          {numberField("discount", "Flat discount (₹)")}
          {numberField("durationDays", "Duration (days)", true)}
          <label className="block">
            <span className="mb-1 block text-[11px] text-slate-600">Available for purchase</span>
            <span
              title="Off hides it from new invoices."
              className={`flex h-[38px] items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 ${editable ? "cursor-pointer" : "cursor-default bg-slate-50/60"}`}
            >
              <span className={`text-[12px] font-medium ${form.isActive ? "text-[#219653]" : "text-slate-500"}`}>{form.isActive ? "On" : "Off"}</span>
              <input
                type="checkbox"
                disabled={!editable || saving}
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="h-4 w-4 accent-[#27AE60]"
              />
            </span>
          </label>
        </div>

        {exists && (
          <div className="mt-3 space-y-0.5 rounded-xl border border-slate-100 px-3 py-2">
            <ActorLine label="Created by" actor={plan.createdBy} date={plan.createdAt} />
            <ActorLine label="Last edited by" actor={plan.updatedBy || plan.createdBy} date={plan.updatedAt} />
          </div>
        )}

        <div className="mt-auto space-y-2 pt-4">
          {!exists && canCreate && (
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#27AE60] py-2.5 text-[11px] font-semibold text-white shadow-md shadow-emerald-100 transition hover:bg-[#219653] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {saving ? "Creating…" : `Create ${preset.title} plan`}
            </button>
          )}

          {exists && editing && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={cancelEdit}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !dirty}
                onClick={save}
                className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-[#27AE60] py-2.5 text-[11px] font-semibold text-white shadow-md shadow-emerald-100 transition hover:bg-[#219653] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}

          {exists && !editing && canUpdate && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#27AE60] py-2.5 text-[11px] font-semibold text-white shadow-md shadow-emerald-100 transition hover:bg-[#219653]"
            >
              <Pencil size={13} />
              Edit plan
            </button>
          )}

          {exists && !editing && plan.isActive && canCreateInvoice && (
            <button
              type="button"
              onClick={() => onCreateInvoice?.(plan)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-[11px] font-medium text-[#219653] hover:bg-emerald-100"
            >
              <UserPlus size={13} />
              Create invoice
            </button>
          )}

          {!canCreate && !canUpdate && (
            <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Eye size={11} /> View only
            </p>
          )}
        </div>
      </div>

      {confirmDelete && (
        <DeletePlanDialog preset={preset} deleting={deleting} onCancel={() => setConfirmDelete(false)} onConfirm={remove} />
      )}
    </article>
  );
}

/** Five fixed subscription cards; each binds to the saved plan with the same code, if any. */
export default function FixedPlanCards({ plans, canCreate, canUpdate, canDelete, canCreateInvoice, onSaved, onCreateInvoice }) {
  const byCode = new Map(plans.map((plan) => [String(plan.code || "").toUpperCase(), plan]));
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {FIXED_PLAN_PRESETS.map((preset) => {
        const plan = byCode.get(preset.code) || null;
        return (
          <FixedPlanCard
            key={`${preset.code}-${plan?._id || "new"}-${plan?.updatedAt || ""}`}
            preset={preset}
            plan={plan}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            canCreateInvoice={canCreateInvoice}
            onSaved={onSaved}
            onCreateInvoice={onCreateInvoice}
          />
        );
      })}
    </div>
  );
}
