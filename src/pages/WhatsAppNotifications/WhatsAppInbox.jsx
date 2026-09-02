import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Expand,
  Filter,
  Loader2,
  MessageCircle,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Smile,
  UserRound,
  X,
} from "lucide-react";
import {
  getWhatsAppInboxAssignableRoles,
  getWhatsAppInboxConversations,
  getWhatsAppInboxHealth,
  getWhatsAppInboxMessages,
  markWhatsAppInboxRead,
  searchWhatsAppInboxAssignableAgents,
  sendWhatsAppInboxMessage,
  startWhatsAppInboxConversation,
  subscribeWhatsAppInboxStream,
  updateWhatsAppInboxConversation,
} from "../../features/user/userService";
import { useCurrentUser } from "../../store/properties/useCurrentUser";

const STATUS_META = {
  new: {
    label: "New",
    chip: "bg-gray-100 text-gray-700 border-gray-200",
    select: "border-sky-200 text-sky-700 bg-sky-50",
  },
  waiting: {
    label: "Waiting",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    select: "border-amber-200 text-amber-700 bg-amber-50",
  },
  resolved: {
    label: "Resolved",
    chip: "bg-gray-100 text-slate-600 border-gray-200",
    select: "border-emerald-200 text-emerald-700 bg-emerald-50",
  },
};

const INBOX_ASSIGNER_ROLES = new Set([
  "super_admin",
  "admin",
  "operations_head",
  "operation_head",
  "customer_support_head",
  "business_development_head",
]);

const FALLBACK_ROLE_COLOR = {
  bg: "#F8FAFC",
  text: "#334155",
  border: "#CBD5E1",
  accent: "#64748B",
};

const normalizeRole = (role = "") =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const canAssignInboxAgent = (user) =>
  INBOX_ASSIGNER_ROLES.has(
    normalizeRole(user?.roleName || user?.role || user?.roleId?.name),
  );

const getCurrentUserId = (user) =>
  String(user?.id || user?._id || user?.userId || user?.sub || "").trim();

