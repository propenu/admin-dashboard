
// import {
//   Send,
//   Search,
//   MapPin,
//   User,
//   Phone,
//   X,
//   ChevronDown,
//   Loader2,
//   Check,
//   Hash,
//   Building2,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { State, City } from "country-state-city";
// import {
//   getUserSearch,
//   sentEmailNotification,
// } from "../../../features/user/userService";
// import { Modal } from "./CreateModal";

// // ─── India states & cities via country-state-city ────//
// const IN_STATES = State.getStatesOfCountry("IN");
// const getCitiesByState = (stateCode) =>
//   stateCode ? City.getCitiesOfState("IN", stateCode) : [];

// // ════════════════════════════ //
// export const SendCampaignModal = ({
//   item,
//   onClose,
//   onSend,
//   sending = false,
// }) => {
//   // ── filter fields ───────────────────────────── //
//   const [nameSearch, setNameSearch] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [locality, setLocality] = useState("");
//   const [stateCode, setStateCode] = useState(""); // ISO code e.g. "AP"
//   const [cityName, setCityName] = useState(""); // city name string

//   // ── data ───────────────────────────────────────────── //
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [fetched, setFetched] = useState(false);

//   // ── selection ────────────────────────────────────────── //
//   const [selectedIds, setSelectedIds] = useState([]);

//   // derived cities list for selected state
//   const cities = getCitiesByState(stateCode);

//   // ── fetch all role=user on mount ───────────────────────── //
//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoadingUsers(true);
//         // getUserSearch(query) → GET /auth/search?role=user
//         const res = await getUserSearch("user");
//         const list = res?.data?.results || res?.data || [];
//         setUsers(list);
//         setFetched(true);
//       } catch {
//         toast.error("Failed to load users");
//       } finally {
//         setLoadingUsers(false);
//       }
//     };
//     load();
//   }, []);

//   // ── reset city when state changes ────────────────────────────────────────
//   useEffect(() => {
//     setCityName("");
//   }, [stateCode]);

//   // ── client-side filtering ─────────────────────────────────────────────────
//   const filtered = users.filter((u) => {
//     // name
//     const matchName = nameSearch.trim()
//       ? (u.name || "").toLowerCase().includes(nameSearch.trim().toLowerCase())
//       : true;

//     // pincode
//     const matchPincode = pincode.trim()
//       ? (u.pincode || "") === pincode.trim()
//       : true;

//     // locality
//     const matchLocality = locality.trim()
//       ? (u.locality || "").toLowerCase().includes(locality.trim().toLowerCase())
//       : true;

//     // state — compare full state name from ISO code against user.state string
//     const stateName = stateCode
//       ? (
//           IN_STATES.find((s) => s.isoCode === stateCode)?.name || ""
//         ).toLowerCase()
//       : "";
//     const matchState = stateCode
//       ? (u.state || "").toLowerCase() === stateName
//       : true;

//     // city
//     const matchCity = cityName
//       ? (u.city || "").toLowerCase() === cityName.toLowerCase()
//       : true;

//     return (
//       matchName && matchPincode && matchLocality && matchState && matchCity
//     );
//   });

//   // ── unique localities for datalist autocomplete ───────────────────────────
//   const localityOptions = [
//     ...new Set(users.map((u) => u.locality).filter(Boolean)),
//   ];

//   // ── selection helpers ─────────────────────────────────────────────────────
//   const toggleUser = (id) =>
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );

//   const isAllFilteredSelected =
//     filtered.length > 0 && filtered.every((u) => selectedIds.includes(u._id));

//   const toggleAll = () => {
//     const ids = filtered.map((u) => u._id);
//     if (isAllFilteredSelected) {
//       setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
//     } else {
//       setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
//     }
//   };

//   // ── clear filters ─────────────────────────────────────────────────────────
//   const clearFilters = () => {
//     setNameSearch("");
//     setPincode("");
//     setLocality("");
//     setStateCode("");
//     setCityName("");
//   };

//   const hasFilters = nameSearch || pincode || locality || stateCode || cityName;

//   // ── send ──────────────────────────────────────────────────────────────────
//   const handleSend = async () => {
//     if (selectedIds.length === 0) {
//       toast.error("Please select at least one recipient");
//       return;
//     }
//     if (onSend) {
//       onSend({ slug: item.slug, userIds: selectedIds });
//     } else {
//       // fallback: call sentEmailNotification directly
//       try {
//         await sentEmailNotification({ slug: item.slug, userIds: selectedIds });
//         toast.success("Campaign sent!");
//         onClose();
//       } catch (err) {
//         toast.error(err?.message || "Failed to send campaign");
//       }
//     }
//   };

