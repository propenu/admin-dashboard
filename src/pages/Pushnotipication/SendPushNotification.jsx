import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import {
  Send,
  Bell,
  Users,
  Loader2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Zap,
  Radio,
  UserCheck,
  Building2,
  Home,
  Wifi,
  Battery,
  Signal,
  ImagePlus,
  X,
  MapPin,
  RefreshCw,
  History,
  Megaphone,
} from "lucide-react";
import {
  adminCustomNotification,
  getAdminNotificationFeed,
  markAdminNotificationsSeen,
} from "../../features/user/userService";
import { INDIAN_STATES, getCitiesByState } from "../../utils/countryStateCity";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   STYLES  — light theme, primary #27AE60
───────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

.pn-root *, .pn-root *::before, .pn-root *::after { box-sizing: border-box; }

.pn-root {
  --green:       #27AE60;
  --green-dark:  #1e8449;
  --green-light: #eafaf1;
  --green-mid:   #d5f0e2;
  --green-ring:  rgba(39,174,96,.18);
  --surface:     #ffffff;
  --surface2:    #f6fdf9;
  --surface3:    #edf7f2;
  --border:      #d4eddd;
  --border2:     #b7dfca;
  --text:        #0f2d1c;
  --text2:       #2e6b47;
  --text3:       #6aab83;
  --muted:       #9ec9ad;
  --danger:      #dc2626;
  --danger-bg:   #fef2f2;
  --danger-bdr:  #fecaca;
  --amber:       #d97706;
  --amber-bg:    #fffbeb;
  --shadow-md:   0 4px 24px rgba(39,174,96,.10);
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100%;
  background: var(--surface2);
  background-image:
    radial-gradient(ellipse 55% 40% at 85% 0%, rgba(39,174,96,.10) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 5% 95%, rgba(39,174,96,.07) 0%, transparent 55%);
  padding: 1.75rem 1.25rem 3rem;
  color: var(--text);
}

.pn-eyebrow {
  display: flex; align-items: center; gap: .45rem;
  font-size: .63rem; font-weight: 700; letter-spacing: .15em;
  text-transform: uppercase; color: var(--green); margin-bottom: .45rem;
}
.pn-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--green);
  animation: pn-blink 1.4s ease-in-out infinite;
}
@keyframes pn-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
.pn-title {
  font-size: clamp(1.55rem,3.5vw,2.1rem); font-weight: 800;
  color: var(--text); letter-spacing: -.03em; line-height: 1.15; margin: 0 0 .3rem;
}
.pn-title span { color: var(--green); }
.pn-sub { font-size: .82rem; color: var(--text3); font-weight: 500; margin: 0; }

.pn-shell { max-width: 1180px; margin: 0 auto; }
.pn-grid {
  margin-top: 1.5rem;
  display: grid; grid-template-columns: 1fr; gap: 1.5rem;
}
@media(min-width:1100px){
  .pn-grid { grid-template-columns: minmax(0,1fr) 300px; gap: 1.75rem; align-items: start; }
}

.pn-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 18px; overflow: hidden;
  box-shadow: var(--shadow-md);
}

.pn-stats {
  display: grid; grid-template-columns: repeat(4,1fr);
  border-bottom: 1.5px solid var(--border);
}
.pn-stat {
  padding: 1rem .75rem; text-align: center;
  border-right: 1.5px solid var(--border);
}
.pn-stat:last-child { border-right: none; }
.pn-stat-val { font-size: 1.15rem; font-weight: 800; color: var(--green); line-height: 1; font-variant-numeric: tabular-nums; }
.pn-stat-key { font-size: .55rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; margin-top: .3rem; }

.pn-section-label {
  font-size: .61rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted); margin-bottom: .75rem;
  display: flex; align-items: center; gap: .45rem;
}
.pn-section-label::after { content:''; flex:1; height:1px; background: var(--border); }

