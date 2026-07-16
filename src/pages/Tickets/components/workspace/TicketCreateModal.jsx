import { Search, TicketPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { getRequesterRelatedAssets, searchTicketRequesters } from "../../../../features/ticket/ticket_system";
import { TICKET_ASSIGNABLE_ROLES, TICKET_CATEGORY_OPTIONS, TICKET_PRIORITIES, TICKET_SOURCES } from "../../constants/ticketOptions";
import { formatLabel } from "../../utils/ticketFormatters";
import { ghostButton, primaryButton } from "../ticketUi";

const initialForm = {
  title: "",
  description: "",
  requesterName: "",
  requesterEmail: "",
  requesterPhone: "",
  category: "",
  priority: "medium",
  source: "admin",
  propertyId: "",
  dueAt: "",
  tags: "",
};

const MAX_SOURCE_IMAGE_BYTES = 1024 * 1024;
const MAX_ATTACHMENT_PAYLOAD_BYTES = 60 * 1024;
const MAX_TICKET_PAYLOAD_BYTES = 90 * 1024;

const requesterRoles = [
  { label: "All", value: "all" },
  { label: "Users", value: "user" },
  { label: "Builders", value: "builder" },
  { label: "Agents", value: "agent" },
];

const REQUESTER_ROLE_ALIASES = new Set([
  "user",
  "owner",
  "buyer",
  "tenant",
  "propenu_user",
  "builder",
  "agent",
]);

const isAllowedRequester = (user) => {
  const role = String(user?.role || user?.roleName || user?.roleId?.name || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return REQUESTER_ROLE_ALIASES.has(role);
};

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
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeRole, setAssigneeRole] = useState("all");
  const [assigneeResults, setAssigneeResults] = useState([]);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");

  const categoryOptions = useMemo(
    () => mergeCategoryOptions(categories),
    [categories],
  );

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!open) return undefined;
    if (
      selectedRequester &&
      requesterQuery.trim() === getRequesterName(selectedRequester)
    ) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setRequesterLoading(true);
      try {
        const roles = requesterRole === "all" ? ["user", "builder", "agent"] : [requesterRole];
        const requesterGroups = await Promise.all(
          roles.map((role) =>
            searchTicketRequesters({
              query: requesterQuery.trim(),
              role,
              limit: 30,
            }),
          ),
        );
        const seenRequesterIds = new Set();
        const users = requesterGroups
          .flat()
          .filter(isAllowedRequester)
          .filter((user) => {
            const id = user?.userId || user?._id || user?.id || `${user?.email || ""}:${user?.phone || ""}`;
            if (seenRequesterIds.has(id)) return false;
            seenRequesterIds.add(id);
            return true;
          })
          .slice(0, 30);
        setRequesterResults(users);
      } catch (error) {
        setRequesterResults([]);
      } finally {
        setRequesterLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, requesterQuery, requesterRole, selectedRequester]);

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

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(async () => {
      setAssigneeLoading(true);
      try {
        const users = await searchTicketRequesters({
          query: assigneeQuery.trim(),
          role: assigneeRole,
          limit: 20,
        });
        setAssigneeResults(users);
      } catch (error) {
        setAssigneeResults([]);
      } finally {
        setAssigneeLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [assigneeQuery, assigneeRole, open]);

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

  const selectAssignee = (user) => {
    setSelectedAssignee(user);
    setAssigneeQuery(getRequesterName(user));
    setAssigneeResults([]);
  };

  const selectAsset = (assetId) => {
    setSelectedAssetId(assetId);
    update("propertyId", assetId);
  };

  const selectedAsset = relatedAssets.find((item) => item._id === selectedAssetId);
  const visibleRequesterResults = requesterResults.filter(isAllowedRequester);
  const visibleAssigneeResults = assigneeResults.filter((user) => !isAllowedRequester(user));

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
        role: selectedRequester?.role || selectedRequester?.roleName || undefined,
      },
      category: form.category || undefined,
      priority: form.priority,
      source: form.source,
      propertyId: form.propertyId.trim() || undefined,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      assignedTo: selectedAssignee
        ? {
            userId: selectedAssignee.userId || selectedAssignee._id || selectedAssignee.id || undefined,
            name: getRequesterName(selectedAssignee),
            email: selectedAssignee.email || undefined,
            role: selectedAssignee.roleName || selectedAssignee.role || undefined,
          }
        : undefined,
      attachments,
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

    const payloadSize = new Blob([JSON.stringify(payload)]).size;
    if (payloadSize > MAX_TICKET_PAYLOAD_BYTES) {
      setAttachmentError(
        "The ticket is too large to send. Remove an attachment or use a smaller image.",
      );
      return;
    }

    await onSubmit(payload);
    setForm(initialForm);
    setRequesterQuery("");
    setRequesterResults([]);
    setSelectedRequester(null);
    setRelatedAssets([]);
    setSelectedAssetId("");
    setAssigneeQuery("");
    setAssigneeResults([]);
    setSelectedAssignee(null);
    setAttachments([]);
    setAttachmentError("");
    onClose();
  };

  const addAttachment = async (file) => {
    setAttachmentError("");
    const attachment = await buildImageAttachment(file).catch((error) => {
      setAttachmentError(error.message);
      return null;
    });
    if (!attachment) return;
    const nextAttachments = [...attachments, attachment];
    const attachmentPayloadSize = new Blob([JSON.stringify(nextAttachments)]).size;
    if (attachmentPayloadSize > MAX_ATTACHMENT_PAYLOAD_BYTES) {
      setAttachmentError(
        "Attachment limit reached. Remove an existing image or choose a smaller image.",
      );
      return;
    }
    setAttachments(nextAttachments);
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((current) => current.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex h-[100dvh] items-stretch justify-end overflow-hidden bg-slate-950/45 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="flex h-[100dvh] min-h-0 w-full max-w-3xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#27AE60]/20 bg-gradient-to-r from-[#27AE60]/10 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27AE60] text-white shadow-[0_10px_24px_rgba(39,174,96,0.22)]">
              <TicketPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[20px] font-semibold text-slate-950">Create New Ticket</h2>
              <p className="mt-1 text-[12px] font-normal text-slate-500">Add the requester, ticket information, and optional assignee.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-4 md:grid-cols-2">
          <Field label="Title" className="md:col-span-2">
            <input required value={form.title} onChange={(event) => update("title", event.target.value)} className="ticket-input" />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <textarea required rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} className="ticket-input resize-none" />
          </Field>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="mb-3">
              <p className="text-[14px] font-semibold text-slate-900">Requester Details</p>
              <p className="mt-1 text-[12px] font-normal text-slate-500">
                Only users, builders, and agents are shown. Select one to auto-fill the fields, or enter details manually.
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr_140px]">
              <Field label="Search Requester">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={requesterQuery}
                    onChange={(event) => {
                      setRequesterQuery(event.target.value);
                      setSelectedRequester(null);
                    }}
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

            <div className="mt-3 min-h-[130px] max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {requesterLoading && (
                <p className="px-3 py-3 text-[12px] font-medium text-slate-500">Loading requesters...</p>
              )}
              {!requesterLoading && visibleRequesterResults.length === 0 && (
                <p className="px-3 py-3 text-[12px] font-medium text-slate-500">No requester found. You can type details manually below.</p>
              )}
              {!requesterLoading &&
                visibleRequesterResults.map((user) => (
                  <button
                    key={`${user._id || user.userId}-${user.role || user.roleName}`}
                    type="button"
                    onClick={() => selectRequester(user)}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-slate-900">{getRequesterName(user)}</span>
                      <span className="block truncate text-[12px] font-medium text-slate-500">
                        {[user.email, user.phone, getLocation(user)].filter(Boolean).join(" | ")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full border border-[#27AE60]/30 bg-[#27AE60]/10 px-2 py-1 text-[11px] font-medium text-[#27AE60]">
                      {formatLabel(user.role || user.roleName || "user")}
                    </span>
                  </button>
                ))}
            </div>

            {selectedRequester && (
              <div className="mt-3 grid gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-medium text-slate-700 md:grid-cols-4">
                <span className="truncate"><span className="font-medium">Name:</span> {getRequesterName(selectedRequester)}</span>
                <span className="truncate"><span className="font-medium">Email:</span> {selectedRequester.email || "-"}</span>
                <span className="truncate"><span className="font-medium">Phone:</span> {selectedRequester.phone || "-"}</span>
                <span className="truncate"><span className="font-medium">Location:</span> {getLocation(selectedRequester) || "-"}</span>
              </div>
            )}

            <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 md:grid-cols-2">
              <Field label="Requester Name">
                <input required value={form.requesterName} onChange={(event) => update("requesterName", event.target.value)} className="ticket-input" />
              </Field>
              <Field label="Requester Email">
                <input type="email" value={form.requesterEmail} onChange={(event) => update("requesterEmail", event.target.value)} className="ticket-input" />
              </Field>
              <Field label="Requester Phone" className="md:col-span-2">
                <input value={form.requesterPhone} onChange={(event) => update("requesterPhone", event.target.value)} className="ticket-input" />
              </Field>
            </div>
          </div>

          <Field label="Category">
            <select value={form.category} onChange={(event) => update("category", event.target.value)} className="ticket-input">
              <option value="">Select Category</option>
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
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

          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-semibold text-slate-900">Assign Ticket</p>
                <p className="mt-1 text-[12px] font-medium text-slate-500">Optional: select the team member who should receive this ticket.</p>
              </div>
              {selectedAssignee && (
                <span className="rounded-full border border-[#27AE60]/30 bg-white px-2.5 py-1 text-[11px] font-medium text-[#27AE60]">
                  {formatLabel(selectedAssignee.roleName || selectedAssignee.role || "user")}
                </span>
              )}
            </div>
            <div className="grid gap-2 md:grid-cols-[150px_1fr]">
              <Field label="Assignee Role">
                <select
                  value={assigneeRole}
                  onChange={(event) => {
                    setAssigneeRole(event.target.value);
                    setAssigneeQuery("");
                    setAssigneeResults([]);
                    setSelectedAssignee(null);
                  }}
                  className="ticket-input"
                >
                  {TICKET_ASSIGNABLE_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Search Assignee">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={assigneeQuery}
                    onChange={(event) => {
                      setAssigneeQuery(event.target.value);
                      setSelectedAssignee(null);
                    }}
                    placeholder="Name, email, phone"
                    className="ticket-input ticket-search-input"
                  />
                </div>
              </Field>
            </div>
            <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {assigneeLoading && (
                <p className="px-3 py-3 text-[12px] font-medium text-slate-500">Loading assignees...</p>
              )}
              {!assigneeLoading && visibleAssigneeResults.length === 0 && (
                <p className="px-3 py-3 text-[12px] font-medium text-slate-500">Search and select a team member, or leave this ticket unassigned.</p>
              )}
              {!assigneeLoading &&
                visibleAssigneeResults.map((user) => (
                  <button
                    key={`assignee-${user._id || user.userId}-${user.email || user.phone || user.name}`}
                    type="button"
                    onClick={() => selectAssignee(user)}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-slate-900">{getRequesterName(user)}</span>
                      <span className="block truncate text-[12px] font-medium text-slate-500">
                        {[user.email, user.phone].filter(Boolean).join(" | ")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full border border-[#27AE60]/30 bg-[#27AE60]/10 px-2 py-1 text-[11px] font-medium text-[#27AE60]">
                      {formatLabel(user.role || user.roleName || "user")}
                    </span>
                  </button>
                ))}
            </div>
            {selectedAssignee && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[12px] font-medium text-[#17683b]">
                Assigned to: <span className="font-medium">{getRequesterName(selectedAssignee)}</span>
                {selectedAssignee.email ? ` - ${selectedAssignee.email}` : ""}
              </div>
            )}
          </div>

          <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
            <div className="mb-3">
              <p className="text-[14px] font-semibold text-slate-900">Attachments</p>
              <p className="mt-1 text-[12px] font-medium text-slate-500">Images are compressed automatically before the ticket is sent.</p>
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-5 text-center transition hover:bg-emerald-50">
              <span className="text-[13px] font-medium text-[#27AE60]">Choose Image</span>
              <span className="mt-1 text-[12px] font-medium text-slate-500">PNG, JPG, JPEG, WEBP up to 1 MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) addAttachment(file);
                  event.target.value = "";
                }}
              />
            </label>
            {attachmentError && (
              <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
                {attachmentError}
              </p>
            )}
            {attachments.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.url}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-2"
                  >
                    <img src={attachment.url} alt={attachment.name} className="h-12 w-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-700">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="rounded-full px-2 py-1 text-[12px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <button type="button" onClick={onClose} className={ghostButton}>
            Cancel
          </button>
          <button disabled={isSubmitting} className={`${primaryButton} font-medium disabled:opacity-60`}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>

        <style>{`
          .ticket-input {
            width: 100%;
            min-height: 40px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            padding: 9px 12px;
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
            outline: none;
            background: #ffffff;
            transition: border-color 160ms ease, box-shadow 160ms ease;
          }
          .ticket-input:focus {
            border-color: #27AE60;
            box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.12);
          }
          .ticket-search-input {
            padding-left: 38px;
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[12px] font-medium text-slate-600">{label}</span>
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

function mergeCategoryOptions(categories = []) {
  const mapped = categories.map((item) => ({
    label: item.name || formatLabel(item.slug),
    value: item.slug || item.name,
  }));
  const seen = new Set();
  return [...mapped, ...TICKET_CATEGORY_OPTIONS].filter((item) => {
    const key = String(item.value || "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildImageAttachment(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Image must be 1 MB or smaller.");
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.035,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.72,
  });
  const url = await imageCompression.getDataUrlFromFile(compressedFile);

  return {
    url,
    name: file.name.replace(/\.[^.]+$/, ".jpg"),
    mimeType: compressedFile.type || "image/jpeg",
    size: compressedFile.size,
  };
}