//   // ────────────────────────────────────────────────────────────────────────
//   return (
//     <Modal
//       title="Send Email Campaign"
//       icon={<Send size={16} />}
//       onClose={onClose}
//     >
//       <div className="flex flex-col gap-5">
//         {/* ── Template banner ─────────────────────────────────────────────── */}
//         <div className="flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
//           <div className="w-9 h-9 rounded-lg bg-[#27AE60] flex items-center justify-center flex-shrink-0">
//             <Send size={16} className="text-white" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-[10px] font-bold text-[#1A7A43] uppercase tracking-wide">
//               Template
//             </p>
//             <p className="text-sm font-semibold text-[#0F5230] truncate">
//               {item.name}
//             </p>
//           </div>
//           <span className="font-mono text-xs text-[#27AE60] bg-white border border-[#C2EDD6] px-2 py-0.5 rounded-lg flex-shrink-0">
//             {item.slug}
//           </span>
//         </div>

//         {/* ── Filters ─────────────────────────────────────────────────────── */}
//         <div className="flex flex-col gap-2.5">
//           <div className="flex items-center justify-between">
//             <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
//               Filter Recipients
//             </p>
//             {hasFilters && (
//               <button
//                 onClick={clearFilters}
//                 className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
//               >
//                 <X size={11} /> Clear all
//               </button>
//             )}
//           </div>

//           {/* Row 1 — Name + Pincode */}
//           <div className="grid grid-cols-2 gap-2">
//             {/* Name search */}
//             <div className="relative">
//               <Search
//                 size={13}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//               <input
//                 className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
//                 placeholder="Search by name…"
//                 value={nameSearch}
//                 onChange={(e) => setNameSearch(e.target.value)}
//               />
//             </div>

//             {/* Row 3 — Locality (text search with datalist) */}
//             <div className="relative">
//               <Building2
//                 size={13}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//               <input
//                 list="locality-options"
//                 className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
//                 placeholder="Filter by locality (e.g. Tenali, Jubilee Hills)…"
//                 value={locality}
//                 onChange={(e) => setLocality(e.target.value)}
//               />
//               <datalist id="locality-options">
//                 {localityOptions.map((l) => (
//                   <option key={l} value={l} />
//                 ))}
//               </datalist>
//             </div>

//             {/* Pincode */}
//             {/* <div className="relative">
//               <Hash
//                 size={13}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//               <input
//                 className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
//                 placeholder="Pincode…"
//                 value={pincode}
//                 maxLength={6}
//                 onChange={(e) =>
//                   setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
//                 }
//               />
//             </div> */}
//           </div>

//           {/* Row 2 — State + City (country-state-city library) */}
//           <div className="grid grid-cols-2 gap-2">
//             {/* State dropdown */}
//             <div className="relative">
//               <select
//                 className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white text-gray-700 cursor-pointer pr-8"
//                 value={stateCode}
//                 onChange={(e) => setStateCode(e.target.value)}
//               >
//                 <option value="">All States</option>
//                 {IN_STATES.map((s) => (
//                   <option key={s.isoCode} value={s.isoCode}>
//                     {s.name}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 size={13}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//             </div>

//             {/* City dropdown — populated from selected state */}
//             <div className="relative">
//               <select
//                 className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white text-gray-700 cursor-pointer pr-8 disabled:opacity-40 disabled:cursor-not-allowed"
//                 value={cityName}
//                 onChange={(e) => setCityName(e.target.value)}
//                 disabled={!stateCode}
//               >
//                 <option value="">
//                   {stateCode ? "All Cities" : "Select state first"}
//                 </option>
//                 {cities.map((c) => (
//                   <option key={c.name} value={c.name}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 size={13}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//             </div>
//           </div>
//         </div>

//         {/* ── User list ────────────────────────────────────────────────────── */}
//         <div className="flex flex-col gap-2">
//           {/* List header */}
//           <div className="flex items-center justify-between">
//             <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
//               Recipients
//               {fetched && (
//                 <span className="ml-1.5 font-mono text-[#27AE60]">
//                   {filtered.length} found
//                 </span>
//               )}
//             </p>
//             {filtered.length > 0 && (
//               <button
//                 onClick={toggleAll}
//                 className="text-xs font-semibold text-[#27AE60] hover:text-[#1A7A43] transition-colors"
//               >
//                 {isAllFilteredSelected ? "Deselect all" : "Select all"}
//               </button>
//             )}
//           </div>

