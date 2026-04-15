//src/pages/EmailNotifications/EmailNotifications.jsx
import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Search,
  Edit2,
  Mail,
  Check,
  AlertCircle,
  Loader2,
  Tag,
  BarChart2,
  RefreshCw,
  Clock,
  FileSpreadsheet,
  Send,
  ChevronDown,
  Building2,
  Upload,
  FileText,
  Users,
  CheckCircle2,
  RotateCcw,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { State, City } from "country-state-city";
import {
  getEmailNotification,
  getUserSearch,
  sentEmailNotification,
  sentBulkEmailNotification,
} from "../../features/user/userService";
import { useEmailNotifications } from "./hooks/useEmailNotifications";
import { useEmailLogs } from "./hooks/useEmailLogs";
import TemplateCard from "./EmailNotificationComponents/TemplateCard.jsx";
import NotificationForm from "./EmailNotificationComponents/NotificationForm.jsx";
import { Modal } from "./modals/CreateModal.jsx";
import { ViewModal } from "./modals/ViewModal.jsx";
import { DeleteConfirm } from "./modals/DeleteConfirm.jsx";
import { getCatMeta } from "./utils/helpers";
import { CampaignTab } from "./EmailNotificationComponents/CampaignTab.jsx";
import { LogsTab } from "./EmailNotificationComponents/LogsTab.jsx";
import { ProgressBar } from "./EmailNotificationComponents/Progressbar.jsx";
import { SendCampaignModal } from "./modals/SendCampaignModal.jsx";

// ─── Geo ──────────────────────────────────────────────────
const IN_STATES = State.getStatesOfCountry("IN");
const getCitiesByState = (c) => (c ? City.getCitiesOfState("IN", c) : []);

const EMPTY_FORM = {
  name: "",
  slug: "",
  subject: "",
  content: "",
  variables: [],
  category: "festival",
  status: "active",
};

const BOTTOM_TABS = [
  { id: "campaigns", label: "Campaigns", icon: BarChart2 },
  { id: "logs", label: "Email Logs", icon: Clock },
];

