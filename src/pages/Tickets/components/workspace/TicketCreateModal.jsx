import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getRequesterRelatedAssets, searchTicketRequesters } from "../../../../features/ticket/ticket_system";
import { TICKET_PRIORITIES, TICKET_SOURCES } from "../../constants/ticketOptions";
import { formatLabel } from "../../utils/ticketFormatters";

const initialForm = {
  title: "",
  description: "",
  requesterName: "",
  requesterEmail: "",
  requesterPhone: "",
  department: "support",
  category: "",
  priority: "medium",
  source: "admin",
  propertyId: "",
  dueAt: "",
  tags: "",
};

const requesterRoles = [
  { label: "All", value: "all" },
  { label: "Users", value: "user" },
  { label: "Builders", value: "builder" },
  { label: "Agents", value: "agent" },
];

export default function TicketCreateModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  departments = [],
  categories = [],
  currentUser,
}) {
  const [form, setForm] = useState(initialForm);
  const [requesterQuery, setRequesterQuery] = useState("");
  const [requesterRole, setRequesterRole] = useState("all");
  const [requesterResults, setRequesterResults] = useState([]);
  const [requesterLoading, setRequesterLoading] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState(null);
  const [relatedAssets, setRelatedAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const categoryOptions = useMemo(
    () =>
      categories.filter(
        (item) => !form.department || !item.department || item.department === form.department,
      ),
    [categories, form.department],
  );

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(async () => {
      setRequesterLoading(true);
      try {
        const users = await searchTicketRequesters({
          query: requesterQuery.trim(),
          role: requesterRole,
          limit: 30,
        });
        setRequesterResults(users);
      } catch (error) {
        setRequesterResults([]);
      } finally {
        setRequesterLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, requesterQuery, requesterRole]);

  useEffect(() => {
    if (!open || !selectedRequester) {
      setRelatedAssets([]);
      setSelectedAssetId("");
      return undefined;
    }

    let active = true;
    setAssetsLoading(true);
    getRequesterRelatedAssets(selectedRequester)
      .then((items) => {
        if (!active) return;
        setRelatedAssets(items);
        const first = items[0];
        if (first?._id) {
          setSelectedAssetId(first._id);
          setForm((current) => ({ ...current, propertyId: first._id }));
        }
      })
      .catch(() => {
        if (active) setRelatedAssets([]);
      })
      .finally(() => {
        if (active) setAssetsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, selectedRequester]);

  const selectRequester = (user) => {
    setSelectedRequester(user);
    setRequesterQuery(getRequesterName(user));
    setRequesterResults([]);
    setForm((current) => ({
      ...current,
      requesterName: getRequesterName(user),
      requesterEmail: user.email || "",
      requesterPhone: user.phone || "",
    }));
  };

  const selectAsset = (assetId) => {
    setSelectedAssetId(assetId);
    update("propertyId", assetId);
  };

  const selectedAsset = relatedAssets.find((item) => item._id === selectedAssetId);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      requester: {
        userId: selectedRequester?.userId || selectedRequester?._id || selectedRequester?.id || undefined,
        name: form.requesterName.trim(),
        email: form.requesterEmail.trim() || undefined,
        phone: form.requesterPhone.trim() || undefined,
      },
      department: form.department || undefined,
      category: form.category || undefined,
      priority: form.priority,
      source: form.source,
      propertyId: form.propertyId.trim() || undefined,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      metadata: {
        createdFrom: "admin-ticket-desk",
        createdByRole: currentUser?.roleName,
        requesterRole: selectedRequester?.role || selectedRequester?.roleName,
        requesterLocation: selectedRequester
          ? {
              locality: selectedRequester.locality,
              city: selectedRequester.city,
              state: selectedRequester.state,
              pincode: selectedRequester.pincode,
            }
          : undefined,
        relatedAsset: selectedAsset
          ? {
              id: selectedAsset._id,
              type: selectedAsset.ticketAssetType,
              category: selectedAsset.ticketAssetCategory,
              title: getAssetTitle(selectedAsset),
              locality: selectedAsset.locality,
              city: selectedAsset.city,
              state: selectedAsset.state,
              pincode: selectedAsset.pincode,
            }
          : undefined,
      },
    };

    await onSubmit(payload);
    setForm(initialForm);
    setRequesterQuery("");
    setRequesterResults([]);
    setSelectedRequester(null);
    setRelatedAssets([]);
    setSelectedAssetId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 p-3">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <div>
            <h2 className="text-base font-medium text-slate-950">New Ticket</h2>
            <p className="text-[12px] text-slate-500">Create a support ticket using backend-ready payload fields.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2 p-3 md:grid-cols-2">
          <Field label="Title" className="md:col-span-2">
            <input required value={form.title} onChange={(event) => update("title", event.target.value)} className="ticket-input" />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <textarea required rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} className="ticket-input resize-none" />
          </Field>

          <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-2">
            <div className="grid gap-2 md:grid-cols-[1fr_140px]">
              <Field label="Search Requester">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={requesterQuery}
                    onChange={(event) => setRequesterQuery(event.target.value)}
                    placeholder="Name, email, phone, locality, state, pincode"
                    className="ticket-input ticket-search-input"
                  />
                </div>
              </Field>
              <Field label="Requester Type">
                <select value={requesterRole} onChange={(event) => setRequesterRole(event.target.value)} className="ticket-input">
                  {requesterRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-1 min-h-[118px] max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-white">
              {requesterLoading && (
                <p className="px-2 py-2 text-[11px] text-slate-500">Loading requesters...</p>
              )}
              {!requesterLoading && requesterResults.length === 0 && (
                <p className="px-2 py-2 text-[11px] text-slate-500">No requester found. You can type details manually below.</p>
              )}
              {!requesterLoading &&
                requesterResults.map((user) => (
                  <button
                    key={`${user._id || user.userId}-${user.role || user.roleName}`}
                    type="button"
                    onClick={() => selectRequester(user)}
                    className="flex w-full items-center justify-between gap-2 border-b border-slate-100 px-2 py-1.5 text-left last:border-b-0 hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium text-slate-900">{getRequesterName(user)}</span>
                      <span className="block truncate text-[10px] text-slate-500">
                        {[user.email, user.phone, getLocation(user)].filter(Boolean).join(" | ")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">
                      {formatLabel(user.role || user.roleName || "user")}
                    </span>
                  </button>
                ))}
            </div>

            {selectedRequester && (
              <div className="mt-1 grid gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-[10px] text-slate-700 md:grid-cols-4">
                <span className="truncate"><b>Name:</b> {getRequesterName(selectedRequester)}</span>
                <span className="truncate"><b>Email:</b> {selectedRequester.email || "-"}</span>
                <span className="truncate"><b>Phone:</b> {selectedRequester.phone || "-"}</span>
                <span className="truncate"><b>Location:</b> {getLocation(selectedRequester) || "-"}</span>
              </div>
            )}
          </div>

          <Field label="Requester Name">
            <input required value={form.requesterName} onChange={(event) => update("requesterName", event.target.value)} className="ticket-input" />
          </Field>
          <Field label="Requester Email">
            <input type="email" value={form.requesterEmail} onChange={(event) => update("requesterEmail", event.target.value)} className="ticket-input" />
          </Field>
          <Field label="Requester Phone">
            <input value={form.requesterPhone} onChange={(event) => update("requesterPhone", event.target.value)} className="ticket-input" />
          </Field>
          <Field label="Department">
            <select value={form.department} onChange={(event) => update("department", event.target.value)} className="ticket-input">
              <option value="">No department</option>
              {departments.length === 0 && <option value="support">Support</option>}
              {departments.map((item) => (
                <option key={item._id || item.slug} value={item.slug || item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(event) => update("category", event.target.value)} className="ticket-input">
              <option value="">General</option>
              {categoryOptions.map((item) => (
                <option key={item._id || item.slug} value={item.slug || item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(event) => update("priority", event.target.value)} className="ticket-input">
              {TICKET_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {formatLabel(priority)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select value={form.source} onChange={(event) => update("source", event.target.value)} className="ticket-input">
              {TICKET_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {formatLabel(source)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Related Property / Project">
            <select
              value={selectedAssetId}
              onChange={(event) => selectAsset(event.target.value)}
              className="ticket-input"
              disabled={assetsLoading || relatedAssets.length === 0}
            >
              <option value="">{assetsLoading ? "Loading assets" : "Manual / no linked asset"}</option>
              {relatedAssets.map((asset) => (
                <option key={`${asset.ticketAssetCategory}-${asset._id}`} value={asset._id}>
                  {formatLabel(asset.ticketAssetCategory)} - {getAssetTitle(asset)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Property / Project ID">
            <input value={form.propertyId} onChange={(event) => update("propertyId", event.target.value)} className="ticket-input" />
          </Field>
          <Field label="Due At">
            <input type="datetime-local" value={form.dueAt} onChange={(event) => update("dueAt", event.target.value)} className="ticket-input" />
          </Field>
          <Field label="Tags" className="md:col-span-2">
            <input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="support, owner-contact" className="ticket-input" />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-3 py-2">
          <button type="button" onClick={onClose} className="h-8 rounded-md border border-slate-200 px-3 text-[12px] font-medium text-slate-700">
            Cancel
          </button>
          <button disabled={isSubmitting} className="h-8 rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white disabled:opacity-60">
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>

        <style>{`
          .ticket-input {
            width: 100%;
            min-height: 32px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            font-size: 12px;
            color: #0f172a;
            outline: none;
          }
          .ticket-input:focus {
            border-color: #34d399;
            box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.14);
          }
          .ticket-search-input {
            padding-left: 34px;
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={className}>
      <span className="mb-1 block text-[11px] font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function getRequesterName(user) {
  return user?.name || user?.companyName || user?.email || user?.phone || "";
}

function getLocation(item) {
  return [item?.locality, item?.city, item?.state, item?.pincode].filter(Boolean).join(", ");
}

function getAssetTitle(asset) {
  return (
    asset?.title ||
    asset?.projectName ||
    asset?.propertyName ||
    asset?.name ||
    asset?.propertyCode ||
    [asset?.bhk, asset?.propertyType, asset?.listingType, asset?.locality || asset?.city].filter(Boolean).join(" ") ||
    asset?._id ||
    "Linked asset"
  );
}