//           {/* Scrollable list */}
//           <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
//             {loadingUsers ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 size={26} className="animate-spin text-[#27AE60]" />
//               </div>
//             ) : filtered.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-12 gap-2">
//                 <User size={30} className="text-gray-200" />
//                 <p className="text-sm font-semibold text-gray-400">
//                   {users.length === 0
//                     ? "No users found"
//                     : "No users match these filters"}
//                 </p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
//                 {filtered.map((u) => {
//                   const selected = selectedIds.includes(u._id);
//                   const initials = (u.name || "?")[0].toUpperCase();

//                   return (
//                     <div
//                       key={u._id}
//                       onClick={() => toggleUser(u._id)}
//                       className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
//                         selected ? "bg-[#E8F8EF]" : "hover:bg-gray-50"
//                       }`}
//                     >
//                       {/* Custom checkbox */}
//                       <div
//                         className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
//                           selected
//                             ? "bg-[#27AE60] border-[#27AE60]"
//                             : "border-gray-300 bg-white"
//                         }`}
//                       >
//                         {selected && (
//                           <Check
//                             size={11}
//                             className="text-white"
//                             strokeWidth={3}
//                           />
//                         )}
//                       </div>

//                       {/* Avatar */}
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
//                           selected
//                             ? "bg-[#27AE60] text-white"
//                             : "bg-gray-100 text-gray-500"
//                         }`}
//                       >
//                         {initials}
//                       </div>

//                       {/* Name + meta */}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-gray-800 truncate">
//                           {u.name || "—"}
//                         </p>
//                         <div className="flex items-center gap-3 mt-0.5 flex-wrap">
//                           {u.phone && (
//                             <span className="flex items-center gap-1 text-[10px] text-gray-400">
//                               <Phone size={9} /> {u.phone}
//                             </span>
//                           )}
//                           {u.locality && (
//                             <span className="flex items-center gap-1 text-[10px] text-gray-400">
//                               <Building2 size={9} /> {u.locality}
//                             </span>
//                           )}
//                           {(u.city || u.state) && (
//                             <span className="flex items-center gap-1 text-[10px] text-gray-400">
//                               <MapPin size={9} />
//                               {[u.city, u.state].filter(Boolean).join(", ")}
//                             </span>
//                           )}
//                           {/* {u.pincode && (
//                             <span className="flex items-center gap-1 text-[10px] text-gray-400">
//                               <Hash size={9} /> {u.pincode}
//                             </span>
//                           )} */}
//                         </div>
//                       </div>

//                       {/* City badge */}
//                       {u.city && (
//                         <span
//                           className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 transition-colors ${
//                             selected
//                               ? "bg-[#C2EDD6] text-[#1A7A43]"
//                               : "bg-gray-100 text-gray-500"
//                           }`}
//                         >
//                           {u.city}
//                         </span>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Selected summary bar ─────────────────────────────────────────── */}
//         {selectedIds.length > 0 && (
//           <div className="flex items-center gap-2 px-3 py-2.5 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
//             <Check size={14} className="text-[#27AE60] flex-shrink-0" />
//             <p className="text-sm font-semibold text-[#1A7A43]">
//               {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""}{" "}
//               selected
//             </p>
//             <button
//               onClick={() => setSelectedIds([])}
//               className="ml-auto text-xs text-[#27AE60] hover:text-red-500 transition-colors flex items-center gap-1"
//             >
//               <X size={11} /> Clear
//             </button>
//           </div>
//         )}

//         {/* ── Send button ──────────────────────────────────────────────────── */}
//         <button
//           onClick={handleSend}
//           disabled={sending || selectedIds.length === 0}
//           className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           style={{ boxShadow: "0 4px 14px rgba(39,174,96,.3)" }}
//         >
//           {sending ? (
//             <>
//               <Loader2 size={16} className="animate-spin" /> Sending…
//             </>
//           ) : (
//             <>
//               <Send size={15} />
//               {selectedIds.length > 0
//                 ? `Send to ${selectedIds.length} User${selectedIds.length > 1 ? "s" : ""}`
//                 : "Select Recipients First"}
//             </>
//           )}
//         </button>
//       </div>
//     </Modal>
//   );
// }; 


