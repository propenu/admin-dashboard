// src/pages/EmailNotifications/modals/SendCampaignModal.jsx
import {
  Send, Search, MapPin, User, Phone, X,
  ChevronDown, Loader2, Check, Building2,
  Upload, FileSpreadsheet, Users, FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { State, City } from "country-state-city";
import {
  getUserSearch,
  sentEmailNotification,
  sentBulkEmailNotification,
} from "../../../features/user/userService";
import { Modal } from "./CreateModal.jsx";

// ─── Geo helpers ──────────────────────────────────────────
const IN_STATES        = State.getStatesOfCountry("IN");
const getCitiesByState = (code) => code ? City.getCitiesOfState("IN", code) : [];

const SEND_TABS = [
  { id: "users", label: "Select Users", icon: Users },
];

// ════════════════════════════════════════════════════════════
// CSV Upload Panel
// ════════════════════════════════════════════════════════════
const CsvUploadPanel = ({ item, onClose }) => {
  const [file,    setFile]    = useState(null);
  const [dragging,setDrag]    = useState(false);
  const [busy,    setBusy]    = useState(false);
  const inputRef              = useRef();

  const accept = (f) => {
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) {
      setFile(f);
    } else {
      toast.error("Please upload a .csv or .xlsx file");
    }
  };

  const handleSend = async () => {
    if (!file) { toast.error("Please upload a file first"); return; }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file",       file);
      fd.append("templateId", item._id);
      await sentBulkEmailNotification(fd);
      toast.success("Bulk email campaign started! 🚀");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk send failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Info note */}
      <div className="flex items-start gap-2 sm:gap-2.5 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <FileText size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Upload a <span className="font-bold">.csv</span> or{" "}
          <span className="font-bold">.xlsx</span> file. Template{" "}
          <span className="font-mono bg-blue-100 px-1 rounded">{item.slug}</span>{" "}
          will be sent to each row. Columns must match your template variables.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 py-6 sm:py-8 px-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          dragging || file
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50/50 active:bg-green-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => accept(e.target.files[0])}
        />
        {file ? (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-600 flex items-center justify-center shadow-sm shadow-green-200">
              <FileSpreadsheet size={24} className="text-white" />
            </div>
            <div className="text-center px-2">
              <p className="text-sm font-bold text-green-800 break-all">{file.name}</p>
              <p className="text-xs text-green-600 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB — ready to send
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={11} /> Remove file
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
              <Upload size={24} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Drop your CSV / Excel here</p>
              <p className="text-xs text-gray-400 mt-0.5">or tap to browse · .csv and .xlsx</p>
            </div>
          </>
        )}
      </div>

      {/* Send */}
      <button
        onClick={handleSend}
        disabled={busy || !file}
        className="w-full py-3 sm:py-3 bg-green-600 text-white font-bold text-sm rounded-2xl hover:bg-green-700 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-green-200"
      >
        {busy
          ? <><Loader2 size={15} className="animate-spin" /> Sending Campaign…</>
          : <><Send size={14} /> {file ? "Send Bulk Campaign" : "Upload File First"}</>}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Select Users Panel