// ════════════════════════════════════════════════════════
// StatCard
// ════════════════════════════════════════════════════════
const StatCard = ({ label, value, icon: Icon, bg, border }) => (
  <div
    className={`bg-white border ${border || "border-gray-200"} rounded-2xl p-3 sm:p-4 flex items-center gap-3 hover:shadow-sm transition-shadow`}
  >
    <div
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      <Icon size={16} className="sm:text-[18px]" />
    </div>
    <div className="min-w-0">
      <p className="text-lg sm:text-xl font-extrabold text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5 truncate">
        {label}
      </p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// Running Banner
// ════════════════════════════════════════════════════════
const RunningBanner = ({ data, onRetry, retrying }) => {
  if (!data?.campaignId) return null;
  return (
    <>
      <style>{`
        @keyframes rbn-radar{0%{transform:scale(1);opacity:.75}100%{transform:scale(2.8);opacity:0}}
        @keyframes rbn-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes rbn-sweep{0%{left:-60%}100%{left:120%}}
        @keyframes rbn-march{from{background-position:0 0}to{background-position:24px 0}}
        @keyframes rbn-pill-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rbn-glow{0%,100%{box-shadow:0 0 0 0px rgba(39,174,96,.35)}50%{box-shadow:0 0 0 5px rgba(39,174,96,0)}}
        @keyframes rbn-spin{to{transform:rotate(360deg)}}
        .rbn-radar{position:relative;width:10px;height:10px;border-radius:50%;background:#27AE60;flex-shrink:0}
        .rbn-radar::before,.rbn-radar::after{content:'';position:absolute;inset:0;border-radius:50%;background:#27AE60;animation:rbn-radar 1.6s ease-out infinite}
        .rbn-radar::after{animation-delay:.8s}
        .rbn-shimmer-text{background:linear-gradient(90deg,#1A7A43 0%,#27AE60 40%,#6FCF97 50%,#27AE60 60%,#1A7A43 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rbn-shimmer 2.4s linear infinite;font-size:13px;font-weight:700}
        .rbn-track{width:100%;height:6px;border-radius:999px;background:rgba(0,0,0,.06);display:flex;position:relative;overflow:hidden}
        .rbn-sent{height:100%;background:#27AE60;border-radius:999px 0 0 999px;position:relative;overflow:hidden}
        .rbn-sent::after{content:'';position:absolute;inset:0;width:40%;background:rgba(255,255,255,.4);border-radius:999px;animation:rbn-sweep 2.4s ease-in-out infinite;left:-60%}
        .rbn-failed{height:100%;background:#f87171}
        .rbn-pending{height:100%;background:#fcd34d;opacity:.55;border-radius:0 999px 999px 0;flex:1;background-image:repeating-linear-gradient(90deg,#fcd34d 0,#fcd34d 8px,rgba(255,255,255,.28) 8px,rgba(255,255,255,.28) 9px);background-size:24px 100%;animation:rbn-march .9s linear infinite}
        .rbn-pill{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;animation:rbn-pill-in .35s ease both}
        .rbn-retry{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:10px;border:1.5px solid #27AE60;background:transparent;color:#27AE60;font-size:11px;font-weight:700;cursor:pointer;transition:background .15s,color .15s,transform .1s;animation:rbn-glow 2s ease-in-out infinite;white-space:nowrap}
        .rbn-retry:hover{background:#27AE60;color:#fff;transform:scale(1.04);animation:none}
        .rbn-retry:disabled{opacity:.5;cursor:not-allowed}
        .rbn-rspin{animation:rbn-spin .7s linear infinite}
      `}</style>
      <div
        style={{
          background: "#fff",
          border: "0.5px solid rgba(39,174,96,0.35)",
          borderLeft: "3px solid #27AE60",
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div className="rbn-radar" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span className="rbn-shimmer-text">Campaign Running</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#64748b",
                background: "#f1f5f9",
                border: "0.5px solid rgba(0,0,0,.1)",
                borderRadius: 6,
                padding: "2px 7px",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {data.campaignId}
            </span>
          </div>
          <div className="rbn-track" style={{ marginBottom: 6 }}>
            {data.total > 0 && (
              <>
                <div
                  className="rbn-sent"
                  style={{
                    width: `${Math.round((data.success / data.total) * 100)}%`,
                  }}
                />
                {data.failed > 0 && (
                  <div
                    className="rbn-failed"
                    style={{
                      width: `${Math.round((data.failed / data.total) * 100)}%`,
                    }}
                  />
                )}
                <div className="rbn-pending" />
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            <span
              className="rbn-pill"
              style={{
                background: "rgba(39,174,96,.1)",
                color: "#15803d",
                animationDelay: ".1s",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#27AE60",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              {data.success} sent
            </span>
            <span
              className="rbn-pill"
              style={{
                background: "rgba(248,113,113,.1)",
                color: "#b91c1c",
                animationDelay: ".2s",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#f87171",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              {data.failed} failed
            </span>
            <span
              className="rbn-pill"
              style={{
                background: "rgba(252,211,77,.12)",
                color: "#92400e",
                animationDelay: ".3s",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#fcd34d",
                  opacity: 0.7,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              {data.pending} pending
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 700,
                color: "#27AE60",
              }}
            >
              {data.progress}
            </span>
          </div>
        </div>
        {data.failed > 0 && (
          <button
            className="rbn-retry"
            onClick={() => onRetry(data.campaignId)}
            disabled={retrying}
          >
            {retrying ? (
              <RotateCcw size={12} className="rbn-rspin" />
            ) : (
              <RotateCcw size={12} />
            )}
            <span className="hidden xs:inline">Retry</span>
          </button>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════
// Last Campaign Card
// ════════════════════════════════════════════════════════
const LastCampaignCard = ({ campaign }) => {
  if (!campaign) return null;
  return (
    <div className="border border-gray-200 rounded-2xl p-3 sm:p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Last Campaign
        </p>
        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-mono">
          {campaign.progress}d
        </span>
      </div>
      <p className="text-xs font-mono text-gray-600 truncate mb-3">
        {campaign.campaignId}
      </p>
      <ProgressBar
        success={campaign.success}
        failed={campaign.failed}
        total={campaign.total}
        variant="blocks"
      />
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          {
            label: "Sent",
            value: campaign.success,
            color: "text-green-700",
            bg: "bg-green-50",
          },
          {
            label: "Failed",
            value: campaign.failed,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Pending",
            value: campaign.pending,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2 text-center`}>
            <p className={`text-sm sm:text-base font-extrabold ${s.color}`}>
              {s.value}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Template Picker
// ════════════════════════════════════════════════════════
const TemplatePicker = ({
  templates,
  selected,
  onSelect,
  maxH = "max-h-52",
}) => {
  const [search, setSearch] = useState("");
  const shown = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.slug || "").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={`flex flex-col gap-1.5 ${maxH} overflow-y-auto pr-0.5`}>
        {shown.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No templates found
          </p>
        )}
        {shown.map((t) => {
          const sel = selected?._id === t._id;
          return (
            <div
              key={t._id}
              onClick={() => onSelect(t)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${sel ? "border-[#27AE60] bg-green-50" : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? "bg-[#27AE60]" : "bg-gray-100"}`}
              >
                <Mail
                  size={12}
                  className={sel ? "text-white" : "text-gray-400"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {t.name}
                </p>
                <p className="text-[10px] text-gray-400 font-mono">{t.slug}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? "bg-[#27AE60] border-[#27AE60]" : "border-gray-300"}`}
              >
                {sel && (
                  <Check size={8} className="text-white" strokeWidth={3} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// TEMPLATE SEND PAGE
// ════════════════════════════════════════════════════════
const TemplateSendPage = ({
  templates,
  onBack,
  onSendSuccess,
  notifications,
  emailStats,
}) => {
  const [selectedTpl, setSelectedTpl] = useState(null);
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [locality, setLocality] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingU, setLoadingU] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [sending, setSending] = useState(false);

  const cities = getCitiesByState(stateCode);

  useEffect(() => {
    (async () => {
      try {
        setLoadingU(true);
        const res = await getUserSearch("user");
        setUsers(res?.data?.results || res?.data || []);
        setFetched(true);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoadingU(false);
      }
    })();
  }, []);

  useEffect(() => {
    setCityName("");
  }, [stateCode]);

  const localityOpts = [
    ...new Set(users.map((u) => u.locality).filter(Boolean)),
  ];
  const hasLocFilter = stateCode || cityName || locality;

  const filteredUsers = users.filter((u) => {
    const mLoc = locality.trim()
      ? (u.locality || "").toLowerCase().includes(locality.toLowerCase())
      : true;
    const sName = stateCode
      ? (
          IN_STATES.find((s) => s.isoCode === stateCode)?.name || ""
        ).toLowerCase()
      : "";
    const mState = stateCode ? (u.state || "").toLowerCase() === sName : true;
    const mCity = cityName
      ? (u.city || "").toLowerCase() === cityName.toLowerCase()
      : true;
    return mLoc && mState && mCity;
  });

  const handleSend = async () => {
    if (!selectedTpl) {
      toast.error("Select a template first");
      return;
    }
    if (!filteredUsers.length) {
      toast.error("No users match the selected location");
      return;
    }
    try {
      setSending(true);
      await sentEmailNotification({
        slug: selectedTpl.slug,
        userIds: filteredUsers.map((u) => u._id),
      });
      toast.success(`Campaign sent to ${filteredUsers.length} users! 🚀`);
      onSendSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const activeCount = notifications.filter((n) => n.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#27AE60] hover:border-green-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-[#27AE60]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              Send Template Campaign
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
              Pick a template · set location · send
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 border border-gray-200 text-gray-500 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 hover:text-[#27AE60] hover:border-green-300 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={12} />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            label="Total Templates"
            value={notifications.length}
            icon={Mail}
            bg="bg-blue-50 text-blue-600"
            border="border-blue-100"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={CheckCircle2}
            bg="bg-green-50 text-green-600"
            border="border-green-100"
          />
          <StatCard
            label="Total Emails"
            value={emailStats?.total ?? 0}
            icon={Send}
            bg="bg-purple-50 text-purple-600"
            border="border-purple-100"
          />
          <StatCard
            label="Users Available"
            value={fetched ? users.length : "…"}
            icon={Users}
            bg="bg-amber-50 text-amber-600"
            border="border-amber-100"
          />
        </div>

        {/* Main panel */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/60">
            <p className="text-sm font-bold text-gray-900">
              Configure Campaign
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a template, apply location filters, then send to all
              matched users
            </p>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Template picker */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                Select Template
                <span className="ml-2 normal-case font-mono text-[#27AE60]">
                  {templates.length} active
                </span>
              </p>
              <TemplatePicker
                templates={templates}
                selected={selectedTpl}
                onSelect={setSelectedTpl}
                maxH="max-h-56 sm:max-h-[28rem]"
              />
            </div>

            {/* Location + send */}
            <div className="flex flex-col gap-4 sm:gap-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Target Location
                  </p>
                  {hasLocFilter && (
                    <button
                      onClick={() => {
                        setStateCode("");
                        setCityName("");
                        setLocality("");
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <X size={10} /> Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 cursor-pointer pr-7"
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                      >
                        <option value="">All States</option>
                        {IN_STATES.map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                    <div className="relative">
                      <select
                        className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 cursor-pointer pr-7 disabled:opacity-40 disabled:cursor-not-allowed"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        disabled={!stateCode}
                      >
                        <option value="">
                          {stateCode ? "All Cities" : "State first"}
                        </option>
                        {cities.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <Building2
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      list="tpl-loc-list"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300 bg-white"
                      placeholder="Filter by locality…"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                    <datalist id="tpl-loc-list">
                      {localityOpts.map((l) => (
                        <option key={l} value={l} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {selectedTpl && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#27AE60] flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-green-800 truncate">
                      {selectedTpl.name}
                    </p>
                    <p className="text-[10px] text-green-600 font-mono">
                      {selectedTpl.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTpl(null)}
                    className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <div
                className={`flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border ${filteredUsers.length > 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
              >
                {loadingU ? (
                  <Loader2 size={16} className="animate-spin text-[#27AE60]" />
                ) : (
                  <Users
                    size={16}
                    className={
                      filteredUsers.length > 0
                        ? "text-[#27AE60]"
                        : "text-gray-400"
                    }
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${filteredUsers.length > 0 ? "text-green-800" : "text-gray-500"}`}
                  >
                    {loadingU
                      ? "Loading users…"
                      : `${filteredUsers.length} recipient${filteredUsers.length !== 1 ? "s" : ""}`}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {!loadingU &&
                      fetched &&
                      (hasLocFilter
                        ? "matching filters"
                        : "all users — add filters to narrow down")}
                  </p>
                </div>
                {!loadingU && fetched && filteredUsers.length > 0 && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                    All
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <FileText
                  size={13}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-amber-700 leading-relaxed">
                  All users matching the location filters will receive this
                  campaign.
                </p>
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !selectedTpl || !filteredUsers.length}
                className="w-full py-3 sm:py-3.5 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-green-700 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 14px rgba(39,174,96,.25)" }}
              >
                {sending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send to {filteredUsers.length} User
                    {filteredUsers.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// CSV PAGE
// ════════════════════════════════════════════════════════
const CsvPage = ({
  templates,
  onBack,
  onSendSuccess,
  notifications,
  emailStats,
}) => {
  const [selectedTpl, setSelectedTpl] = useState(null);
  const [file, setFile] = useState(null);
  const [dragging, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  const accept = (f) => {
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) setFile(f);
    else toast.error("Upload a .csv or .xlsx file");
  };

  const handleSend = async () => {
    if (!selectedTpl) {
      toast.error("Select a template");
      return;
    }
    if (!file) {
      toast.error("Upload a CSV/Excel file first");
      return;
    }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("templateId", selectedTpl._id);
      await sentBulkEmailNotification(fd);
      toast.success("Bulk campaign started! 🚀");
      onSendSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Send failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet size={16} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              Bulk CSV Campaign
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
              Pick a template · upload CSV · send
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 border border-gray-200 text-gray-500 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 hover:text-purple-600 hover:border-purple-300 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={12} />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            label="Total Templates"
            value={notifications.length}
            icon={Mail}
            bg="bg-blue-50 text-blue-600"
            border="border-blue-100"
          />
          <StatCard
            label="Active"
            value={notifications.filter((n) => n.status === "active").length}
            icon={CheckCircle2}
            bg="bg-green-50 text-green-600"
            border="border-green-100"
          />
          <StatCard
            label="Total Emails"
            value={emailStats?.total ?? 0}
            icon={Send}
            bg="bg-purple-50 text-purple-600"
            border="border-purple-100"
          />
          <StatCard
            label="Sent"
            value={emailStats?.success ?? 0}
            icon={CheckCircle2}
            bg="bg-amber-50 text-amber-600"
            border="border-amber-100"
          />
        </div>

        {/* Main panel */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/60">
            <p className="text-sm font-bold text-gray-900">
              Configure Bulk Campaign
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a template and upload a CSV/Excel file with recipient data
            </p>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Template picker */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                Select Template
                <span className="ml-2 normal-case font-mono text-purple-600">
                  {templates.length} available
                </span>
              </p>
              <TemplatePicker
                templates={templates}
                selected={selectedTpl}
                onSelect={setSelectedTpl}
                maxH="max-h-56 sm:max-h-[32rem]"
              />
            </div>

            {/* Upload + send */}
            <div className="flex flex-col gap-4 sm:gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                  Upload CSV / Excel
                </p>
                <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                  <FileText
                    size={13}
                    className="text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Upload a <strong>.csv</strong> or <strong>.xlsx</strong>{" "}
                    file.
                    {selectedTpl && (
                      <>
                        {" "}
                        Template{" "}
                        <span className="font-mono bg-blue-100 px-1 rounded">
                          {selectedTpl.slug}
                        </span>{" "}
                        will be sent to every row.
                      </>
                    )}{" "}
                    Columns must match template variables.
                  </p>
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    accept(e.dataTransfer.files[0]);
                  }}
                  onClick={() =>
                    document.getElementById("csv-bulk-inp")?.click()
                  }
                  className={`flex flex-col items-center justify-center gap-3 py-8 sm:py-10 px-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    dragging || file
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/30"
                  }`}
                >
                  <input
                    id="csv-bulk-inp"
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={(e) => accept(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500 flex items-center justify-center shadow-sm shadow-purple-200">
                        <FileSpreadsheet size={22} className="text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-purple-800 break-all">
                          {file.name}
                        </p>
                        <p className="text-xs text-purple-600 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB — ready
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                      >
                        <X size={10} /> Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Upload size={22} className="text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-600">
                          Drop CSV / Excel here
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          or tap to browse · .csv .xlsx
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div
                className={`flex flex-col gap-2 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border ${selectedTpl && file ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                  Campaign Summary
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide w-14 flex-shrink-0 ${selectedTpl ? "text-purple-600" : "text-gray-400"}`}
                  >
                    Template
                  </span>
                  <span
                    className={`text-xs font-semibold truncate ${selectedTpl ? "text-purple-900" : "text-gray-400"}`}
                  >
                    {selectedTpl?.name || "Not selected"}
                  </span>
                  {selectedTpl && (
                    <span className="ml-auto text-[10px] font-mono bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded flex-shrink-0">
                      {selectedTpl.slug}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide w-14 flex-shrink-0 ${file ? "text-purple-600" : "text-gray-400"}`}
                  >
                    File
                  </span>
                  <span
                    className={`text-xs font-semibold truncate ${file ? "text-purple-900" : "text-gray-400"}`}
                  >
                    {file?.name || "No file uploaded"}
                  </span>
                  {file && (
                    <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={busy || !selectedTpl || !file}
                className="w-full py-3 sm:py-3.5 bg-purple-600 text-white font-bold text-sm rounded-2xl hover:bg-purple-700 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 14px rgba(124,58,237,.25)" }}
              >
                {busy ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Bulk Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// DEFAULT TWO-COLUMN VIEW
// ════════════════════════════════════════════════════════
const DefaultTwoColumn = ({
  running,
  campaigns,
  onRetry,
  retrying,
  onClickTemplate,
  onClickCsv,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Campaign Activity */}
    <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Activity size={14} className="text-blue-600" />
        </div>
        <p className="text-sm font-bold text-gray-800">Campaign Activity</p>
      </div>
      {running ? (
        <RunningBanner data={running} onRetry={onRetry} retrying={retrying} />
      ) : (
        <div className="flex items-center gap-3 px-3 sm:px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Activity size={15} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">
              No active campaign
            </p>
            <p className="text-xs text-gray-400">All campaigns completed</p>
          </div>
        </div>
      )}
      {campaigns[0] && <LastCampaignCard campaign={campaigns[campaigns.length - 1]} />}
    </div>

    {/* Send Campaign */}
    <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
          <Send size={14} className="text-[#27AE60]" />
        </div>
        <p className="text-sm font-bold text-gray-800">Send Campaign</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={onClickTemplate}
          className="group flex flex-col items-center justify-center gap-2 py-5 sm:py-7 px-3 sm:px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-[#27AE60] hover:bg-green-50 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 group-hover:bg-[#27AE60] flex items-center justify-center transition-colors">
            <Mail
              size={18}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-[#27AE60] transition-colors">
              Template Send
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed hidden sm:block">
              Send by location
              <br />
              to matched users
            </p>
          </div>
        </button>

        <button
          onClick={onClickCsv}
          className="group flex flex-col items-center justify-center gap-2 py-5 sm:py-7 px-3 sm:px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
            <FileSpreadsheet
              size={18}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
              CSV Upload
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed hidden sm:block">
              Bulk send
              <br />
              from file
            </p>
          </div>
        </button>
      </div>
      <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl mt-1">
        <FileText size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Template Send</strong> — targets users by state / city /
          locality.
          <br />
          <strong>CSV Upload</strong> — bulk sends to every row in your file.
        </p>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════
const EmailNotifications = () => {
  const {
    notifications,
    loading,
    submitting,
    deleting,
    fetchAll,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useEmailNotifications();

  const {
    logs,
    emailStats,
    campaigns,
    running,
    loadingLogs,
    retrying,
    fetchLogs,
    handleRetry,
  } = useEmailLogs();

  const [panelMode, setPanelMode] = useState("default");
  const [bottomTab, setBottomTab] = useState("campaigns");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sendItem, setSendItem] = useState(null);

  useEffect(() => {
    fetchAll();
    fetchLogs();
  }, []);

  const openEdit = async (item) => {
    setViewItem(null);
    try {
      const res = await getEmailNotification(item._id);
      setEditItem(res?.data?.data || res?.data || item);
    } catch {
      setEditItem(item);
    }
  };
  const openView = async (item) => {
    try {
      const res = await getEmailNotification(item._id);
      setViewItem(res?.data?.data || res?.data || item);
    } catch {
      setViewItem(item);
    }
  };

  const activeTemplates = notifications.filter((n) => n.status === "active");
  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    return (
      (n.name.toLowerCase().includes(q) ||
        (n.slug || "").toLowerCase().includes(q)) &&
      (categoryFilter ? n.category === categoryFilter : true) &&
      (statusFilter ? n.status === statusFilter : true)
    );
  });
  const categories = [...new Set(notifications.map((n) => n.category))];
  const activeCount = notifications.filter((n) => n.status === "active").length;
  const isRefreshing = loading || loadingLogs;

  const handleSendSuccess = () => {
    setPanelMode("default");
    fetchLogs();
  };

  const modals = (
    <>
      {showCreate && (
        <Modal title="Create New Template" onClose={() => setShowCreate(false)}>
          <NotificationForm
            key="create-form"
            initial={EMPTY_FORM}
            onSubmit={(p) => handleCreate(p, () => setShowCreate(false))}
            submitting={submitting}
          />
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Template" onClose={() => setEditItem(null)}>
          <NotificationForm
            key={`edit-form-${editItem._id}`}
            initial={editItem}
            onSubmit={(p) => handleUpdate(editItem._id, p)}
            submitting={submitting}
          />
        </Modal>
      )}
      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => openEdit(viewItem)}
        />
      )}
      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() =>
            handleDelete(deleteItem._id, () => setDeleteItem(null))
          }
          deleting={deleting}
        />
      )}
      {sendItem && (
        <SendCampaignModal item={sendItem} onClose={() => setSendItem(null)} />
      )}
    </>
  );

  // ── Manage Templates mode ───────────────────────────────
  if (panelMode === "manage") {
    return (
      <div className="min-h-screen bg-gray-50">
        {modals}
        {/* Topbar */}
        <div className="px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setPanelMode("default")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#27AE60] hover:border-green-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={15} />
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#27AE60] flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200">
              <Mail size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                Email Templates
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
                Manage all notification templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                fetchAll();
                fetchLogs();
              }}
              className="w-8 h-8 sm:w-auto sm:h-auto sm:flex sm:items-center sm:gap-2 sm:px-3 sm:py-2 flex items-center justify-center border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#27AE60] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-green-700 active:scale-[.98] transition-all shadow-sm shadow-green-200"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">New</span>
              <span className="hidden sm:inline">Template</span>
            </button>
            <button
              onClick={() => setPanelMode("default")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              {
                label: "Total",
                value: notifications.length,
                icon: Mail,
                bg: "bg-blue-50 text-blue-600",
                border: "border-blue-100",
              },
              {
                label: "Active",
                value: activeCount,
                icon: Check,
                bg: "bg-green-50 text-green-600",
                border: "border-green-100",
              },
              {
                label: "Categories",
                value: categories.length,
                icon: Tag,
                bg: "bg-amber-50 text-amber-600",
                border: "border-amber-100",
              },
              {
                label: "Inactive",
                value: notifications.length - activeCount,
                icon: AlertCircle,
                bg: "bg-gray-100 text-gray-400",
                border: "border-gray-200",
              },
            ].map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300"
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {getCatMeta(c).label}
                </option>
              ))}
            </select>
            <select
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(search || categoryFilter || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setStatusFilter("");
                }}
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Template list */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#27AE60]" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Mail size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">
                {notifications.length === 0
                  ? "No templates yet."
                  : "No templates match."}
              </p>
              {notifications.length === 0 && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-green-700"
                >
                  <Plus size={14} /> Create Template
                </button>
              )}
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((item) => (
                <TemplateCard
                  key={item._id}
                  item={item}
                  onView={openView}
                  onEdit={openEdit}
                  onDelete={setDeleteItem}
                  onSend={() => setSendItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CSV mode ────────────────────────────────────────────
  if (panelMode === "csv") {
    return (
      <div className="min-h-screen bg-gray-50">
        {modals}
        <CsvPage
          templates={notifications}
          notifications={notifications}
          emailStats={emailStats}
          onBack={() => setPanelMode("default")}
          onSendSuccess={handleSendSuccess}
        />
      </div>
    );
  }

  // ── Default dashboard ───────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {modals}
      {/* Topbar */}
      <div className="px-2 max-sm:px-1 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm gap-2">
        <div className="flex items-center gap-2  sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9  rounded-xl bg-[#27AE60] flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200">
            <Mail size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              Email Notifications
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
              Templates · Campaigns · Logs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchAll();
              fetchLogs();
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border border-gray-200 text-gray-500 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            label="Total Emails"
            value={emailStats?.total ?? 0}
            icon={Mail}
            bg="bg-blue-50 text-blue-600"
            border="border-blue-100"
          />
          <StatCard
            label="Sent"
            value={emailStats?.success ?? 0}
            icon={CheckCircle2}
            bg="bg-green-50 text-green-600"
            border="border-green-100"
          />
          <StatCard
            label="Failed"
            value={emailStats?.failed ?? 0}
            icon={AlertCircle}
            bg="bg-red-50 text-red-500"
            border="border-red-100"
          />
          <StatCard
            label="Pending"
            value={emailStats?.pending ?? 0}
            icon={Clock}
            bg="bg-amber-50 text-amber-600"
            border="border-amber-100"
          />
        </div>

        {/* Campaign activity + Send buttons */}
        <DefaultTwoColumn
          running={running}
          campaigns={campaigns}
          onRetry={handleRetry}
          retrying={!!retrying}
          onClickTemplate={() => {
            if (!activeTemplates.length) {
              toast.error("Create an active template first");
              return;
            }
            setPanelMode("manage");
          }}
          onClickCsv={() => {
            if (!notifications.length) {
              toast.error("Create a template first");
              return;
            }
            setPanelMode("csv");
          }}
        />

        {/* Bottom tabs */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
            {BOTTOM_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setBottomTab(id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${bottomTab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Icon size={13} />
                <span>{label}</span>
                {id === "campaigns" && campaigns.length > 0 && (
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                    {campaigns.length}
                  </span>
                )}
                {id === "logs" && logs.length > 0 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {logs.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {bottomTab === "campaigns" && (
            <CampaignTab
              campaigns={campaigns}
              emailStats={emailStats}
              loading={loadingLogs}
              onRetry={handleRetry}
              retrying={retrying}
            />
          )}
          {bottomTab === "logs" && (
            <LogsTab logs={logs} loading={loadingLogs} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;