// src/pages/EmailNotifications/modals/SendCampaignModal.jsx
import {
  Send,
  Search,
  MapPin,
  User,
  Phone,
  X,
  ChevronDown,
  Loader2,
  Check,
  Building2,
  Upload,
  FileSpreadsheet,
  Users,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { State, City } from "country-state-city";
import {
  getUserSearch,
  sentEmailNotification,
  sentBulkEmailNotification,
} from "../../../features/user/userService";
import { Modal } from "./CreateModal";

// ─── India states & cities ────────────────────────────────
const IN_STATES = State.getStatesOfCountry("IN");
const getCitiesByState = (stateCode) =>
  stateCode ? City.getCitiesOfState("IN", stateCode) : [];

// ─── Sub-tabs ─────────────────────────────────────────────
const TABS = [
  { id: "users", label: "Select Users", icon: <Users size={13} /> },
  { id: "csv", label: "Bulk CSV Upload", icon: <FileSpreadsheet size={13} /> },
];

// ─── CSV Upload Panel ─────────────────────────────────────
const CsvUploadPanel = ({ item, sending, onClose }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) {
      setFile(f);
    } else {
      toast.error("Please upload a .csv or .xlsx file");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSend = async () => {
    if (!file) {
      toast.error("Please upload a CSV/Excel file first");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("templateId", item._id);

      await sentBulkEmailNotification(formData);
      toast.success("Bulk email campaign started! 🚀");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Bulk send failed");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Template banner */}
      <div className="flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
        <div className="w-9 h-9 rounded-lg bg-[#27AE60] flex items-center justify-center flex-shrink-0">
          <Send size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#1A7A43] uppercase tracking-wide">Template</p>
          <p className="text-sm font-semibold text-[#0F5230] truncate">{item.name}</p>
        </div>
        <span className="font-mono text-xs text-[#27AE60] bg-white border border-[#C2EDD6] px-2 py-0.5 rounded-lg flex-shrink-0">
          {item.slug}
        </span>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2.5 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <FileText size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Upload a <span className="font-bold">.csv</span> or{" "}
          <span className="font-bold">.xlsx</span> file with recipient data. The template{" "}
          <span className="font-mono bg-blue-100 px-1 rounded">{item.slug}</span> will be
          sent to each row. Make sure columns match your template variables.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          dragging
            ? "border-[#27AE60] bg-[#E8F8EF]"
            : file
            ? "border-[#27AE60] bg-[#E8F8EF]"
            : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#F4FDF8]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
        {file ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#27AE60] flex items-center justify-center">
              <FileSpreadsheet size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[#0F5230]">{file.name}</p>
              <p className="text-xs text-[#27AE60] mt-0.5">
                {(file.size / 1024).toFixed(1)} KB — ready to send
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={11} /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
              <Upload size={28} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">
                Drop your CSV/Excel here
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                or click to browse — .csv, .xlsx supported
              </p>
            </div>
          </>
        )}
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || !file}
        className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ boxShadow: "0 4px 14px rgba(39,174,96,.3)" }}
      >
        {sending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending Campaign…
          </>
        ) : (
          <>
            <Send size={15} />
            {file ? `Send Bulk Campaign` : "Upload File First"}
          </>
        )}
      </button>
    </div>
  );
};