// ════════════════════════════════════════════════════════════
const SelectUsersPanel = ({ item, onSend, sending, onClose }) => {
  const [nameSearch, setNameSearch] = useState("");
  const [locality,   setLocality]   = useState("");
  const [stateCode,  setStateCode]  = useState("");
  const [cityName,   setCityName]   = useState("");
  const [users,      setUsers]      = useState([]);
  const [loadingU,   setLoadingU]   = useState(false);
  const [fetched,    setFetched]    = useState(false);
  const [selectedIds,setSelected]   = useState([]);

  const cities = getCitiesByState(stateCode);

  useEffect(() => {
    (async () => {
      try {
        setLoadingU(true);
        const res = await getUserSearch("user");
        setUsers(res?.data?.results || res?.data || []);
        setFetched(true);
      } catch { toast.error("Failed to load users"); }
      finally   { setLoadingU(false); }
    })();
  }, []);

  useEffect(() => { setCityName(""); }, [stateCode]);

  const filtered = users.filter((u) => {
    const mName  = nameSearch.trim() ? (u.name     || "").toLowerCase().includes(nameSearch.toLowerCase()) : true;
    const mLoc   = locality.trim()   ? (u.locality  || "").toLowerCase().includes(locality.toLowerCase())  : true;
    const sName  = stateCode ? (IN_STATES.find((s) => s.isoCode === stateCode)?.name || "").toLowerCase() : "";
    const mState = stateCode ? (u.state || "").toLowerCase() === sName : true;
    const mCity  = cityName  ? (u.city  || "").toLowerCase() === cityName.toLowerCase() : true;
    return mName && mLoc && mState && mCity;
  });

  const localityOpts  = [...new Set(users.map((u) => u.locality).filter(Boolean))];
  const isAll         = filtered.length > 0 && filtered.every((u) => selectedIds.includes(u._id));
  const toggleUser    = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll     = () => {
    const ids = filtered.map((u) => u._id);
    isAll
      ? setSelected((p) => p.filter((id) => !ids.includes(id)))
      : setSelected((p) => [...new Set([...p, ...ids])]);
  };

  const hasFilters = nameSearch || locality || stateCode || cityName;

  // const handleSend = async () => {
  //   if (!selectedIds.length) { toast.error("Select at least one recipient"); return; }
  //   if (onSend) {
  //     onSend({ slug: item.slug, userIds: selectedIds });
  //   } else {
  //     try {
  //       await sentEmailNotification({ slug: item.slug, userIds: selectedIds });
  //       toast.success("Campaign sent!");
  //       onClose();
  //     } catch (err) { toast.error(err?.message || "Failed"); }
  //   }
  // };

  const handleSend = async () => {
    if (!filtered.length) {
      toast.error("No users found");
      return;
    }

    try {
      const allIds = filtered.map((u) => u._id); // ✅ ALL FILTERED USERS

      if (onSend) {
        onSend({ slug: item.slug, userIds: allIds });
      } else {
        await sentEmailNotification({
          slug: item.slug,
          userIds: allIds,
        });
        toast.success(`Campaign sent to ${allIds.length} users 🚀`);
        onClose();
      }
    } catch (err) {
      toast.error(err?.message || "Failed");
    }
  };
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500">
            Filter Recipients
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setNameSearch("");
                setLocality("");
                setStateCode("");
                setCityName("");
              }}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>

        {/* State + City row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 cursor-pointer pr-7"
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
              className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 cursor-pointer pr-7 disabled:opacity-40 disabled:cursor-not-allowed"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              disabled={!stateCode}
            >
              <option value="">
                {stateCode ? "All Cities" : "Select state first"}
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

        {/* Name + Locality row */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
          {/* <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300 bg-white"
              placeholder="Search by name…"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div> */}
          <div className="relative">
            <Building2
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              list="locality-options"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300 bg-white"
              placeholder="Filter by locality…"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
            <datalist id="locality-options">
              {localityOpts.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500">
            Recipients
            {fetched && (
              <span className="ml-1.5 font-mono text-green-600">
                {filtered.length} found
              </span>
            )}
          </p>
          {/* {filtered.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs font-semibold text-green-600 hover:text-green-800 transition-colors"
            >
              {isAll ? "Deselect all" : "Select all"}
            </button>
          )} */}
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          {loadingU ? (
            <div className="flex items-center justify-center py-8 sm:py-10">
              <Loader2 size={24} className="animate-spin text-green-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-2">
              <User size={24} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-400">
                {users.length === 0 ? "No users found" : "No users match"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-48 sm:max-h-52 overflow-y-auto overscroll-contain">
              {filtered.map((u) => {
                const sel = selectedIds.includes(u._id);
                const initials = (u.name || "?")[0].toUpperCase();
                return (
                  <div
                    key={u._id}
                    // onClick={() => toggleUser(u._id)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 cursor-pointer transition-colors select-none ${
                      sel
                        ? "bg-green-50"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    {/* Checkbox */}
                    {/* <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        sel
                          ? "bg-green-600 border-green-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {sel && (
                        <Check
                          size={9}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div> */}
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0 transition-colors ${
                        sel
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {initials}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                        {u.name || "—"}
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                        {u.phone && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                            <Phone size={8} />
                            {u.phone}
                          </span>
                        )}
                        {u.locality && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 hidden xs:flex">
                            <Building2 size={8} />
                            {u.locality}
                          </span>
                        )}
                        {(u.city || u.state) && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 hidden sm:flex">
                            <MapPin size={8} />
                            {[u.city, u.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    {u.city && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg flex-shrink-0 hidden xs:block ${
                          sel
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.city}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected summary */}
      {/* {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
          <Check size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-green-800">
            {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""}{" "}
            selected
          </p>
          <button
            onClick={() => setSelected([])}
            className="ml-auto text-xs text-green-600 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X size={11} /> Clear
          </button>
        </div>
      )} */}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || !filtered.length}
        className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-2xl hover:bg-green-700 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-green-200"
      >
        {sending ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send size={14} />
            {filtered.length > 0
              ? `Send to ${filtered.length} Users`
              : "No Users Found"}
          </>
        )}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Main Modal — exported
// ════════════════════════════════════════════════════════════
export const SendCampaignModal = ({ item, onClose, onSend, sending = false }) => {
  const [activeTab, setTab] = useState("users");

  return (
    <Modal title="Send Email Campaign" icon={<Send size={15} />} onClose={onClose}>
      <div className="flex flex-col gap-0">

        {/* Template banner */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-4 sm:mb-5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200">
            <Send size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Template</p>
            <p className="text-xs sm:text-sm font-semibold text-green-900 truncate">{item.name}</p>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-green-600 bg-white border border-green-200 px-1.5 sm:px-2 py-0.5 rounded-lg flex-shrink-0 hidden xs:block">
            {item.slug}
          </span>
        </div>

        {/* Sub-tabs — only render tabs bar if more than one tab */}
        {SEND_TABS.length > 1 && (
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-4 sm:mb-5">
            {SEND_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "users"
          ? <SelectUsersPanel item={item} onSend={onSend} sending={sending} onClose={onClose} />
          : <CsvUploadPanel   item={item} onClose={onClose} />}
      </div>
    </Modal>
  );
};