.pn-audience-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: .55rem; }
.pn-chip {
  display: flex; align-items: center; gap: .5rem;
  padding: .7rem .65rem; border-radius: 12px;
  border: 1.5px solid var(--border); background: var(--surface2);
  cursor: pointer; text-align: left; width: 100%;
  transition: border-color .18s, background .18s, box-shadow .18s;
}
.pn-chip:hover { border-color: var(--border2); background: var(--surface3); }
.pn-chip.active {
  border-color: var(--green); background: var(--green-light);
  box-shadow: 0 0 0 3px var(--green-ring);
}
.pn-chip-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); color: var(--muted);
  border: 1px solid var(--border);
}
.pn-chip.active .pn-chip-icon { background: var(--green); color: #fff; border-color: var(--green); }
.pn-chip-label { font-size: .74rem; font-weight: 700; color: var(--text2); line-height: 1.2; }
.pn-chip.active .pn-chip-label { color: var(--green-dark); }
.pn-chip-sub { font-size: .58rem; color: var(--muted); font-weight: 600; margin-top: 1px; }

.pn-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.pn-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .75rem; }

.pn-field { margin-bottom: 1rem; }
.pn-label {
  display: block; font-size: .68rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--text2); margin-bottom: .45rem;
}
.pn-input, .pn-textarea {
  width: 100%; padding: .8rem .95rem;
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: 12px; color: var(--text);
  font-family: inherit; font-size: .875rem; font-weight: 500;
  outline: none; resize: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.pn-input::placeholder, .pn-textarea::placeholder { color: var(--muted); }
.pn-input:focus, .pn-textarea:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px var(--green-ring);
  background: #fff;
}
.pn-char-counter {
  font-family: 'Fira Code', monospace;
  font-size: .68rem; color: var(--muted); text-align: right; margin-top: .25rem;
}
.pn-char-counter.warn { color: var(--amber); }

.pn-img-upload {
  width: 100%; padding: .95rem;
  border: 1.5px dashed var(--border2); border-radius: 12px;
  background: var(--surface2); cursor: pointer;
  display: flex; align-items: center; gap: .75rem;
  color: var(--text3); font-size: .82rem; font-weight: 600;
}
.pn-img-upload:hover { border-color: var(--green); background: var(--green-light); }
.pn-img-preview { position: relative; display: inline-block; margin-top: .5rem; }
.pn-img-preview img {
  height: 72px; border-radius: 10px; border: 1.5px solid var(--border2);
  object-fit: cover; display: block;
}
.pn-img-remove {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--danger); color: #fff; border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

.pn-footer {
  padding: .95rem 1.35rem; border-top: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: .75rem;
  background: var(--surface2); flex-wrap: wrap;
}
.pn-warning { display: flex; align-items: center; gap: .4rem; font-size: .68rem; color: var(--muted); font-weight: 600; }
.pn-btn {
  display: inline-flex; align-items: center; gap: .55rem;
  padding: .72rem 1.45rem; border-radius: 12px;
  background: var(--green); color: #fff;
  font-family: inherit; font-weight: 700; font-size: .85rem;
  border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(39,174,96,.35);
}
.pn-btn:hover:not(:disabled) { background: var(--green-dark); }
.pn-btn:disabled { opacity: .5; cursor: not-allowed; }
.pn-btn-ghost {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .55rem .85rem; border-radius: 10px;
  background: transparent; border: 1.5px solid var(--border);
  color: var(--text2); font-family: inherit; font-weight: 700; font-size: .75rem;
  cursor: pointer;
}
.pn-btn-ghost:hover { background: var(--surface3); border-color: var(--border2); }

.pn-alert {
  display: flex; align-items: flex-start; gap: .75rem;
  padding: .9rem 1.1rem; border-radius: 14px;
  font-size: .82rem; font-weight: 600; margin-bottom: 1rem;
  border: 1.5px solid;
}
.pn-alert.success { background: var(--green-light); border-color: var(--border2); color: var(--green-dark); }
.pn-alert.error   { background: var(--danger-bg);   border-color: var(--danger-bdr); color: var(--danger); }

.pn-form-body { padding: 1.35rem; }