// ─── Select Users Panel (original) ───────────────────────
const SelectUsersPanel = ({ item, onSend, sending, onClose }) => {
  const [nameSearch, setNameSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [locality, setLocality] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const cities = getCitiesByState(stateCode);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true);
        const res = await getUserSearch("user");
        const list = res?.data?.results || res?.data || [];
        setUsers(list);
        setFetched(true);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, []);

  useEffect(() => { setCityName(""); }, [stateCode]);

  const filtered = users.filter((u) => {
    const matchName = nameSearch.trim()
      ? (u.name || "").toLowerCase().includes(nameSearch.trim().toLowerCase())
      : true;
    const matchLocality = locality.trim()
      ? (u.locality || "").toLowerCase().includes(locality.trim().toLowerCase())
      : true;
    const stateName = stateCode
      ? (IN_STATES.find((s) => s.isoCode === stateCode)?.name || "").toLowerCase()
      : "";
    const matchState = stateCode
      ? (u.state || "").toLowerCase() === stateName
      : true;
    const matchCity = cityName
      ? (u.city || "").toLowerCase() === cityName.toLowerCase()
      : true;
    return matchName && matchLocality && matchState && matchCity;
  });

  const localityOptions = [...new Set(users.map((u) => u.locality).filter(Boolean))];

  const toggleUser = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const isAllFilteredSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.includes(u._id));

  const toggleAll = () => {
    const ids = filtered.map((u) => u._id);
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const clearFilters = () => {
    setNameSearch("");
    setPincode("");
    setLocality("");
    setStateCode("");
    setCityName("");
  };

  const hasFilters = nameSearch || pincode || locality || stateCode || cityName;

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    if (onSend) {
      onSend({ slug: item.slug, userIds: selectedIds });
    } else {
      try {
        await sentEmailNotification({ slug: item.slug, userIds: selectedIds });
        toast.success("Campaign sent!");
        onClose();
      } catch (err) {
        toast.error(err?.message || "Failed to send campaign");
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Template banner */}
      <div className="flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
        <div className="w-9 h-9 rounded-lg bg-[#27AE60] flex items-center justify-center flex-shrink-0">
          <Send size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#1A7A43] uppercase tracking-wide">Template</p>
          <p className="text-sm font-semibold text-[#0F5230] truncate">{item.name}</p>
        </div>
        <span className="font-mono text-xs text-[#27AE60] bg-white border border-[#C2EDD6] px-2 py-0.5 rounded-lg flex-shrink-0">
          {item.slug}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Filter Recipients</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
              placeholder="Search by name…"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              list="locality-options"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
              placeholder="Filter by locality…"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
            <datalist id="locality-options">
              {localityOptions.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white text-gray-700 cursor-pointer pr-8"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              <option value="">All States</option>
              {IN_STATES.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white text-gray-700 cursor-pointer pr-8 disabled:opacity-40 disabled:cursor-not-allowed"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              disabled={!stateCode}
            >
              <option value="">{stateCode ? "All Cities" : "Select state first"}</option>
              {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Recipients
            {fetched && (
              <span className="ml-1.5 font-mono text-[#27AE60]">{filtered.length} found</span>
            )}
          </p>
          {filtered.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs font-semibold text-[#27AE60] hover:text-[#1A7A43] transition-colors"
            >
              {isAllFilteredSelected ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={26} className="animate-spin text-[#27AE60]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <User size={30} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-400">
                {users.length === 0 ? "No users found" : "No users match these filters"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {filtered.map((u) => {
                const selected = selectedIds.includes(u._id);
                const initials = (u.name || "?")[0].toUpperCase();
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleUser(u._id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${selected ? "bg-[#E8F8EF]" : "hover:bg-gray-50"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-[#27AE60] border-[#27AE60]" : "border-gray-300 bg-white"}`}>
                      {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${selected ? "bg-[#27AE60] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.name || "—"}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {u.phone && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Phone size={9} /> {u.phone}
                          </span>
                        )}
                        {u.locality && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Building2 size={9} /> {u.locality}
                          </span>
                        )}
                        {(u.city || u.state) && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <MapPin size={9} /> {[u.city, u.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    {u.city && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 transition-colors ${selected ? "bg-[#C2EDD6] text-[#1A7A43]" : "bg-gray-100 text-gray-500"}`}>
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

      {/* Selected bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
          <Check size={14} className="text-[#27AE60] flex-shrink-0" />
          <p className="text-sm font-semibold text-[#1A7A43]">
            {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""} selected
          </p>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto text-xs text-[#27AE60] hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X size={11} /> Clear
          </button>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || selectedIds.length === 0}
        className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ boxShadow: "0 4px 14px rgba(39,174,96,.3)" }}
      >
        {sending ? (
          <><Loader2 size={16} className="animate-spin" /> Sending…</>
        ) : (
          <>
            <Send size={15} />
            {selectedIds.length > 0
              ? `Send to ${selectedIds.length} User${selectedIds.length > 1 ? "s" : ""}`
              : "Select Recipients First"}
          </>
        )}
      </button>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────
export const SendCampaignModal = ({ item, onClose, onSend, sending = false }) => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Modal title="Send Email Campaign" icon={<Send size={16} />} onClose={onClose}>
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "users" ? (
        <SelectUsersPanel
          item={item}
          onSend={onSend}
          sending={sending}
          onClose={onClose}
        />
      ) : (
        <CsvUploadPanel item={item} sending={sending} onClose={onClose} />
      )}
    </Modal>
  );
};