const ChevronDown = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const formatChatStamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = date.toLocaleString([], { month: "short" });
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${month}, ${time}`;
};

const formatListTime = (value) => formatChatStamp(value);

const formatBubbleTime = (value) => formatChatStamp(value);

const formatDay = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (sameDay) return "Today";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StatusTicks = ({ status, error }) => {
  if (status === "read") return <CheckCheck size={14} className="text-[#53bdeb]" />;
  if (status === "delivered" || status === "sent") {
    return (
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-400 text-gray-500">
        <Check size={9} strokeWidth={3} />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        className="text-[10px] text-red-500 font-semibold max-w-[180px] truncate"
        title={error || "Failed to send"}
      >
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400">
      <Check size={9} strokeWidth={3} />
    </span>
  );
};

const Avatar = ({ size = "md" }) => {
  const cls =
    size === "lg"
      ? "w-11 h-11"
      : size === "sm"
        ? "w-8 h-8"
        : "w-10 h-10";
  return (
    <div
      className={`${cls} rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm`}
    >
      <UserRound size={size === "sm" ? 14 : 18} />
    </div>
  );
};

export default function WhatsAppInbox() {
  const { data: currentUserPayload } = useCurrentUser();
  const currentUser = currentUserPayload?.user || currentUserPayload;
  const meId = getCurrentUserId(currentUser);
  const canAssign = canAssignInboxAgent(currentUser);
  const seesAllChats = canAssign;

  const [conversations, setConversations] = useState([]);
  const [inboxScope, setInboxScope] = useState(seesAllChats ? "all" : "assigned");
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeWaId, setActiveWaId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [agentRoleFilter, setAgentRoleFilter] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [agentQuery, setAgentQuery] = useState("");
  const [agentResults, setAgentResults] = useState([]);
  const [agentSearching, setAgentSearching] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [updatingMeta, setUpdatingMeta] = useState(false);
  const [health, setHealth] = useState(null);
  const [liveStatus, setLiveStatus] = useState("connecting");
  const bottomRef = useRef(null);
  const activeWaIdRef = useRef(null);
  const searchRef = useRef(search);
  const agentSearchSeq = useRef(0);
  const rolePickerRef = useRef(null);

  useEffect(() => {
    activeWaIdRef.current = activeWaId;
  }, [activeWaId]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const loadConversations = useCallback(async (q = search, { silent = false } = {}) => {
    try {
      if (!silent) setLoadingList(true);
      setError("");
      const res = await getWhatsAppInboxConversations({
        q,
        limit: 80,
      });
      const list = res?.data?.data || res?.data || [];
      const next = Array.isArray(list) ? list : [];
      setConversations(next);
      const scope = res?.data?.meta?.scope;
      if (scope === "all" || scope === "assigned") setInboxScope(scope);
      setActiveWaId((current) => {
        if (!current) return current;
        if (next.some((c) => c.waId === current)) return current;
        setActiveConversation(null);
        setMessages([]);
        return null;
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load chats",
      );
      if (!silent) setConversations([]);
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, [search]);

  const loadMessages = useCallback(async (waId, { silent = false } = {}) => {
    if (!waId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const res = await getWhatsAppInboxMessages(waId, { limit: 150 });
      const payload = res?.data?.data || res?.data || {};
      setMessages(Array.isArray(payload.messages) ? payload.messages : []);
      setActiveConversation(payload.conversation || null);
      await markWhatsAppInboxRead(waId).catch(() => null);
      setConversations((prev) =>
        prev.map((c) => (c.waId === waId ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (err) {
      if (!silent) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load messages",
        );
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      const res = await getWhatsAppInboxHealth();
      setHealth(res?.data?.data || res?.data || null);
    } catch (err) {
      setHealth({
        ok: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Could not reach WhatsApp Cloud API",
      });
    }
  }, []);

  useEffect(() => {
    loadConversations("");
    refreshHealth();
  }, []);

  // Real-time: Meta webhook → Mongo → SSE → dashboard
  useEffect(() => {
    let closed = false;
    let controller = null;
    let retryTimer = null;

    const connect = () => {
      if (closed) return;
      controller?.abort();
      controller = new AbortController();
      setLiveStatus((s) => (s === "live" ? s : "connecting"));
      subscribeWhatsAppInboxStream({
        signal: controller.signal,
        onConnected: () => setLiveStatus("live"),
        onEvent: (event) => {
          const waId = event?.waId;
          loadConversations(searchRef.current, { silent: true });
          if (waId && waId === activeWaIdRef.current) {
            loadMessages(waId, { silent: true });
          }
        },
        onError: () => {
          if (closed) return;
          setLiveStatus("reconnect");
          retryTimer = window.setTimeout(connect, 4000);
        },
      });
    };

    connect();

    const fallback = window.setInterval(() => {
      loadConversations(searchRef.current, { silent: true });
      if (activeWaIdRef.current) {
        loadMessages(activeWaIdRef.current, { silent: true });
      }
    }, 45000);

    return () => {
      closed = true;
      controller?.abort();
      if (retryTimer) window.clearTimeout(retryTimer);
      window.clearInterval(fallback);
    };
  }, [loadConversations, loadMessages]);

  useEffect(() => {
    if (!activeWaId) return;
    loadMessages(activeWaId);
  }, [activeWaId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const status = c.inboxStatus || "new";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      const name = String(c.profileName || "").toLowerCase();
      const phone = String(c.waId || "").toLowerCase();
      const preview = String(c.lastMessagePreview || "").toLowerCase();
      const agent = String(c.assignedAgentName || "").toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(q) ||
        preview.includes(q) ||
        agent.includes(q)
      );
    });
  }, [conversations, search, statusFilter]);

  const filteredRoleOptions = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roleOptions;
    return roleOptions.filter((role) => {
      const label = String(role.label || "").toLowerCase();
      const value = String(role.value || "").toLowerCase();
      return (
        label.includes(q) ||
        value.includes(q) ||
        value.replace(/_/g, " ").includes(q)
      );
    });
  }, [roleOptions, roleSearch]);

  useEffect(() => {
    setAgentQuery("");
    setAgentRoleFilter("");
    setRoleSearch("");
    setShowRoleDropdown(false);
    setAgentResults([]);
    setShowAgentDropdown(false);
  }, [activeWaId]);

  useEffect(() => {
    if (!canAssign) return undefined;
    let cancelled = false;
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const res = await getWhatsAppInboxAssignableRoles();
        if (cancelled) return;
        const list = res?.data?.data || res?.data || [];
        setRoleOptions(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) {
          setRoleOptions([]);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load roles",
          );
        }
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    };
    loadRoles();
    return () => {
      cancelled = true;
    };
  }, [canAssign]);

  useEffect(() => {
    if (!showRoleDropdown) return undefined;
    const onDoc = (event) => {
      if (!rolePickerRef.current?.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showRoleDropdown]);

  useEffect(() => {
    if (!canAssign) return undefined;
    // Load role roster whenever a role is picked, or while typing/searching.
    if (!agentRoleFilter && !showAgentDropdown) {
      setAgentResults([]);
      return undefined;
    }
    const q = agentQuery.trim();
    const seq = ++agentSearchSeq.current;
    const timer = window.setTimeout(async () => {
      try {
        setAgentSearching(true);
        const res = await searchWhatsAppInboxAssignableAgents({
          q,
          role: agentRoleFilter || undefined,
          limit: 30,
        });
        if (seq !== agentSearchSeq.current) return;
        const list = res?.data?.data || res?.data || [];
        setAgentResults(Array.isArray(list) ? list : []);
      } catch (err) {
        if (seq !== agentSearchSeq.current) return;
        setAgentResults([]);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Could not search team members",
        );
      } finally {
        if (seq === agentSearchSeq.current) setAgentSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [agentQuery, agentRoleFilter, canAssign, showAgentDropdown]);

  const patchConversation = async (waId, payload) => {
    try {
      setUpdatingMeta(true);
      setError("");
      const res = await updateWhatsAppInboxConversation(waId, payload);
      const updated = res?.data?.data || res?.data;
      if (updated) {
        setActiveConversation(updated);
        setConversations((prev) =>
          prev.map((c) => (c.waId === waId ? { ...c, ...updated } : c)),
        );
      }
      return updated;
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Update failed",
      );
      return null;
    } finally {
      setUpdatingMeta(false);
    }
  };

  const assignAgent = async (agent) => {
    if (!activeWaId || !agent?.id) return;
    const updated = await patchConversation(activeWaId, {
      assignedAgentId: agent.id,
    });
    if (updated) {
      setAgentQuery("");
      setAgentResults([]);
      setShowAgentDropdown(false);
    }
  };

  const clearAssignedAgent = async () => {
    if (!activeWaId) return;
    await patchConversation(activeWaId, {
      assignedAgentId: "",
      assignedAgentName: "",
    });
    setAgentQuery("");
  };

  const handleSend = async (event) => {
    event?.preventDefault?.();
    if (!activeWaId || !draft.trim() || sending) return;
    const conv =
      activeConversation ||
      conversations.find((c) => c.waId === activeWaId) ||
      null;
    const assignedId = String(conv?.assignedAgentId || "").trim();
    const isAssignedToMe = Boolean(meId && assignedId && meId === assignedId);
    if (!canAssign && !isAssignedToMe) {
      setError("Only the assigned agent or a head can reply in this chat.");
      return;
    }
    const text = draft.trim();
    setDraft("");
    setSending(true);
    setError("");
    try {
      const res = await sendWhatsAppInboxMessage(activeWaId, text);
      const message = res?.data?.data || res?.data;
      if (message) setMessages((prev) => [...prev, message]);
      else await loadMessages(activeWaId, { silent: true });
      await loadConversations(search);
    } catch (err) {
      setDraft(text);
      const apiMsg =
        err?.response?.data?.message || err?.message || "Send failed";
      setError(apiMsg);
      // Reload so Failed bubble + Meta reason appear in the thread.
      await loadMessages(activeWaId, { silent: true });
    } finally {
      setSending(false);
    }
  };

  const handleStartChat = async (event) => {
    event?.preventDefault?.();
    try {
      setError("");
      const res = await startWhatsAppInboxConversation({
        waId: newPhone,
        profileName: newName,
      });
      const conversation = res?.data?.data || res?.data;
      setShowNewChat(false);
      setNewPhone("");
      setNewName("");
      await loadConversations("");
      if (conversation?.waId) setActiveWaId(conversation.waId);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not start chat",
      );
    }
  };

  const active =
    activeConversation ||
    conversations.find((c) => c.waId === activeWaId) ||
    null;
  const activeStatus = active?.inboxStatus || "new";
  const activeTitle = active?.profileName || activeWaId || "Chat";
  const assignedAgentId = String(active?.assignedAgentId || "").trim();
  const isAssignedToMe = Boolean(
    meId && assignedAgentId && meId === assignedAgentId,
  );
  // Heads can always reply; staff only on chats assigned to them.
  const canReply = Boolean(canAssign || isAssignedToMe);
  const selectedRole =
    roleOptions.find((r) => r.value === agentRoleFilter) || null;
  const selectedRoleLabel = selectedRole?.label || "";
  const selectedRoleColor = selectedRole?.color || FALLBACK_ROLE_COLOR;

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[560px] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex flex-col">
      <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-[#f7f8fa] shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            liveStatus === "live"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : liveStatus === "reconnect"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              liveStatus === "live"
                ? "bg-emerald-500"
                : liveStatus === "reconnect"
                  ? "bg-amber-500"
                  : "bg-gray-400"
            }`}
          />
          {liveStatus === "live"
            ? "Live"
            : liveStatus === "reconnect"
              ? "Reconnecting…"
              : "Connecting…"}
        </span>
        {health ? (
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              health.ok
                ? "bg-white text-gray-600 border-gray-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {health.ok
              ? `Cloud API · ${health.displayPhoneNumber || health.verifiedName || "connected"}`
              : health.message || "WhatsApp credentials invalid"}
          </span>
        ) : null}
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            inboxScope === "all"
              ? "bg-sky-50 text-sky-700 border-sky-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {inboxScope === "all"
            ? "All chats · heads view"
            : "My assigned chats only"}
        </span>
      </div>

      <div className="flex flex-1 min-h-0">
      {/* ── LEFT: inbox list ─────────────────────────────── */}
      <aside className="w-full max-w-[320px] xl:max-w-[360px] border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inbox"
                className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#25D366] focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setStatusFilter((s) =>
                  s === "all" ? "new" : s === "new" ? "waiting" : s === "waiting" ? "resolved" : "all",
                )
              }
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                statusFilter === "all"
                  ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                  : "border-[#25D366] text-[#128C7E] bg-[#E8F8EF]"
              }`}
              title={`Filter: ${statusFilter}`}
            >
              <Filter size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                loadConversations(search);
                refreshHealth();
              }}
              className="w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
              title="Refresh Cloud inbox"
            >
              <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
            </button>
            {canAssign ? (
              <button
                type="button"
                onClick={() => setShowNewChat(true)}
                className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1EAF54]"
                title="New chat"
              >
                <Plus size={16} />
              </button>
            ) : null}
          </div>
          {statusFilter !== "all" && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1">
              Showing: {STATUS_META[statusFilter]?.label || statusFilter}
            </p>
          )}
          {inboxScope === "assigned" ? (
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide px-1">
              Only chats assigned to you
            </p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList && !conversations.length ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#25D366]" size={22} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center space-y-2">
              <p className="text-sm text-gray-600 font-semibold">No chats yet</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {inboxScope === "assigned"
                  ? "No WhatsApp users are assigned to you yet. Ask Super Admin / Ops Head / CSH / BDH to assign chats to you."
                  : "Start a chat with +, or wait for a customer message on your WhatsApp Business number. Inbound messages arrive when Meta posts to your webhook."}
              </p>
            </div>
          ) : (
            filtered.map((chat) => {
              const selected = chat.waId === activeWaId;
              const status = chat.inboxStatus || "new";
              const meta = STATUS_META[status] || STATUS_META.new;
              const unread = Number(chat.unreadCount || 0);
              return (
                <button
                  key={chat.waId}
                  type="button"
                  onClick={() => setActiveWaId(chat.waId)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-gray-100 transition ${
                    selected ? "bg-[#f0faf4]" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <Avatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-bold text-gray-900 truncate">
                        {chat.profileName || chat.waId}
                      </p>
                      {unread > 0 ? (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[13px] text-gray-500 truncate mt-0.5">
                      {chat.lastMessagePreview || "No messages yet"}
                    </p>
                    {chat.assignedAgentName ? (
                      <p className="text-[11px] text-[#128C7E] font-medium truncate mt-1">
                        Agent · {chat.assignedAgentName}
                        {chat.assignedAgentRole
                          ? ` (${chat.assignedAgentRole})`
                          : ""}
                      </p>
                    ) : null}
                    <div className="flex items-end justify-between gap-2 mt-2">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {formatListTime(chat.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── MIDDLE: chat thread ──────────────────────────── */}
      <section className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {!activeWaId ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f7f8fa] text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[#E8F8EF] flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-[#128C7E]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Select a conversation</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-sm">
              Pick a chat from the inbox to reply, or start a new conversation.
            </p>
            {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
          </div>
        ) : (
          <>
            <div className="h-14 px-4 flex items-center gap-3 border-b border-gray-200 bg-white shrink-0">
              <Avatar size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{activeTitle}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {activeWaId}
                  {active?.assignedAgentName
                    ? ` · ${active.assignedAgentName}`
                    : ""}
                </p>
              </div>
              <select
                value={activeStatus}
                disabled={updatingMeta}
                onChange={(e) =>
                  patchConversation(activeWaId, { inboxStatus: e.target.value })
                }
                className={`text-xs font-bold rounded-lg border px-2.5 py-1.5 outline-none ${
                  STATUS_META[activeStatus]?.select || STATUS_META.new.select
                }`}
              >
                <option value="new">New</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-3"
              style={{
                backgroundColor: "#f3f4f6",
                backgroundImage:
                  "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              {loadingMessages ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-[#128C7E]" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center py-16">
                  <span className="text-xs bg-white/80 text-gray-500 px-3 py-1.5 rounded-lg shadow-sm">
                    No messages in this chat yet
                  </span>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const prev = messages[index - 1];
                  const showDay =
                    !prev || formatDay(prev.createdAt) !== formatDay(msg.createdAt);
                  const outbound = msg.direction === "outbound";
                  return (
                    <div key={msg._id || `${msg.wamid}-${index}`}>
                      {showDay && (
                        <div className="flex justify-center my-3">
                          <span className="text-[11px] bg-white/90 text-gray-500 px-3 py-1 rounded-lg shadow-sm">
                            {formatDay(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex mb-2 ${outbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-xl px-3 pt-2 pb-1.5 shadow-sm ${
                            outbound
                              ? "bg-[#dcf8c6] rounded-tr-sm"
                              : "bg-white rounded-tl-sm"
                          }`}
                        >
                          <p className="text-[14px] text-gray-900 whitespace-pre-wrap break-words leading-snug">
                            {msg.body}
                          </p>
                          <div className="flex items-center justify-end gap-1.5 mt-1">
                            <span className="text-[10px] text-gray-400">
                              {formatBubbleTime(msg.createdAt)}
                            </span>
                            {outbound && (
                              <StatusTicks status={msg.status} error={msg.error} />
                            )}
                          </div>
                          {outbound && msg.status === "failed" && msg.error ? (
                            <p className="text-[10px] text-red-500 mt-1 leading-snug max-w-[260px]">
                              {msg.error}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100">
                {error}
              </div>
            )}

            {canReply ? (
              <form
                onSubmit={handleSend}
                className="px-3 py-2.5 flex items-center gap-2 bg-white border-t border-gray-200 shrink-0"
              >
                <button
                  type="button"
                  className="w-9 h-9 rounded-full text-gray-400 hover:bg-gray-50 flex items-center justify-center"
                  title="Emoji"
                >
                  <Smile size={18} />
                </button>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full text-gray-400 hover:bg-gray-50 flex items-center justify-center"
                  title="Attach"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a reply"
                  className="flex-1 rounded-full bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#1EAF54] transition shadow-sm"
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            ) : (
              <div className="px-4 py-3 bg-[#f7f8fa] border-t border-gray-200 text-center shrink-0">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {assignedAgentId
                    ? `Only ${active?.assignedAgentName || "the assigned agent"} or a head (SA / Ops / CSH / BDH) can reply.`
                    : "This chat is not assigned to you yet."}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── RIGHT: customer panel ────────────────────────── */}
      <aside className="hidden lg:flex w-[280px] xl:w-[300px] flex-col bg-white">
        {!activeWaId ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-gray-400">
              Customer details appear when a chat is selected.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Customer
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {active?.profileName || "Unknown"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{activeWaId}</p>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center"
                title="Expand"
              >
                <Expand size={14} />
              </button>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Next action
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  disabled={updatingMeta}
                  onClick={() =>
                    patchConversation(activeWaId, { inboxStatus: "waiting" })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 px-3 py-3 text-sm font-bold hover:bg-amber-100 transition disabled:opacity-60"
                >
                  <Clock3 size={16} />
                  Mark Waiting
                </button>
                <button
                  type="button"
                  disabled={updatingMeta}
                  onClick={() =>
                    patchConversation(activeWaId, { inboxStatus: "resolved" })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-3 text-sm font-bold hover:bg-emerald-100 transition disabled:opacity-60"
                >
                  <CheckCircle2 size={16} />
                  Mark Resolved
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Assigned agent
              </p>
              {canAssign ? (
                <div className="space-y-2">
                  <div className="relative" ref={rolePickerRef}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-disabled={updatingMeta || loadingRoles}
                      onClick={() => {
                        if (updatingMeta || loadingRoles) return;
                        setShowRoleDropdown((open) => !open);
                        setRoleSearch("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (updatingMeta || loadingRoles) return;
                          setShowRoleDropdown((open) => !open);
                          setRoleSearch("");
                        }
                      }}
                      className={`w-full rounded-xl border-2 px-3 py-2.5 text-left flex items-center gap-2 transition cursor-pointer ${
                        updatingMeta || loadingRoles ? "opacity-60" : ""
                      }`}
                      style={{
                        borderColor: selectedRole
                          ? selectedRoleColor.border
                          : "#25D366",
                        backgroundColor: selectedRole
                          ? selectedRoleColor.bg
                          : "#F0FDF4",
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: selectedRole
                            ? selectedRoleColor.accent
                            : "#25D366",
                        }}
                      />
                      <span
                        className="flex-1 text-sm font-semibold truncate"
                        style={{
                          color: selectedRole
                            ? selectedRoleColor.text
                            : "#166534",
                        }}
                      >
                        {loadingRoles
                          ? "Loading roles…"
                          : selectedRoleLabel || "Search & select role"}
                      </span>
                      {selectedRole ? (
                        <button
                          type="button"
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                          style={{
                            backgroundColor: "#fff",
                            color: selectedRoleColor.text,
                            border: `1px solid ${selectedRoleColor.border}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgentRoleFilter("");
                            setRoleSearch("");
                            setAgentResults([]);
                          }}
                        >
                          Clear
                        </button>
                      ) : null}
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition ${
                          showRoleDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {showRoleDropdown ? (
                      <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                              autoFocus
                              value={roleSearch}
                              onChange={(e) => setRoleSearch(e.target.value)}
                              placeholder="Search any role (CCE, RM, Sales…)"
                              className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm outline-none focus:border-[#25D366]"
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                          {filteredRoleOptions.length === 0 ? (
                            <p className="px-2 py-3 text-xs text-gray-400 text-center">
                              No roles match “{roleSearch}”
                            </p>
                          ) : (
                            filteredRoleOptions.map((role) => {
                              const color = role.color || FALLBACK_ROLE_COLOR;
                              const activeRole = role.value === agentRoleFilter;
                              return (
                                <button
                                  key={role.value}
                                  type="button"
                                  onClick={() => {
                                    setAgentRoleFilter(role.value);
                                    setRoleSearch("");
                                    setShowRoleDropdown(false);
                                    setAgentQuery("");
                                  }}
                                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:brightness-95"
                                  style={{
                                    backgroundColor: activeRole
                                      ? color.bg
                                      : "#fff",
                                    border: `1px solid ${
                                      activeRole ? color.border : "transparent"
                                    }`,
                                  }}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: color.accent }}
                                  />
                                  <span
                                    className="flex-1 text-sm font-semibold truncate"
                                    style={{ color: color.text }}
                                  >
                                    {role.label}
                                  </span>
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                                    style={{
                                      backgroundColor: color.bg,
                                      color: color.text,
                                      border: `1px solid ${color.border}`,
                                    }}
                                  >
                                    Staff
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {agentRoleFilter ? (
                    <>
                      <div
                        className="rounded-xl px-3 py-2 text-[11px] font-semibold"
                        style={{
                          backgroundColor: selectedRoleColor.bg,
                          color: selectedRoleColor.text,
                          border: `1px solid ${selectedRoleColor.border}`,
                        }}
                      >
                        Showing staff for {selectedRoleLabel}
                      </div>

                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                        />
                        <input
                          value={agentQuery}
                          onChange={(e) => {
                            setAgentQuery(e.target.value);
                            setShowAgentDropdown(true);
                          }}
                          onFocus={() => setShowAgentDropdown(true)}
                          onBlur={() => {
                            window.setTimeout(
                              () => setShowAgentDropdown(false),
                              180,
                            );
                          }}
                          placeholder={`Search ${selectedRoleLabel} by name`}
                          disabled={updatingMeta}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#25D366] focus:bg-white disabled:opacity-60"
                        />
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white max-h-48 overflow-y-auto">
                        {agentSearching ? (
                          <div className="px-3 py-3 text-xs text-gray-400 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            Loading {selectedRoleLabel} staff…
                          </div>
                        ) : agentResults.length === 0 ? (
                          <div className="px-3 py-3 text-xs text-gray-400">
                            No staff found for this role.
                          </div>
                        ) : (
                          agentResults.map((agent) => {
                            const selected =
                              String(agent.id) ===
                              String(active?.assignedAgentId || "");
                            const chipColor =
                              selectedRoleColor || FALLBACK_ROLE_COLOR;
                            return (
                              <button
                                key={agent.id}
                                type="button"
                                disabled={updatingMeta}
                                onClick={() => assignAgent(agent)}
                                className="w-full text-left px-3 py-2.5 border-b border-gray-50 last:border-0 transition hover:bg-gray-50"
                                style={
                                  selected
                                    ? { backgroundColor: chipColor.bg }
                                    : undefined
                                }
                              >
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {agent.name}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {agent.roleLabel}
                                  {agent.email ? ` · ${agent.email}` : ""}
                                </p>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400">
                      Search any role, then pick staff under that role to
                      assign.
                    </p>
                  )}
                </div>
              ) : null}

              {active?.assignedAgentName ? (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-800 truncate">
                      {active.assignedAgentName}
                    </p>
                    {active.assignedAgentRole ? (
                      <p className="text-[10px] text-emerald-700/80 truncate">
                        {active.assignedAgentRole}
                      </p>
                    ) : null}
                  </div>
                  {canAssign ? (
                    <button
                      type="button"
                      disabled={updatingMeta}
                      onClick={clearAssignedAgent}
                      className="text-emerald-600/70 hover:text-red-500 shrink-0"
                      title="Unassign"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              ) : !canAssign ? (
                <p className="text-[11px] text-gray-400 mt-2">
                  Only Super Admin, Operations Head, CSH, or BDH can assign
                  agents.
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                CRM record
              </p>
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  No customer record linked to this phone number.
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="h-12 px-4 flex items-center justify-between bg-[#128C7E] text-white">
              <span className="font-semibold text-sm">New chat</span>
              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleStartChat} className="p-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Phone (with country code)
                </label>
                <input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="9198XXXXXXXX"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#25D366]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Name (optional)
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Customer name"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#25D366]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#1EAF54]"
              >
                Open chat
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