.pn-phone-wrap { display: flex; flex-direction: column; align-items: center; position: sticky; top: 1rem; }
.pn-preview-label {
  display: flex; align-items: center; gap: .45rem;
  font-size: .63rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 1rem;
}
.pn-phone {
  width: 230px; background: #f0f6f2; border-radius: 40px;
  border: 7px solid #dce9e1;
  box-shadow: 0 0 0 1px #c8dece, 0 28px 60px rgba(39,174,96,.13);
  overflow: hidden;
}
.pn-notch {
  width: 88px; height: 22px; background: #dce9e1;
  border-radius: 0 0 14px 14px; margin: 0 auto .4rem;
}
.pn-statusbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: .5rem 1.1rem .35rem;
}
.pn-time { font-size: .72rem; font-weight: 700; color: var(--text); }
.pn-icons { display: flex; align-items: center; gap: .3rem; color: var(--text2); }
.pn-wallpaper {
  margin: 0 .7rem; border-radius: 18px;
  background: linear-gradient(160deg, #e4f5ec 0%, #cde8d9 100%);
  padding: .65rem; min-height: 190px; border: 1px solid var(--border2);
}
.pn-notif-card {
  background: rgba(255,255,255,.9); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.95);
  border-radius: 14px; padding: .75rem;
  box-shadow: 0 2px 12px rgba(39,174,96,.09);
}
.pn-notif-top { display: flex; align-items: center; gap: .4rem; margin-bottom: .35rem; }
.pn-notif-app-icon {
  width: 18px; height: 18px; border-radius: 5px; background: var(--green);
  display: flex; align-items: center; justify-content: center;
}
.pn-notif-app { font-size: .57rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .06em; }
.pn-notif-time { font-size: .57rem; color: var(--muted); margin-left: auto; }
.pn-notif-title { font-size: .77rem; font-weight: 700; color: var(--text); margin-bottom: .18rem; line-height: 1.3; }
.pn-notif-body { font-size: .69rem; color: var(--text2); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.pn-notif-img { width: 100%; border-radius: 8px; margin-top: .5rem; object-fit: cover; max-height: 72px; display: block; }
.pn-empty-title { color: var(--muted); font-style: italic; }
.pn-empty-body  { color: #b7d9c4; font-style: italic; }
.pn-live-badge {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .3rem .75rem; border-radius: 99px;
  background: var(--green-light); border: 1px solid var(--border2);
  font-size: .62rem; font-weight: 700; color: var(--green-dark);
  letter-spacing: .06em; text-transform: uppercase; margin-top: 1rem;
}
.pn-live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pn-blink 1s infinite; }

.pn-meta {
  margin-top: .85rem; width: 100%;
  border: 1.5px solid var(--border); border-radius: 14px;
  background: var(--surface); padding: .85rem;
}
.pn-meta-row {
  display: flex; justify-content: space-between; gap: .5rem;
  font-size: .68rem; font-weight: 600; color: var(--text3);
  padding: .2rem 0;
}
.pn-meta-row strong { color: var(--text2); font-weight: 700; text-align: right; }

.pn-history { margin-top: 1.25rem; }
.pn-history-head {
  display: flex; align-items: center; justify-content: space-between; gap: .75rem;
  padding: 1rem 1.25rem; border-bottom: 1.5px solid var(--border);
}
.pn-history-title {
  display: flex; align-items: center; gap: .45rem;
  font-size: .8rem; font-weight: 800; color: var(--text);
}
.pn-history-list { max-height: 360px; overflow: auto; }
.pn-history-item {
  display: grid; gap: .35rem;
  padding: .95rem 1.25rem; border-bottom: 1px solid var(--border);
}
.pn-history-item:last-child { border-bottom: none; }
.pn-history-item:hover { background: var(--surface2); }
.pn-history-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem;
}
.pn-history-name { font-size: .82rem; font-weight: 700; color: var(--text); line-height: 1.3; }
.pn-history-body { font-size: .72rem; color: var(--text3); line-height: 1.4; }
.pn-pill {
  display: inline-flex; align-items: center; gap: .25rem;
  padding: .18rem .5rem; border-radius: 999px;
  font-size: .58rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
  background: var(--green-light); color: var(--green-dark); border: 1px solid var(--border2);
  white-space: nowrap;
}
.pn-pill.muted { background: var(--surface3); color: var(--text3); }
.pn-pill.warn { background: var(--amber-bg); color: var(--amber); border-color: #fde68a; }
.pn-history-meta {
  display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .2rem;
}
.pn-empty-history {
  padding: 2rem 1.25rem; text-align: center; color: var(--muted);
  font-size: .8rem; font-weight: 600;
}

@media(max-width:900px){
  .pn-audience-grid { grid-template-columns: repeat(3,1fr); }
  .pn-row3 { grid-template-columns: 1fr; }
  .pn-stats { grid-template-columns: repeat(2,1fr); }
  .pn-stat:nth-child(2) { border-right: none; }
  .pn-stat:nth-child(1), .pn-stat:nth-child(2) { border-bottom: 1.5px solid var(--border); }
}
@media(max-width:560px){
  .pn-audience-grid { grid-template-columns: 1fr 1fr; }
  .pn-row2 { grid-template-columns: 1fr; }
}
`;

const BODY_MAX = 180;

/** Backend: owner + user both map to role `user` — keep Owners only (no duplicate Users chip). */
const AUDIENCES = [
  { value: "all", label: "All Users", desc: "Everyone with FCM", icon: Users },
  { value: "agent", label: "Agents", desc: "Field agents", icon: UserCheck },
  { value: "builder", label: "Builders", desc: "Builder accounts", icon: Building2 },
  { value: "owner", label: "Owners", desc: "Owner / end users", icon: Home },
];

const STATE_OPTIONS = INDIAN_STATES.map((s) => ({
  value: s.name,
  label: s.name,
  isoCode: s.isoCode,
}));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: ".875rem",
    fontWeight: 500,
    background: "#f6fdf9",
    borderColor: state.isFocused ? "#27AE60" : "#d4eddd",
    borderWidth: "1.5px",
    borderRadius: "12px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(39,174,96,.18)" : "none",
    minHeight: "44px",
    "&:hover": { borderColor: "#b7dfca" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "12px",
    border: "1.5px solid #d4eddd",
    boxShadow: "0 8px 32px rgba(39,174,96,.12)",
    overflow: "hidden",
    zIndex: 99,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: ".875rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 500,
    background: state.isSelected ? "#27AE60" : state.isFocused ? "#eafaf1" : "#fff",
    color: state.isSelected ? "#fff" : "#0f2d1c",
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "#0f2d1c" }),
  placeholder: (base) => ({ ...base, color: "#9ec9ad" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#9ec9ad" }),
  clearIndicator: (base) => ({
    ...base,
    color: "#9ec9ad",
    "&:hover": { color: "#dc2626" },
  }),
};

const EMPTY_FORM = {
  title: "",
  body: "",
  audience: "all",
  state: null,
  city: null,
  locality: "",
  image: null,
};

const isCampaignItem = (item) =>
  Boolean(
    item?.successCount != null ||
      item?.failureCount != null ||
      item?.totalUsers != null ||
      item?.campaignId ||
      item?.filters,
  );

const audienceLabel = (value) => {
  const key = String(value || "all").toLowerCase();
  return AUDIENCES.find((a) => a.value === key)?.label || key || "Custom";
};

const formatWhen = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
};

const unpackFeed = (response) => {
  const payload = response?.data?.data ?? response?.data ?? [];
  const summary = response?.data?.summary ?? response?.summary ?? {};
  return {
    items: Array.isArray(payload) ? payload : [],
    summary,
  };
};

const SendPushNotification = () => {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [lastResult, setLastResult] = useState(null);

  const feedQuery = useQuery({
    queryKey: ["admin-push-notification-feed"],
    queryFn: async () => {
      const response = await getAdminNotificationFeed({ limit: 50 });
      return unpackFeed(response);
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!feedQuery.isSuccess) return;
    markAdminNotificationsSeen().catch(() => {});
  }, [feedQuery.isSuccess, feedQuery.dataUpdatedAt]);

  const campaigns = useMemo(
    () => (feedQuery.data?.items || []).filter(isCampaignItem),
    [feedQuery.data],
  );

  const stats = useMemo(() => {
    const delivered = campaigns.reduce(
      (sum, c) => sum + Number(c.successCount || 0),
      0,
    );
    const failed = campaigns.reduce(
      (sum, c) => sum + Number(c.failureCount || 0),
      0,
    );
    return {
      campaigns: campaigns.length,
      delivered,
      failed,
      audiences: AUDIENCES.length,
    };
  }, [campaigns]);

  const cityOptions = useMemo(() => {
    if (!formData.state?.value) return [];
    return getCitiesByState(formData.state.value).map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, [formData.state]);

  const selectedAudience = AUDIENCES.find((a) => a.value === formData.audience);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("body", formData.body.trim());
      fd.append("audience", formData.audience || "all");
      if (formData.state?.value) fd.append("state", formData.state.value);
      if (formData.city?.value) fd.append("city", formData.city.value);
      if (formData.locality?.trim()) fd.append("locality", formData.locality.trim());
      if (formData.image?.file) fd.append("image", formData.image.file);
      const response = await adminCustomNotification(fd);
      return response?.data ?? response;
    },
    onSuccess: (data) => {
      const ok = Number(data?.successCount || 0);
      const fail = Number(data?.failureCount || 0);
      const total = Number(data?.totalUsers || ok + fail);
      setLastResult({ ok, fail, total, campaignId: data?.campaignId });
      setStatus({
        type: "success",
        message: `Delivered to ${ok.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")} devices${
          fail ? ` · ${fail} failed` : ""
        }.`,
      });
      toast.success(`Push delivered to ${ok} user${ok === 1 ? "" : "s"}`);
      setFormData(EMPTY_FORM);
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["admin-push-notification-feed"] });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to dispatch notification.";
      setStatus({ type: "error", message });
      toast.error(message);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "body" && value.length > BODY_MAX) return;
    setFormData((p) => ({ ...p, [name]: value }));
    setStatus({ type: "", message: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image must be under 1 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) =>
      setFormData((p) => ({
        ...p,
        image: { dataUrl: ev.target.result, name: file.name, file },
      }));
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((p) => ({ ...p, image: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      setStatus({ type: "error", message: "Title and message are required." });
      return;
    }
    sendMutation.mutate();
  };

  const bodyLen = formData.body.length;
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const loading = sendMutation.isPending;
  const locationSummary = [
    formData.locality?.trim(),
    formData.city?.value,
    formData.state?.value,
  ]
    .filter(Boolean)
    .join(", ") || "All locations";

  return (
    <>
      <style>{STYLES}</style>
      <div className="pn-root">
        <div className="pn-shell">
          <div className="pn-eyebrow">
            <div className="pn-dot" /> Campaign Manager
          </div>
          <h1 className="pn-title">
            Push <span>Notifications</span>
          </h1>
          <p className="pn-sub">
            Broadcast via FCM — filter by audience role and optional state / city / locality
          </p>

          <div className="pn-grid">
            <div>
              <AnimatePresence>
                {status.message ? (
                  <motion.div
                    key="alert"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`pn-alert ${status.type}`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle2 size={17} className="shrink-0" />
                    ) : (
                      <AlertCircle size={17} className="shrink-0" />
                    )}
                    <span>{status.message}</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="pn-card">
                <div className="pn-stats">
                  <div className="pn-stat">
                    <div className="pn-stat-val">
                      {stats.campaigns.toLocaleString("en-IN")}
                    </div>
                    <div className="pn-stat-key">Campaigns</div>
                  </div>
                  <div className="pn-stat">
                    <div className="pn-stat-val">
                      {stats.delivered.toLocaleString("en-IN")}
                    </div>
                    <div className="pn-stat-key">Delivered</div>
                  </div>
                  <div className="pn-stat">
                    <div className="pn-stat-val">{stats.audiences}</div>
                    <div className="pn-stat-key">Audiences</div>
                  </div>
                  <div className="pn-stat">
                    <div className="pn-stat-val">
                      {lastResult
                        ? lastResult.ok.toLocaleString("en-IN")
                        : "●"}
                    </div>
                    <div className="pn-stat-key">
                      {lastResult ? "Last send" : "Live"}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="pn-form-body">
                    <div style={{ marginBottom: "1.35rem" }}>
                      <div className="pn-section-label">
                        <Radio size={11} /> Target audience
                      </div>
                      <div className="pn-audience-grid">
                        {AUDIENCES.map((item) => {
                          const Icon = item.icon;
                          const active = formData.audience === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              className={`pn-chip ${active ? "active" : ""}`}
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  audience: item.value,
                                }))
                              }
                            >
                              <div className="pn-chip-icon">
                                <Icon size={14} />
                              </div>
                              <div>
                                <div className="pn-chip-label">{item.label}</div>
                                <div className="pn-chip-sub">{item.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginBottom: "1.35rem" }}>
                      <div className="pn-section-label">
                        <MapPin size={11} /> Location filter
                        <span
                          style={{
                            fontSize: ".58rem",
                            fontWeight: 500,
                            marginLeft: ".25rem",
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          (optional — matches user profile)
                        </span>
                      </div>
                      <div className="pn-row3">
                        <div className="pn-field" style={{ marginBottom: 0 }}>
                          <label className="pn-label">State</label>
                          <Select
                            options={STATE_OPTIONS}
                            value={formData.state}
                            onChange={(opt) =>
                              setFormData((p) => ({
                                ...p,
                                state: opt,
                                city: null,
                              }))
                            }
                            placeholder="All states…"
                            isClearable
                            styles={selectStyles}
                            classNamePrefix="pn-sel"
                          />
                        </div>
                        <div className="pn-field" style={{ marginBottom: 0 }}>
                          <label className="pn-label">City</label>
                          <Select
                            options={cityOptions}
                            value={formData.city}
                            onChange={(opt) =>
                              setFormData((p) => ({ ...p, city: opt }))
                            }
                            placeholder={
                              formData.state ? "All cities…" : "Pick state first…"
                            }
                            isDisabled={!formData.state}
                            isClearable
                            styles={selectStyles}
                            classNamePrefix="pn-sel"
                          />
                        </div>
                        <div className="pn-field" style={{ marginBottom: 0 }}>
                          <label className="pn-label">Locality</label>
                          <input
                            className="pn-input"
                            name="locality"
                            value={formData.locality}
                            onChange={handleChange}
                            placeholder="e.g. Kondapur"
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pn-section-label">
                      <Zap size={11} /> Notification content
                    </div>

                    <div className="pn-field">
                      <label className="pn-label">Title</label>
                      <input
                        className="pn-input"
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. New listings in your area"
                        autoComplete="off"
                        maxLength={120}
                      />
                    </div>

                    <div className="pn-field">
                      <label className="pn-label">Message</label>
                      <textarea
                        className="pn-textarea"
                        name="body"
                        required
                        rows={4}
                        value={formData.body}
                        onChange={handleChange}
                        placeholder="Write the push message users will see…"
                      />
                      <div
                        className={`pn-char-counter ${
                          bodyLen > BODY_MAX * 0.85 ? "warn" : ""
                        }`}
                      >
                        {bodyLen} / {BODY_MAX}
                      </div>
                    </div>

                    <div className="pn-field" style={{ marginBottom: 0 }}>
                      <label className="pn-label">
                        Image{" "}
                        <span
                          style={{
                            fontWeight: 500,
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          (optional · max 1 MB)
                        </span>
                      </label>
                      {!formData.image ? (
                        <div
                          className="pn-img-upload"
                          onClick={() => fileRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              fileRef.current?.click();
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <ImagePlus size={18} />
                          <span>Attach image for rich push</span>
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                        </div>
                      ) : (
                        <div className="pn-img-preview">
                          <img src={formData.image.dataUrl} alt="preview" />
                          <button
                            type="button"
                            className="pn-img-remove"
                            onClick={removeImage}
                            aria-label="Remove image"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pn-footer">
                    <div className="pn-warning">
                      <AlertCircle size={13} />
                      Sends only to active users with a saved FCM token
                    </div>
                    <button className="pn-btn" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          <Send size={15} /> Dispatch campaign
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="pn-card pn-history">
                <div className="pn-history-head">
                  <div className="pn-history-title">
                    <History size={15} /> Campaign history
                  </div>
                  <button
                    type="button"
                    className="pn-btn-ghost"
                    onClick={() => feedQuery.refetch()}
                    disabled={feedQuery.isFetching}
                  >
                    {feedQuery.isFetching ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    Refresh
                  </button>
                </div>

                <div className="pn-history-list">
                  {feedQuery.isLoading ? (
                    <div className="pn-empty-history">
                      <Loader2 size={18} className="mx-auto mb-2 animate-spin" />
                      Loading campaigns…
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="pn-empty-history">
                      <Megaphone size={22} className="mx-auto mb-2 opacity-50" />
                      No campaigns yet. Dispatch your first push above.
                    </div>
                  ) : (
                    campaigns.map((item) => {
                      const ok = Number(item.successCount || 0);
                      const fail = Number(item.failureCount || 0);
                      const filters = item.filters || {};
                      const place = [filters.locality, filters.city, filters.state]
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <article
                          key={String(item._id || item.campaignId || item.createdAt + item.title)}
                          className="pn-history-item"
                        >
                          <div className="pn-history-top">
                            <div>
                              <div className="pn-history-name">
                                {item.title || "Untitled campaign"}
                              </div>
                              <div className="pn-history-body">
                                {item.body || "—"}
                              </div>
                            </div>
                            <span className="pn-pill">
                              {audienceLabel(item.audience || item.role)}
                            </span>
                          </div>
                          <div className="pn-history-meta">
                            <span className="pn-pill">
                              {ok.toLocaleString("en-IN")} delivered
                            </span>
                            {fail > 0 ? (
                              <span className="pn-pill warn">
                                {fail.toLocaleString("en-IN")} failed
                              </span>
                            ) : null}
                            {place ? (
                              <span className="pn-pill muted">{place}</span>
                            ) : (
                              <span className="pn-pill muted">All locations</span>
                            )}
                            <span className="pn-pill muted">
                              {formatWhen(item.createdAt)}
                            </span>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="pn-phone-wrap">
              <div className="pn-preview-label">
                <Smartphone size={13} /> Live preview
              </div>
              <div className="pn-phone">
                <div className="pn-notch" />
                <div className="pn-statusbar">
                  <span className="pn-time">{now}</span>
                  <div className="pn-icons">
                    <Signal size={11} />
                    <Wifi size={11} />
                    <Battery size={11} />
                  </div>
                </div>
                <div style={{ padding: "0 .7rem 1.25rem" }}>
                  <div className="pn-wallpaper">
                    <motion.div
                      key={
                        formData.title +
                        formData.body +
                        (formData.image?.dataUrl || "")
                      }
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className="pn-notif-card"
                    >
                      <div className="pn-notif-top">
                        <div className="pn-notif-app-icon">
                          <Bell size={10} color="#fff" />
                        </div>
                        <span className="pn-notif-app">Propenu</span>
                        <span className="pn-notif-time">now</span>
                      </div>
                      <div
                        className={`pn-notif-title ${
                          !formData.title ? "pn-empty-title" : ""
                        }`}
                      >
                        {formData.title || "Your title here"}
                      </div>
                      <div
                        className={`pn-notif-body ${
                          !formData.body ? "pn-empty-body" : ""
                        }`}
                      >
                        {formData.body ||
                          "Your message will appear here as you type…"}
                      </div>
                      {formData.image ? (
                        <img
                          src={formData.image.dataUrl}
                          alt=""
                          className="pn-notif-img"
                        />
                      ) : null}
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="pn-live-badge">
                <div className="pn-live-dot" /> Updates live
              </div>

              <div className="pn-meta">
                <div className="pn-meta-row">
                  <span>Audience</span>
                  <strong>{selectedAudience?.label || "All Users"}</strong>
                </div>
                <div className="pn-meta-row">
                  <span>Location</span>
                  <strong>{locationSummary}</strong>
                </div>
                <div className="pn-meta-row">
                  <span>Channel</span>
                  <strong>Firebase FCM</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendPushNotification;
