import { Activity, CalendarClock, Eye, Loader2, MessageSquare, Paperclip, Search, Send, UserRound, UserRoundCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LocationFilterBar from "../../../../components/common/LocationFilterBar";
import { getTicketAssigneeRoleOptions, searchTicketAssignees } from "../../../../features/ticket/ticket_system";
import { TICKET_PRIORITIES, TICKET_STATUSES, priorityTone, statusTone } from "../../constants/ticketOptions";
import { formatDateTime, formatDueDate, formatLabel } from "../../utils/ticketFormatters";
import { ghostButton, primaryButton, ticketInput, ticketSurface } from "../ticketUi";

const EMPTY_LOCATION = { state: "", city: "", locality: "", pincode: "" };

export default function TicketDetailPanel({
  ticket,
  isLoading,
  actor,
  actions,
  canAssign = true,
}) {
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [assignee, setAssignee] = useState({
    userId: "",
    name: "",
    email: "",
    role: "customer_care",
    phone: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [assigneeRole, setAssigneeRole] = useState("all");
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeResults, setAssigneeResults] = useState([]);
  const [assigneePool, setAssigneePool] = useState([]);
  const [assigneeLocation, setAssigneeLocation] = useState(EMPTY_LOCATION);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [assigneeRoleOptions, setAssigneeRoleOptions] = useState([{ label: "All Roles", value: "all" }]);
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [showCommentAttachmentTools, setShowCommentAttachmentTools] = useState(false);
  const [commentAttachmentError, setCommentAttachmentError] = useState("");
  const [ticketAttachment, setTicketAttachment] = useState(null);
  const [ticketAttachmentError, setTicketAttachmentError] = useState("");

  const publicComments = useMemo(
    () => (ticket?.comments || []).filter((item) => item.visibility !== "internal"),
    [ticket],
  );
  const internalComments = useMemo(
    () => (ticket?.comments || []).filter((item) => item.visibility === "internal"),
    [ticket],
  );

  useEffect(() => {
    const assignedRole = normalizeRoleValue(ticket?.assignedTo?.role) || "customer_care";
    setAssignee({
      userId: ticket?.assignedTo?.userId || "",
      name: ticket?.assignedTo?.name || "",
      email: ticket?.assignedTo?.email || "",
      role: assignedRole,
      phone: "",
      locality: "",
      city: "",
      state: "",
      pincode: "",
    });
    setAssigneeRole(normalizeRoleValue(ticket?.assignedTo?.role) || "all");
    setAssigneeQuery("");
    setAssigneeResults([]);
    setAssigneeLocation(EMPTY_LOCATION);
    setCommentAttachments([]);
    setShowCommentAttachmentTools(false);
    setCommentAttachmentError("");
    setTicketAttachment(null);
    setTicketAttachmentError("");
  }, [ticket?._id, ticket?.assignedTo?.userId]);

  useEffect(() => {
    if (!canAssign) return undefined;
    let active = true;

    getTicketAssigneeRoleOptions()
      .then((options) => {
        if (active) setAssigneeRoleOptions(options);
      })
      .catch(() => {
        if (active) setAssigneeRoleOptions([{ label: "All Roles", value: "all" }]);
      });

    searchTicketAssignees({ query: "", role: "all", limit: 500 })
      .then((users) => {
        if (active) setAssigneePool(users);
      })
      .catch(() => {
        if (active) setAssigneePool([]);
      });

    return () => {
      active = false;
    };
  }, [canAssign]);

  useEffect(() => {
    if (!canAssign) return undefined;

    const timer = window.setTimeout(async () => {
      setAssigneeLoading(true);
      try {
        const users = await searchTicketAssignees({
          query: assigneeQuery.trim(),
          role: assigneeRole,
          limit: 50,
          state: assigneeLocation.state,
          city: assigneeLocation.city,
          locality: assigneeLocation.locality,
          pincode: assigneeLocation.pincode,
        });
        setAssigneeResults(users);
      } catch (error) {
        setAssigneeResults([]);
      } finally {
        setAssigneeLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [assigneeQuery, assigneeRole, assigneeLocation, canAssign]);

  const locationFilterUsers = useMemo(() => {
    if (!assigneeRole || assigneeRole === "all") return assigneePool;
    return assigneePool.filter(
      (user) => normalizeRoleValue(user.role || user.roleName) === String(assigneeRole).toLowerCase(),
    );
  }, [assigneePool, assigneeRole]);

  const assigneeLocationLabel = useMemo(
    () => formatLocation(assignee),
    [assignee.locality, assignee.city, assignee.state, assignee.pincode],
  );

  if (isLoading) {
    return <section className={`${ticketSurface} p-6 text-[12px] font-semibold text-slate-500`}>Loading ticket detail...</section>;
  }

  if (!ticket) {
    return <section className={`${ticketSurface} p-6 text-[12px] font-semibold text-slate-500`}>Select a ticket to inspect, reply, and update workflow.</section>;
  }

  const submitComment = async () => {
    if (!comment.trim() && commentAttachments.length === 0) return;
    await actions.addComment.mutateAsync({
      id: ticket._id,
      payload: {
        message: comment.trim() || "Attachment added",
        visibility,
        author: actor,
        attachments: commentAttachments,
      },
    });
    setComment("");
    setCommentAttachments([]);
    setShowCommentAttachmentTools(false);
    setCommentAttachmentError("");
  };

  const addCommentAttachment = async (file) => {
    setCommentAttachmentError("");
    const attachment = await buildImageAttachment(file).catch((error) => {
      setCommentAttachmentError(error.message);
      return null;
    });
    if (!attachment) return;
    setCommentAttachments((current) => [...current, attachment]);
  };

  const removeCommentAttachment = (indexToRemove) => {
    setCommentAttachments((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const submitTicketAttachment = async () => {
    if (!ticketAttachment) return;
    await actions.createAttachment.mutateAsync({
      ticketId: ticket._id,
      payload: {
        ...ticketAttachment,
        uploadedBy: actor,
        scanStatus: "pending",
      },
    });
    setTicketAttachment(null);
    setTicketAttachmentError("");
  };

  const selectTicketAttachment = async (file) => {
    setTicketAttachmentError("");
    const attachment = await buildImageAttachment(file).catch((error) => {
      setTicketAttachmentError(error.message);
      return null;
    });
    if (attachment) setTicketAttachment(attachment);
  };

  const submitAssignment = async () => {
    if (!assignee.name.trim()) return;
    const role = normalizeRoleValue(assignee.role);
    await actions.assignTicket.mutateAsync({
      id: ticket._id,
      payload: {
        assignedTo: {
          userId: assignee.userId.trim() || undefined,
          name: assignee.name.trim(),
          email: assignee.email.trim() || undefined,
          role: role || undefined,
        },
        actor,
      },
    });
  };

  const selectAssignee = (user) => {
    const role = normalizeRoleValue(user.roleName || user.role || assigneeRole);
    setAssignee({
      userId: String(user.userId || user._id || user.id || ""),
      name: getUserDisplayName(user),
      email: user.email || "",
      role: role === "all" ? "" : role,
      phone: user.phone || "",
      locality: user.locality || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
    });
    setAssigneeQuery(getUserDisplayName(user));
  };

  return (
    <section className={`flex h-full min-w-0 max-w-full flex-col ${ticketSurface}`}>
      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {ticket._id}
            </p>
            <h2 className="mt-1 line-clamp-2 text-[18px] font-black leading-snug text-slate-950">
              {ticket.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityTone[ticket.priority] || priorityTone.medium}`}>
              {formatLabel(ticket.priority)}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusTone[ticket.status] || statusTone.open}`}>
              {formatLabel(ticket.status)}
            </span>
          </div>
        </div>
        <p className="mt-3 text-[13px] font-medium leading-6 text-slate-600">{ticket.description}</p>
      </div>

      <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-2">
        <Info icon={UserRound} label="Requester" value={ticket.requester?.name || "-"} sub={ticket.requester?.email || ticket.requester?.phone} />
        <Info icon={CalendarClock} label="Due Date" value={formatDueDate(ticket.dueAt)} sub={`Created ${formatDateTime(ticket.createdAt)}`} />
      </div>

      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-3">
        <ActionSelect
          label="Status"
          value={ticket.status}
          options={TICKET_STATUSES}
          disabled={actions.changeStatus.isPending}
          onChange={(status) =>
            actions.changeStatus.mutate({
              id: ticket._id,
              payload: { status, actor, reason: "Updated from admin ticket desk" },
            })
          }
        />
        <ActionSelect
          label="Priority"
          value={ticket.priority}
          options={TICKET_PRIORITIES}
          disabled={actions.changePriority.isPending}
          onChange={(priority) =>
            actions.changePriority.mutate({
              id: ticket._id,
              payload: { priority, actor, reason: "Updated from admin ticket desk" },
            })
          }
        />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Assigned To</p>
          <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-700">
            {ticket.assignedTo?.name || "Unassigned"}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 flex-1 items-start gap-4 p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between gap-2">
            <h3 className="inline-flex items-center gap-2 text-[14px] font-black text-slate-950">
              <MessageSquare className="h-4 w-4 text-[#27AE60]" />
              Conversation
            </h3>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold outline-none focus:border-[#27AE60]"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </div>

          <div className="mt-3 space-y-2">
            {[...publicComments, ...internalComments].length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-[12px] font-medium text-slate-500">No comments yet.</p>
            ) : (
              [...publicComments, ...internalComments].map((item) => (
                <article key={item._id || `${item.createdAt}-${item.message}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="text-[12px] font-bold text-slate-900">{item.author?.name || "Team"}</p>
                    <span className="text-[11px] font-medium text-slate-400">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-slate-600">{item.message}</p>
                  {item.attachments?.length > 0 && (
                    <AttachmentList attachments={item.attachments} className="mt-3" />
                  )}
                  {item.visibility === "internal" && (
                    <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      Internal note
                    </span>
                  )}
                </article>
              ))
            )}
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={visibility === "internal" ? "Write an internal note" : "Write a public reply"}
              rows={4}
              className="w-full resize-none border-0 bg-transparent p-1 text-[12px] font-medium outline-none placeholder:text-slate-400"
            />
            {showCommentAttachmentTools && (
              <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-4 text-center transition hover:bg-emerald-50">
                  <span className="text-[13px] font-black text-[#219653]">Choose Image</span>
                  <span className="mt-1 text-[12px] font-medium text-slate-500">Image only, below 1 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) addCommentAttachment(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {commentAttachmentError && (
                  <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
                    {commentAttachmentError}
                  </p>
                )}
              </div>
            )}
            {commentAttachments.length > 0 && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {commentAttachments.map((attachment, index) => (
                  <div
                    key={`${attachment.url}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-2"
                  >
                    <img src={attachment.url} alt={attachment.name} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-[#17683b]">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => removeCommentAttachment(index)}
                      className="rounded-full px-2 py-1 text-[12px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCommentAttachmentTools((current) => !current)}
                className={ghostButton}
              >
                <Paperclip className="h-3.5 w-3.5" />
                {showCommentAttachmentTools ? "Hide Attachment" : "Attach"}
              </button>
              <button
                type="button"
                onClick={submitComment}
                disabled={actions.addComment.isPending || (!comment.trim() && commentAttachments.length === 0)}
                className={`${primaryButton} h-9 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <Send className="h-3 w-3" />
                Send
              </button>
            </div>
          </div>
        </div>

        <aside className="min-w-0 space-y-3">
          <Panel title="Raised / Handler" icon={UserRoundCheck}>
            <Detail label="Raised By" value={ticket.requester?.name || "-"} />
            <Detail label="Raised Email" value={ticket.requester?.email || "-"} />
            <Detail label="Handler" value={ticket.assignedTo?.name || "Unassigned"} />
            {canAssign ? (
              <div className="mt-1 space-y-2">
                <select
                  value={assigneeRole}
                  onChange={(event) => {
                    setAssigneeRole(event.target.value);
                    setAssigneeQuery("");
                    setAssigneeLocation(EMPTY_LOCATION);
                  }}
                  className={`${ticketInput} w-full`}
                >
                  {assigneeRoleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <LocationFilterBar
                  users={locationFilterUsers}
                  filters={assigneeLocation}
                  setFilters={setAssigneeLocation}
                  columns={2}
                  className="!p-2.5"
                />

                <div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    {assigneeLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                    )}
                    <input
                      value={assigneeQuery}
                      onChange={(event) => setAssigneeQuery(event.target.value)}
                      placeholder="Search by name, email, phone, location"
                      className={`${ticketInput} w-full px-9`}
                    />
                  </div>
                  <div className="mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    {assigneeLoading && (
                      <p className="px-3 py-3 text-[12px] font-medium text-slate-500">Loading team members...</p>
                    )}
                    {!assigneeLoading && assigneeResults.length === 0 && (
                      <p className="px-3 py-3 text-[12px] font-medium text-slate-500">
                        No users found for this role/location. Try another filter or search.
                      </p>
                    )}
                    {!assigneeLoading &&
                      assigneeResults.map((user) => {
                        const userId = String(user.userId || user._id || user.id || "");
                        const isSelected = Boolean(assignee.userId) && assignee.userId === userId;
                        const location = formatLocation(user);
                        return (
                          <button
                            key={`${userId}-${user.email || user.phone || user.name}`}
                            type="button"
                            onClick={() => selectAssignee(user)}
                            className={`block w-full border-b border-slate-50 px-3 py-2 text-left last:border-b-0 ${
                              isSelected ? "bg-emerald-50" : "hover:bg-emerald-50"
                            }`}
                          >
                            <span className="block truncate text-[12px] font-bold text-slate-900">
                              {getUserDisplayName(user)}
                              {isSelected ? " · Selected" : ""}
                            </span>
                            <span className="block truncate text-[11px] font-medium text-slate-500">
                              {formatLabel(user.roleName || user.role || "user")}
                              {user.email ? ` · ${user.email}` : ""}
                              {user.phone ? ` · ${user.phone}` : ""}
                            </span>
                            {location ? (
                              <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">
                                {location}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                  </div>
                </div>
                {assignee.name && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-medium text-[#17683b]">
                    <p>
                      Assigning to <span className="font-semibold">{assignee.name}</span>
                      {assignee.role ? ` · ${formatLabel(assignee.role)}` : ""}
                      {!assignee.userId ? " · missing user ID" : ""}
                    </p>
                    {(assignee.email || assignee.phone) && (
                      <p className="mt-0.5 text-[11px] text-emerald-800/80">
                        {[assignee.email, assignee.phone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {assigneeLocationLabel ? (
                      <p className="mt-0.5 text-[11px] text-emerald-800/80">{assigneeLocationLabel}</p>
                    ) : null}
                  </div>
                )}
                <button
                  type="button"
                  onClick={submitAssignment}
                  disabled={actions.assignTicket.isPending || !assignee.name.trim() || !assignee.userId}
                  className={`${primaryButton} w-full disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {actions.assignTicket.isPending ? "Assigning..." : "Assign Ticket"}
                </button>
              </div>
            ) : (
              <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-medium text-[#17683b]">
                This ticket is assigned to you. Assignment changes are managed by the ticket desk.
              </p>
            )}
          </Panel>

          <Panel title="Details">
            <Detail label="Category" value={formatLabel(ticket.category)} />
            <Detail label="Property" value={ticket.propertyId || "-"} />
            <Detail label="Asset Type" value={formatLabel(ticket.metadata?.relatedAsset?.category)} />
            <Detail label="Asset Name" value={ticket.metadata?.relatedAsset?.title || "-"} />
            <Detail label="Location" value={formatLocation(ticket.metadata?.relatedAsset || ticket.metadata?.requesterLocation)} />
            <Detail label="Source" value={formatLabel(ticket.source)} />
          </Panel>

          <Panel title="Activity" icon={Activity}>
            <div className="space-y-1 pr-0.5">
              {(ticket.activities || []).length === 0 ? (
                <p className="text-[10px] text-slate-500">No activity yet</p>
              ) : (
                ticket.activities.slice(-6).reverse().map((item, index) => (
                  <div key={`${item.action}-${item.createdAt}-${index}`} className="rounded bg-slate-50 px-1.5 py-1">
                    <p className="text-[10px] font-medium text-slate-900">{formatLabel(item.action)}</p>
                    <p className="text-[9px] text-slate-500">
                      {item.actor?.name || "System"} - {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Attachments" icon={Paperclip}>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2">
              <div className="space-y-2">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white px-3 py-4 text-center transition hover:bg-emerald-50">
                  <span className="text-[13px] font-black text-[#219653]">Choose Image</span>
                  <span className="mt-1 text-[12px] font-medium text-slate-500">Image only, below 1 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) selectTicketAttachment(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {ticketAttachment && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-2">
                    <img src={ticketAttachment.url} alt={ticketAttachment.name} className="h-12 w-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-slate-700">{ticketAttachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setTicketAttachment(null)}
                      className="rounded-full px-2 py-1 text-[12px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      x
                    </button>
                  </div>
                )}
                {ticketAttachmentError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
                    {ticketAttachmentError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={submitTicketAttachment}
                  disabled={actions.createAttachment?.isPending || !ticketAttachment}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-3 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(39,174,96,0.18)] transition hover:bg-[#219653] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {actions.createAttachment?.isPending ? "Adding..." : "Add Attachment"}
                </button>
              </div>
            </div>
            {(ticket.attachments || []).length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-[12px] font-medium text-slate-500">No attachments</p>
            ) : (
              <AttachmentList attachments={ticket.attachments} />
            )}
          </Panel>
        </aside>
      </div>
    </section>
  );
}

function getUserDisplayName(user) {
  return user?.name || user?.companyName || user?.email || user?.phone || "Unnamed user";
}

function normalizeRoleValue(role) {
  if (!role) return "";
  if (typeof role === "object") {
    return String(role.name || role.label || role.value || "")
      .trim()
      .toLowerCase();
  }
  return String(role).trim().toLowerCase();
}

function AttachmentList({ attachments = [], className = "" }) {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!previewImage) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewImage]);

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {attachments.map((item, index) =>
          isImageAttachment(item) ? (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setPreviewImage(item)}
              className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-2 text-left text-[12px] font-medium text-[#27AE60] transition hover:border-[#27AE60]/30 hover:bg-[#27AE60]/5"
            >
              <img
                src={item.url}
                alt={item.name || "Attachment"}
                className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-cover"
              />
              <span className="min-w-0 flex-1 truncate">{item.name || "Image attachment"}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#27AE60]/10 text-[#27AE60] transition group-hover:bg-[#27AE60] group-hover:text-white">
                <Eye className="h-4 w-4" />
              </span>
            </button>
          ) : (
            <a
              key={`${item.url}-${index}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[12px] font-medium text-[#27AE60] transition hover:border-[#27AE60]/30 hover:bg-[#27AE60]/5"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.name || "Attachment"}</span>
            </a>
          ),
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image attachment preview"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <p className="min-w-0 truncate text-[14px] font-medium text-slate-900">
                {previewImage.name || "Image attachment"}
              </p>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3">
              <img
                src={previewImage.url}
                alt={previewImage.name || "Attachment preview"}
                className="max-h-[calc(92dvh-76px)] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#27AE60] shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-[13px] font-bold text-slate-900">{value}</p>
        {sub && <p className="truncate text-[12px] font-medium text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

function ActionSelect({ label, value, options, onChange, disabled }) {
  return (
    <label>
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold outline-none transition focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10 disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}>
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-black text-slate-950">
        {Icon && <Icon className="h-4 w-4 text-[#27AE60]" />}
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-2 text-[12px]">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="min-w-0 break-words text-right font-bold text-slate-900">{value || "-"}</span>
    </div>
  );
}

function formatLocation(item) {
  return [item?.locality, item?.city, item?.state, item?.pincode].filter(Boolean).join(", ");
}

function isImageAttachment(item) {
  return item?.mimeType?.startsWith("image/") || String(item?.url || "").startsWith("data:image/");
}

function buildImageAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Only image files are allowed."));
      return;
    }
    if (file.size > 1024 * 1024) {
      reject(new Error("Image must be below 1 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        url: reader.result,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      });
    reader.onerror = () => reject(new Error("Unable to read image. Please try again."));
    reader.readAsDataURL(file);
  });
}
