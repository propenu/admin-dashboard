// frontend/admin-dashboard/src/pages/users/AllUserInDetails/EachUserCompoents/Agents.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  getUserSearch,
  editAgentVerificationStatus,
  editAgent,
  postRegisteredAgent,
} from "../../../features/user/userService";
import {
  Mail, Phone, Shield, UsersIcon, ChevronDown, X,
  CheckCircle, Clock, XCircle, Loader2, MapPin, Building2,
  Star, Briefcase, Award, Languages, Search, Filter, SlidersHorizontal,
  Hash, CalendarDays, TrendingUp, Home, ChevronRight, Eye, User,
  FileText, Globe, Image, LinkIcon, BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

// ─── Profile Completion Check ──────────────────────────────────────────────
const isProfileCompleted = (agent) => {
  const d = agent.agentDetails || {};
  const requiredFields = [
    d.name,
    d.city,
    d.locality,
    d.experienceYears,
    d.dealsClosed,
    d.avatar?.url,
  ];
  return requiredFields.every(
    (field) => field !== undefined && field !== null && field !== ""
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const capitalize = (str = "") =>
  str.split(" ").map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const avatarShades = [
  { bg: "bg-[#e8f8ef]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
  { bg: "bg-[#d4f1e1]", text: "text-[#1e9e54]", border: "border-[#1e9e54]/20" },
  { bg: "bg-[#edfaf3]", text: "text-[#2ecc71]", border: "border-[#2ecc71]/20" },
  { bg: "bg-[#dcf5e8]", text: "text-[#219653]", border: "border-[#219653]/20" },
  { bg: "bg-[#c9eedb]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
];

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    icon: CheckCircle,

    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",

    dot: "bg-green-500",

    badgeBg: "bg-green-100",
    badgeBorder: "border-green-300",
    badgeText: "text-green-700",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",

    dot: "bg-amber-500",

    badgeBg: "bg-amber-100",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,

    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",

    dot: "bg-red-500",

    badgeBg: "bg-red-100",
    badgeBorder: "border-red-300",
    badgeText: "text-red-700",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG["pending"];

// ─── Verification Modal ────────────────────────────────────────────────────
const VerificationModal = ({ agent, onClose, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState(() => {
    const s = agent.verificationStatus?.toLowerCase();
    return s === "approved" || s === "rejected" ? s : "approved";
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");



  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await editAgentVerificationStatus(agent.agentId, { status: selectedStatus });
      onSave(agent.agentId, selectedStatus);
      toast.success("Verification status updated");
      onClose();
    } catch {
      toast.error("Failed to update status");
      setError("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ animation: "modalIn 0.25s ease both" }}>
        <div className="h-1 w-full bg-gradient-to-r from-[#27AE60] via-[#2ecc71] to-[#27AE60]/40" />
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <p className="text-[10px] text-gray-400 tracking-[2px] uppercase font-semibold mb-0.5">Edit Verification</p>
            <h2 className="text-gray-800 font-bold text-[16px] leading-tight">{capitalize(agent.name)}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 pb-2">
          <p className="text-[11px] text-gray-400 tracking-[1.5px] uppercase font-semibold mb-3">Select Status</p>
          <div className="flex flex-col gap-2">
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "pending").map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isSelected = selectedStatus === key;
              return (
                <button key={key} onClick={() => setSelectedStatus(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${isSelected ? `${cfg.bg} ${cfg.border} ${cfg.text}` : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}>
                  <Icon size={17} className={isSelected ? cfg.text : "text-gray-400"} />
                  <span className="font-semibold text-[13px]">{cfg.label}</span>
                  {isSelected && <span className="ml-auto w-2 h-2 rounded-full bg-current opacity-80" />}
                </button>
              );
            })}
          </div>
        </div>
        {error && (
          <div className="mx-6 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-red-500 text-[12px]">{error}</p>
          </div>
        )}
        <div className="flex gap-3 px-6 pt-4 pb-6">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#27AE60] text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(39,174,96,0.35)] hover:bg-[#219653] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : "Save Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Agent Detail Modal ────────────────────────────────────────────────────
const AgentDetailModal = ({ agent, onClose, onEditStatus, onEditProfile }) => {
  const d = agent.agentDetails || {};
  const statusCfg = getStatusConfig(agent.verificationStatus);
  const StatusIcon = statusCfg.icon;
  const palette = avatarShades[0];
  const profileCompleted = isProfileCompleted(agent);

  // Merge: agentDetails fields take priority, fall back to top-level agent fields
  const displayName   = d.name   || agent.name;
  const displayCity   = d.city   || agent.city;
  const displayLocality = d.locality || agent.locality;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: "modalIn 0.3s ease both" }}
      >
        {/* Cover */}
        {/* <div className="relative h-36 shrink-0 overflow-hidden">
          {d.coverImage?.url ? (
            <img src={d.coverImage.url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#27AE60,#1a9e54,#2ecc71)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X size={15} />
          </button>
        </div> */}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Cover */}
          <div className="relative h-36 overflow-hidden">
            {d.coverImage?.url ? (
              <img
                src={d.coverImage.url}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1a9e54,#2ecc71)",
                }}
              />
            )}
          </div>
          {/* Avatar + name */}
          <div className="px-6 pb-4 relative">
            <div className="flex items-end gap-4 z-20">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden shrink-0 bg-white">
                {d.avatar?.url ? (
                  <img
                    src={d.avatar.url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full ${palette.bg} ${palette.text} flex items-center justify-center text-2xl font-bold`}
                  >
                    {getInitials(displayName)}
                  </div>
                )}
              </div>
              <div className="pb-2 flex-1 min-w-0">
                <h2 className="text-gray-800 font-black text-xl leading-tight truncate">
                  {capitalize(displayName)}
                </h2>
                {d.agencyName && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 size={12} className="text-[#27AE60]" />
                    <span className="text-[#27AE60] text-xs font-semibold">
                      {d.agencyName}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`shrink-0 mb-2 inline-flex items-center gap-1.5 ${statusCfg.badgeBg} border ${statusCfg.badgeBorder} ${statusCfg.badgeText} text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full`}
              >
                <StatusIcon size={11} />
                {statusCfg.label}
              </div>
            </div>
          </div>

          <div className="px-6 space-y-5 pb-6">
            {/* Bio */}
            {d.bio && (
              <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-[#27AE60]/30 pl-3">
                {d.bio}
              </p>
            )}

            <div className="h-px bg-gradient-to-r from-[#27AE60]/20 to-transparent" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: <TrendingUp size={14} />,
                  label: "Experience",
                  value: d.experienceYears ? `${d.experienceYears} yrs` : "—",
                },
                {
                  icon: <Star size={14} />,
                  label: "Deals Closed",
                  value: d.dealsClosed ?? "—",
                },
                {
                  icon: <Home size={14} />,
                  label: "Properties",
                  value: d.stats?.totalProperties ?? "—",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#f0fdf4] border border-[#27AE60]/12 rounded-2xl p-3 text-center"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#27AE60]/15 flex items-center justify-center text-[#27AE60] mx-auto mb-2">
                    {s.icon}
                  </div>
                  <p className="text-lg font-black text-[#27AE60] leading-none">
                    {s.value}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-[#27AE60]/20 to-transparent" />

            {/* Contact & location — merges agent top-level + agentDetails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: <Mail size={13} />,
                  label: "Email",
                  value: agent.email,
                },
                {
                  icon: <Phone size={13} />,
                  label: "Phone",
                  value: agent.phone,
                },
                {
                  icon: <MapPin size={13} />,
                  label: "City",
                  value: displayCity,
                },
                {
                  icon: <MapPin size={13} />,
                  label: "Locality",
                  value: displayLocality,
                },
                {
                  icon: <MapPin size={13} />,
                  label: "State",
                  value: agent.state,
                },
                {
                  icon: <Hash size={13} />,
                  label: "Pincode",
                  value: agent.pincode,
                },
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#27AE60]/15 text-[#27AE60] flex items-center justify-center shrink-0">
                      {row.icon}
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {row.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="h-px bg-gradient-to-r from-[#27AE60]/20 to-transparent" />

            {/* License & RERA */}
            {(d.licenseNumber || d.rera?.reraAgentId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {d.licenseNumber && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={13} className="text-blue-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                        License
                      </p>
                    </div>
                    <p className="text-sm font-black text-gray-700">
                      {d.licenseNumber}
                    </p>
                    {d.licenseValidTill && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Valid till {formatDate(d.licenseValidTill)}
                      </p>
                    )}
                  </div>
                )}
                {d.rera?.reraAgentId && (
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={13} className="text-purple-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                        RERA
                      </p>
                    </div>
                    <p className="text-sm font-black text-gray-700">
                      {d.rera.reraAgentId}
                    </p>
                    <p className="text-[10px] mt-1 font-bold">
                      {d.rera.isVerified ? (
                        <span className="text-[#27AE60]">✓ Verified</span>
                      ) : (
                        <span className="text-amber-500">Unverified</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Languages & Areas */}
            {(d.languages?.filter(Boolean).length > 0 ||
              d.areasServed?.filter(Boolean).length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {d.languages?.filter(Boolean).length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Languages size={12} className="text-[#27AE60]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Languages
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.languages.filter(Boolean).map((l) => (
                        <span
                          key={l}
                          className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#27AE60]/20 text-[#27AE60] text-[10px] font-bold uppercase tracking-wider"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {d.areasServed?.filter(Boolean).length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} className="text-[#27AE60]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Areas Served
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.areasServed.filter(Boolean).map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            {d.createdAt && (
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <CalendarDays size={12} />
                <span>Joined {formatDate(d.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => onEditProfile(agent), 150);
              }}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
            >
              Edit Profile
            </button>
            <button
              disabled={!profileCompleted}
              onClick={() => {
                onClose();
                setTimeout(() => onEditStatus(agent), 150);
              }}
              className={`flex-1 py-3 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all
                ${profileCompleted ? "bg-[#27AE60] hover:bg-[#219653]" : "bg-gray-300 cursor-not-allowed"}`}
            >
              <Shield size={14} />
              {profileCompleted ? "Edit Verification" : "Profile Incomplete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Field Components for Edit Drawer ─────────────────────────────────────
const DrawerField = ({ label, icon, children, span2 = false }) => (
  <div className={span2 ? "md:col-span-2" : ""}>
    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
      <span className="text-[#27AE60]">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

const DrawerInput = ({ name, value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all placeholder:text-gray-300 text-gray-700 font-medium"
  />
);

// ─── Edit Agent Drawer (right-side slide-in) ───────────────────────────────
const EditAgentModal = ({ agent, onClose, fetchAgents }) => {
  const d = agent.agentDetails || {};
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");



  const [formData, setFormData] = useState({
    // agentDetails fields
    name:           d.name        || "",
    bio:            d.bio         || "",
    agencyName:     d.agencyName  || "",
    licenseNumber:  d.licenseNumber || "",
    city:           d.city        || agent.city   || "",
    locality:       d.locality    || agent.locality || "",
    experienceYears: d.experienceYears !== undefined ? String(d.experienceYears) : "",
    dealsClosed:    d.dealsClosed  !== undefined ? String(d.dealsClosed)  : "",
    languages:      (d.languages  || []).filter(Boolean).join(", "),
    areasServed:    (d.areasServed || []).filter(Boolean).join(", "),
    avatarUrl:      d.avatar?.url      || "",
    coverImageUrl:  d.coverImage?.url  || "",
    reraAgentId:    d.rera?.reraAgentId || "",
    reraVerified:   d.rera?.isVerified  || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  
 const handleSave = async () => {
   try {
     setSaving(true);

     const data = new FormData();

     data.append("name", formData.name);
     data.append("bio", formData.bio);
     data.append("agencyName", formData.agencyName);
     data.append("licenseNumber", formData.licenseNumber);
     data.append("city", formData.city);
     data.append("locality", formData.locality);

     data.append(
       "experienceYears",
       String(Number(formData.experienceYears) || 0),
     );

     data.append("dealsClosed", String(Number(formData.dealsClosed) || 0));

     // Arrays
     formData.languages
       .split(",")
       .map((x) => x.trim())
       .filter(Boolean)
       .forEach((lang) => {
         data.append("languages[]", lang);
       });

     formData.areasServed
       .split(",")
       .map((x) => x.trim())
       .filter(Boolean)
       .forEach((area) => {
         data.append("areasServed[]", area);
       });

     // RERA
     // data.append("reraAgentId", formData.reraAgentId);
     // data.append("reraVerified", formData.reraVerified);
     // RERA
     data.append("rera[reraAgentId]", formData.reraAgentId);
     data.append("rera[isVerified]", String(formData.reraVerified));



     // Images
     if (formData.avatarFile) {
       data.append("avatar", formData.avatarFile);
     }

     if (formData.coverFile) {
       data.append("coverImage", formData.coverFile);
     }

     console.log("Agent ID:", agent.agentId );

    // await editAgent(agent.agentId, data);
    //await editAgent(agent._id, data);
    const hasAgentProfile =
      agent.agentDetails && Object.keys(agent.agentDetails).length > 0;

    if (hasAgentProfile) {
      await editAgent(agent._id, data);
    } else {
      data.append("user", agent.agentId);
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }

      await postRegisteredAgent(data);
    }

     toast.success("Agent profile updated successfully");

     fetchAgents();

     onClose();
   } catch (error) {
     console.error(error);
     toast.error("Failed to update agent profile");
   } finally {
     setSaving(false);
   }
 };

  const sections = [
    { id: "basic",    label: "Basic Info",  icon: <User size={13} /> },
    { id: "location", label: "Location",    icon: <MapPin size={13} /> },
    { id: "media",    label: "Media",       icon: <Image size={13} /> },
    { id: "pro",      label: "Professional",icon: <Award size={13} /> },
  ];
  
 const handleImageUpload = (e, type) => {
   const file = e.target.files?.[0];

   if (!file) return;

   // Allow only images
   if (!file.type.startsWith("image/")) {
     toast.error("Please select a valid image file");
     e.target.value = "";
     return;
   }

   // 1 MB validation
   const maxSize = 1 * 1024 * 1024;

   if (file.size > maxSize) {
     const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

     toast.error(`Image size is ${sizeMB} MB. Maximum allowed size is 1 MB`);

     e.target.value = "";
     return;
   }

   // Create preview URL
   const previewUrl = URL.createObjectURL(file);

   setFormData((prev) => ({
     ...prev,
     ...(type === "avatar"
       ? {
           avatarFile: file, // actual file for backend upload
           avatarPreview: previewUrl, // local preview
         }
       : {
           coverFile: file, // actual file for backend upload
           coverPreview: previewUrl, // local preview
         }),
   }));

   toast.success(
     `${type === "avatar" ? "Avatar" : "Cover"} image selected successfully`,
   );
 };


  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease both" }}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col"
        style={{ animation: "drawerIn 0.32s cubic-bezier(0.32,0.72,0,1) both" }}
      >
        {/* Header */}
        <div className="shrink-0">
          <div className="h-1 w-full bg-gradient-to-r from-[#27AE60] via-[#2ecc71] to-[#27AE60]/40" />
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#27AE60]/20 flex items-center justify-center">
                {formData.avatarPreview || formData.avatarUrl ? (
                  <img
                    src={formData.avatarPreview || formData.avatarUrl}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#27AE60] font-black text-sm">
                    {getInitials(agent.name)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 tracking-[2px] uppercase font-semibold">
                  Edit Agent Profile
                </p>
                <h2 className="text-gray-800 font-black text-[15px] leading-tight">
                  {capitalize(agent.name)}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all"
            >
              <X size={15} />
            </button>
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-gray-100 px-2 bg-white">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap
                  ${
                    activeSection === s.id
                      ? "border-[#27AE60] text-[#27AE60]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* ── Basic Info ── */}
          {activeSection === "basic" && (
            <div className="grid md:grid-cols-2 gap-5">
              <DrawerField label="Full Name" icon={<User size={11} />}>
                <DrawerInput
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Agent's full name"
                />
              </DrawerField>

              <DrawerField label="Agency Name" icon={<Building2 size={11} />}>
                <DrawerInput
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  placeholder="Agency / Brokerage name"
                />
              </DrawerField>

              <DrawerField
                label="Experience (Years)"
                icon={<TrendingUp size={11} />}
              >
                <DrawerInput
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  type="number"
                />
              </DrawerField>

              <DrawerField label="Deals Closed" icon={<Star size={11} />}>
                <DrawerInput
                  name="dealsClosed"
                  value={formData.dealsClosed}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                  type="number"
                />
              </DrawerField>

              <DrawerField
                label="Languages (comma separated)"
                icon={<Languages size={11} />}
                span2
              >
                <DrawerInput
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="Telugu, Hindi, English"
                />
              </DrawerField>

              <DrawerField label="Bio" icon={<FileText size={11} />} span2>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Short professional bio…"
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all placeholder:text-gray-300 text-gray-700 font-medium resize-none"
                />
              </DrawerField>
            </div>
          )}

          {/* ── Location ── */}
          {activeSection === "location" && (
            <div className="grid md:grid-cols-2 gap-5">
              <DrawerField label="City" icon={<Building2 size={11} />}>
                <DrawerInput
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Hyderabad"
                />
              </DrawerField>

              <DrawerField label="Locality" icon={<MapPin size={11} />}>
                <DrawerInput
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Madhapur"
                />
              </DrawerField>

              <DrawerField
                label="Areas Served (comma separated)"
                icon={<Globe size={11} />}
                span2
              >
                <DrawerInput
                  name="areasServed"
                  value={formData.areasServed}
                  onChange={handleChange}
                  placeholder="Banjara Hills, Jubilee Hills, HITEC City"
                />
              </DrawerField>

              {/* Read-only top-level location info */}
              <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                  Registered Account Location
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "State", value: agent.state },
                    { label: "City", value: agent.city },
                    { label: "Pincode", value: agent.pincode },
                  ].map((r) => (
                    <div key={r.label}>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                        {r.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {r.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Media ── */}
          {activeSection === "media" && (
            <div className="space-y-5">
              {/* Avatar preview + url */}
              <div className="bg-[#f8fffe] border border-[#27AE60]/12 rounded-2xl p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-[#27AE60]/20 overflow-hidden bg-white shrink-0">
                    {formData.avatarPreview || formData.avatarUrl ? (
                      <img
                        src={formData.avatarPreview || formData.avatarUrl}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#e8f8ef] flex items-center justify-center text-[#27AE60] font-black text-xl">
                        {getInitials(agent.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-700">
                      Profile Avatar
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Paste a direct image URL below
                    </p>
                  </div>
                </div>
                {/* <DrawerField label="Avatar Image URL" icon={<LinkIcon size={11} />}>
                  <DrawerInput name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://..." />
                </DrawerField> */}
                <DrawerField label="Avatar Image">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "avatar")}
                    className="w-full"
                  />
                </DrawerField>
              </div>

              {/* Cover preview + url */}
              <div className="bg-[#f8fffe] border border-[#27AE60]/12 rounded-2xl p-4">
                <div className="w-full h-24 rounded-xl border-2 border-[#27AE60]/15 overflow-hidden mb-4 bg-white">
                  {formData.coverPreview || formData.coverImageUrl ? (
                    <img
                      src={formData.coverPreview || formData.coverImageUrl}
                      alt="cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#27AE60]/10 to-[#27AE60]/5 flex items-center justify-center text-[#27AE60]/30">
                      <Image size={28} />
                    </div>
                  )}
                </div>
                {/* <DrawerField
                  label="Cover Image URL"
                  icon={<LinkIcon size={11} />}
                >
                  <DrawerInput
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </DrawerField> */}
                <DrawerField label="Cover Image">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "cover")}
                    className="w-full"
                  />
                </DrawerField>
              </div>
            </div>
          )}

          {/* ── Professional ── */}
          {activeSection === "pro" && (
            <div className="grid md:grid-cols-3 gap-5">
              <DrawerField
                label="License Number"
                icon={<Award size={11} />}
                span2
              >
                <DrawerInput
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g. MH/RERA/A12345"
                />
              </DrawerField>
              <DrawerField label="RERA Agent ID" icon={<Shield size={11} />}>
                <DrawerInput
                  name="reraAgentId"
                  value={formData.reraAgentId}
                  onChange={handleChange}
                  placeholder="RERA ID"
                />
              </DrawerField>

              {/* <DrawerField
                label="RERA Verified"
                icon={<BadgeCheck size={11} />}
              >
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#27AE60]/40 transition-all">
                  <input
                    type="checkbox"
                    name="reraVerified"
                    checked={formData.reraVerified}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#27AE60]"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {formData.reraVerified ? "Verified ✓" : "Not verified"}
                  </span>
                </label>
              </DrawerField> */}

              {/* Read-only account info */}
              <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                  Account Details (Read-only)
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: "Email", value: agent.email },
                    { label: "Phone", value: agent.phone },
                    { label: "Role", value: agent.role },
                    { label: "User ID", value: agent.userId || agent._id },
                  ]
                    .filter((r) => r.value)
                    .map((r) => (
                      <div key={r.label} className="flex items-center gap-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider w-16 shrink-0">
                          {r.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {r.value}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-white flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#27AE60] text-white text-sm font-black shadow-[0_4px_14px_rgba(39,174,96,0.35)] hover:bg-[#219653] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Agent Card ────────────────────────────────────────────────────────────
const AgentCard = ({ agent, index, onEditStatus, onViewDetail }) => {
  const d = agent.agentDetails || {};
  const palette = avatarShades[index % avatarShades.length];
  const statusCfg = getStatusConfig(agent.verificationStatus);
  const StatusIcon = statusCfg.icon;
  const profileCompleted = isProfileCompleted(agent);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)] hover:-translate-y-1.5 hover:border-[#27AE60]/25 transition-all duration-300 ease-out group flex flex-col"
      style={{
        animation: "cardIn 0.45s ease both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Cover */}
      <div className="relative h-28 overflow-hidden shrink-0">
        {d.coverImage?.url ? (
          <img
            src={d.coverImage.url}
            alt="cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#27AE60]/10 to-[#27AE60]/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* <div className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 ${statusCfg.badgeBg} backdrop-blur-sm border ${statusCfg.badgeBorder} ${statusCfg.badgeText} text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full`}>
          <StatusIcon size={9} />
          {statusCfg.label}
        </div> */}
        <div
          className={`
    absolute top-3 right-3
    inline-flex items-center gap-1.5
    px-3 py-1.5
    rounded-full
    border shadow-sm
    ${statusCfg.badgeBg}
    ${statusCfg.badgeBorder}
    ${statusCfg.badgeText}
    text-[10px] font-extrabold uppercase tracking-wide
  `}
        >
          <StatusIcon size={11} />
          {statusCfg.label}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 z-20 -mt-10">
          <div className="w-14 h-14 rounded-xl border-[3px] border-white shadow-md overflow-hidden shrink-0 bg-white">
            {d.avatar?.url ? (
              <img
                src={d.avatar.url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full ${palette.bg} ${palette.text} flex items-center justify-center text-base font-black`}
              >
                {getInitials(agent.name)}
              </div>
            )}
          </div>
          <div className="min-w-0 pt-7">
            <h2 className="text-gray-800 font-black text-[14px] truncate leading-tight">
              {capitalize(agent.name)}
            </h2>
            {d.agencyName && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 size={10} className="text-[#27AE60] shrink-0" />
                <span className="text-[#27AE60] text-[10px] font-bold truncate">
                  {d.agencyName}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-gray-100 via-[#27AE60]/10 to-transparent" />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: <Briefcase size={10} />,
              label: "Exp",
              value: d.experienceYears ? `${d.experienceYears}y` : "—",
            },
            {
              icon: <Star size={10} />,
              label: "Deals",
              value: d.dealsClosed ?? "—",
            },
            {
              icon: <Home size={10} />,
              label: "Props",
              value: d.stats?.publishedCount ?? "—",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center bg-[#f8fffe] border border-[#27AE60]/08 rounded-xl py-2"
            >
              <div className="flex items-center justify-center gap-0.5 text-[#27AE60] mb-0.5">
                {s.icon}
              </div>
              <p className="text-xs font-black text-gray-700 leading-none">
                {s.value}
              </p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          {agent.email && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12 text-[#27AE60] flex items-center justify-center shrink-0">
                <Mail size={11} />
              </div>
              <span className="text-gray-500 text-[11px] truncate">
                {agent.email}
              </span>
            </div>
          )}
          {agent.phone && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12 text-[#27AE60] flex items-center justify-center shrink-0">
                <Phone size={11} />
              </div>
              <span className="text-gray-500 text-[11px]">{agent.phone}</span>
            </div>
          )}
          {(agent.city || agent.state) && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12 text-[#27AE60] flex items-center justify-center shrink-0">
                <MapPin size={11} />
              </div>
              <span className="text-gray-500 text-[11px] truncate">
                {[agent.locality, agent.city, agent.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Languages */}
        {d.languages?.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {d.languages
              .filter(Boolean)
              .slice(0, 3)
              .map((l) => (
                <span
                  key={l}
                  className="px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#27AE60]/15 text-[#27AE60] text-[9px] font-bold uppercase"
                >
                  {l}
                </span>
              ))}
            {d.languages.filter(Boolean).length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold">
                +{d.languages.filter(Boolean).length - 3}
              </span>
            )}
          </div>
        )}

        {!profileCompleted && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <h3 className="text-amber-700 text-sm font-bold">
              Profile Incomplete
            </h3>
            <p className="text-xs text-amber-600 mt-1">
              Contact agent to fill profile details before approval.
            </p>
          </div>
        )}

        <div className="mt-auto pt-1 flex items-center gap-2">
          <button
            onClick={() => onViewDetail(agent)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[#27AE60]/20 text-[#27AE60] text-[11px] font-black hover:bg-[#f0fdf4] transition-all"
          >
            <Eye size={12} /> View Profile
          </button>
          <button
            disabled={!profileCompleted}
            onClick={() => onEditStatus(agent)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all
              ${
                profileCompleted
                  ? "bg-gray-50 border-gray-100 text-gray-400 hover:text-[#27AE60] hover:bg-[#f0faf5] hover:border-[#27AE60]/20"
                  : "bg-gray-200 border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            title={
              profileCompleted
                ? "Edit verification status"
                : "Profile incomplete"
            }
          >
            <Shield size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Bar ────────────────────────────────────────────────────────────
const FilterBar = ({ agents, filters, setFilters }) => {
  const states = useMemo(() => [...new Set(agents.map((a) => a.state).filter(Boolean))].sort(), [agents]);
  const cities = useMemo(() => {
    const base = agents.filter((a) => !filters.state || a.state === filters.state);
    return [...new Set(base.map((a) => a.city).filter(Boolean))].sort();
  }, [agents, filters.state]);
  const localities = useMemo(() => {
    const base = agents.filter((a) => (!filters.state || a.state === filters.state) && (!filters.city || a.city === filters.city));
    return [...new Set(base.map((a) => a.locality).filter(Boolean))].sort();
  }, [agents, filters.state, filters.city]);

  const activeCount = [filters.search, filters.state, filters.city, filters.locality, filters.pincode, filters.status].filter(Boolean).length;
  const clear = () => setFilters({ search: "", state: "", city: "", locality: "", pincode: "", status: "" });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#27AE60] transition-colors"
          />
        </div>
        {activeCount > 0 && (
          <button onClick={clear} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 text-xs font-bold hover:bg-red-100 transition-all shrink-0">
            <X size={12} /> Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <Select icon={<Shield size={12} />} placeholder="All Status" value={filters.status} onChange={(v) => setFilters((p) => ({ ...p, status: v }))} options={Object.entries(STATUS_CONFIG).map(([k, c]) => ({ value: k, label: c.label }))} />
        <Select icon={<MapPin size={12} />} placeholder="All States" value={filters.state} onChange={(v) => setFilters((p) => ({ ...p, state: v, city: "", locality: "" }))} options={states.map((s) => ({ value: s, label: s }))} />
        <Select icon={<Building2 size={12} />} placeholder="All Cities" value={filters.city} onChange={(v) => setFilters((p) => ({ ...p, city: v, locality: "" }))} options={cities.map((c) => ({ value: c, label: c }))} disabled={!filters.state} />
        <Select icon={<MapPin size={12} />} placeholder="All Localities" value={filters.locality} onChange={(v) => setFilters((p) => ({ ...p, locality: v }))} options={localities.map((l) => ({ value: l, label: l }))} disabled={!filters.city} />
        <div className="relative">
          <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pincode"
            value={filters.pincode}
            onChange={(e) => setFilters((p) => ({ ...p, pincode: e.target.value }))}
            className="w-full pl-8 pr-3 py-2.5 text-xs border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#27AE60] transition-colors"
          />
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#27AE60]/20 text-[#27AE60] text-[10px] font-bold uppercase tracking-wide">
              {k}: {v}
              <button onClick={() => setFilters((p) => ({ ...p, [k]: "" }))} className="hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const Select = ({ icon, placeholder, value, onChange, options, disabled }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full pl-8 pr-6 py-2.5 text-xs border-2 rounded-xl focus:outline-none transition-colors appearance-none
        ${disabled ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-200 focus:border-[#27AE60] bg-white text-gray-700"}
        ${value ? "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60] font-bold" : ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const AllAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [viewingAgent, setViewingAgent] = useState(null);
  const [editingProfileAgent, setEditingProfileAgent] = useState(null);
  const [filters, setFilters] = useState({ search: "", state: "", city: "", locality: "", pincode: "", status: "" });

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      const response = await getUserSearch("agent");
      setAgents(response?.data?.results || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSaved = (agentId, newStatus) => {
    setAgents((prev) =>
      prev.map((a) => a.agentId === agentId ? { ...a, verificationStatus: newStatus } : a)
    );
  };

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return agents.filter((a) => {
      if (q && !`${a.name} ${a.email} ${a.phone}`.toLowerCase().includes(q)) return false;
      if (filters.status && a.verificationStatus?.toLowerCase() !== filters.status) return false;
      if (filters.state && a.state !== filters.state) return false;
      if (filters.city && a.city !== filters.city) return false;
      if (filters.locality && a.locality !== filters.locality) return false;
      if (filters.pincode && !a.pincode?.includes(filters.pincode)) return false;
      return true;
    });
  }, [agents, filters]);

  // const counts = useMemo(() => ({
  //   approved: agents.filter((a) => a.verificationStatus?.toLowerCase() === "approved").length,
  //   pending:  agents.filter((a) => a.verificationStatus?.toLowerCase() === "pending").length,
  //   rejected: agents.filter((a) => a.verificationStatus?.toLowerCase() === "rejected").length,
  // }), [agents]);
  const counts = useMemo(
    () => ({
      approved: agents.filter(
        (a) => a.verificationStatus?.toLowerCase() === "approved",
      ).length,

      pending: agents.filter(
        (a) => a.verificationStatus?.toLowerCase() === "pending",
      ).length,

      rejected: agents.filter(
        (a) => a.verificationStatus?.toLowerCase() === "rejected",
      ).length,
    }),
    [agents],
  );

  return (
    <>
      <style>{`
        @keyframes cardIn    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotBounce { 0%,80%,100% { transform:scale(0.55); opacity:0.35; } 40% { transform:scale(1); opacity:1; } }
        @keyframes modalIn   { from { opacity:0; transform:scale(0.94) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes drawerIn  { from { transform:translateX(100%); } to { transform:translateX(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {editingAgent && (
        <VerificationModal
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={handleStatusSaved}
        />
      )}

      {viewingAgent && (
        <AgentDetailModal
          agent={viewingAgent}
          onClose={() => setViewingAgent(null)}
          onEditStatus={setEditingAgent}
          onEditProfile={setEditingProfileAgent}
        />
      )}

      {editingProfileAgent && (
        <EditAgentModal
          agent={editingProfileAgent}
          onClose={() => setEditingProfileAgent(null)}
          fetchAgents={fetchAgents}
        />
      )}

      <div className="min-h-screen bg-[#f5fcf8] px-4 sm:px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#27AE60]/20 shadow-[0_2px_8px_rgba(39,174,96,0.1)] flex items-center justify-center text-[#27AE60]">
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-[#000000] text-[10px] tracking-[3px] uppercase mb-0.5">Team Directory</p>
              <h1 className="text-[#27AE60] text-[22px] leading-none tracking-tight">All Agents</h1>
            </div>
          </div>
          {!loading && agents.length > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[36px] font-extrabold text-[#27AE60] leading-none">{agents.length.toString().padStart(2, "0")}</span>
              <span className="text-[10px] text-gray-400 tracking-[2px] uppercase font-medium">Total</span>
            </div>
          )}
        </div>
        <p className="text-[#000000] text-[13px] ml-[58px] mb-4">Manage and view all active agents</p>

        {/* Status summary pills */}
        {!loading && agents.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-[58px] mb-5">
            {Object.entries(counts).map(([key, count]) => {
              const cfg = STATUS_CONFIG[key];
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFilters((p) => ({ ...p, status: p.status === key ? "" : key }))}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all
                    ${filters.status === key ? `${cfg.bg} ${cfg.border} ${cfg.text}` : "bg-white border-gray-200 text-gray-500 hover:border-[#27AE60]/30"}`}
                >
                  <Icon size={10} /> {cfg.label} {count}
                </button>
              );
            })}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-[#27AE60]/25 via-[#27AE60]/8 to-transparent mb-5" />

        {/* Filter bar */}
        {!loading && agents.length > 0 && (
          <div className="mb-6">
            <FilterBar agents={agents} filters={filters} setFilters={setFilters} />
          </div>
        )}

        {/* States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full bg-[#27AE60]"
                  style={{ animation: "dotBounce 1.2s infinite ease-in-out", animationDelay: `${i * 0.18}s`, boxShadow: "0 0 6px rgba(39,174,96,0.4)" }} />
              ))}
            </div>
            <p className="text-[#27AE60]/50 text-[11px] tracking-[3px] uppercase font-semibold">Loading Agents…</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#27AE60]/15 shadow-sm flex items-center justify-center text-[#27AE60]">
              <UsersIcon size={28} />
            </div>
            <p className="text-gray-400 text-sm tracking-[2px] uppercase font-medium">No Agents Found</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-300">
              <Search size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold">No agents match your filters</p>
            <button
              onClick={() => setFilters({ search: "", state: "", city: "", locality: "", pincode: "", status: "" })}
              className="px-4 py-2 rounded-xl bg-[#27AE60] text-white text-xs font-bold shadow-[0_4px_12px_rgba(39,174,96,0.3)] hover:bg-[#219653] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">
              Showing {filtered.length} of {agents.length} agents
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((agent, idx) => (
                <AgentCard
                  key={agent._id || agent.agentId}
                  agent={agent}
                  index={idx}
                  onEditStatus={setEditingAgent}
                  onViewDetail={setViewingAgent}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AllAgents;