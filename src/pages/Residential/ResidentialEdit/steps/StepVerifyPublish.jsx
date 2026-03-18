// import { useState, useRef, useMemo, useEffect } from "react";
// import {
//   CheckCircle,
//   XCircle,
//   Eye,
//   Upload,
//   ShieldCheck,
//   FileText,
//   AlertTriangle,
//   FileCheck,
//   ChevronRight,
//   Info,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// // External cache to prevent memory leaks and broken previews during re-renders
// const docPreviewCache = new WeakMap();

// export default function StepVerifyPublish({
//   data,
//   onSubmit,
//   onVerifyDocument,
//   onUploadDocument,
//   onUpdateField,
// }) {
//   const [previewDoc, setPreviewDoc] = useState(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   if (!data) return null;

//   /* ===============================
//       MERGE SERVER + LOCAL FILES
//   =============================== */
//   const docs = useMemo(() => {
//     // 1. Get documents already saved on database
//     const serverDocs = (data.verificationDocuments || data.documents || []).map(
//       (doc) => ({
//         ...doc,
//         isPersistent: true,
//       }),
//     );

//     // 2. Map local files (from documentsFiles in Redux)
//     const localDocs = (data.documentsFiles || [])
//       .map((file) => {
//         if (!(file instanceof File) && !(file instanceof Blob)) return null;

//         let url = docPreviewCache.get(file);
//         if (!url) {
//           url = URL.createObjectURL(file);
//           docPreviewCache.set(file, url);
//         }

//         return {
//           filename: file.name,
//           mimetype: file.type,
//           status: file.status || "pending",
//           url: url,
//           file,
//           isLocal: true,
//         };
//       })
//       .filter(Boolean);

//     return [...serverDocs, ...localDocs];
//   }, [data.verificationDocuments, data.documents, data.documentsFiles]);

//   /* ===============================
//       STATUS CALCULATIONS
//   =============================== */
//   const totalDocs = docs.length;
//   const verifiedDocs = docs.filter((d) => d.status === "verified").length;

//   const hasDocType = !!data.verificationDocumentType;
//   const allVerified = totalDocs > 0 && verifiedDocs === totalDocs && hasDocType;

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length && onUploadDocument) {
//       onUploadDocument(files);
//     }
//     e.target.value = null;
//   };

//   return (
//     <div className="space-y-8">
//       {/* 1. DOCUMENT TYPE SELECTOR */}
//       <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
//         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
//           Select Primary Verification Document Type
//         </label>
//         <div className="flex flex-wrap gap-3">
//           {["Sale Deed", "Tax Receipt", "RERA Certificate", "Encumbrance"].map(
//             (type) => (
//               <button
//                 key={type}
//                 type="button"
//                 onClick={() =>
//                   onUpdateField?.("verificationDocumentType", type)
//                 }
//                 className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
//                   data.verificationDocumentType === type
//                     ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
//                     : "bg-slate-50 text-slate-500 hover:bg-slate-100"
//                 }`}
//               >
//                 {type}
//               </button>
//             ),
//           )}
//         </div>
//       </div>

//       {/* 2. COMPLIANCE DASHBOARD */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <StatusCard
//           label="Total"
//           value={totalDocs}
//           icon={<FileText />}
//           color="blue"
//         />
//         <StatusCard
//           label="Verified"
//           value={verifiedDocs}
//           icon={<FileCheck />}
//           color="emerald"
//           active={verifiedDocs > 0}
//         />
//         <StatusCard
//           label="Action Req"
//           value={totalDocs - verifiedDocs}
//           icon={<AlertTriangle />}
//           color="amber"
//           active={totalDocs - verifiedDocs > 0}
//         />
//       </div>

//       {/* 3. DOCUMENT LISTING */}
//       <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
//         <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <h3 className="text-slate-800 font-black text-lg flex items-center gap-2">
//             <ShieldCheck className="w-6 h-6 text-emerald-500" />
//             Verification Vault
//           </h3>
//           <div className="flex items-center gap-3">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//               accept=".pdf,image/*"
//               multiple
//             />
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="group flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black transition-all active:scale-95"
//             >
//               <Upload className="w-4 h-4" /> ADD NEW
//             </button>
//           </div>
//         </div>

//         <div className="p-8 bg-slate-50/30">
//           {docs.length > 0 ? (
//             <div className="grid gap-4">
//               {docs.map((doc, index) => (
//                 <div
//                   key={doc.filename || index}
//                   className="bg-white border border-slate-100 rounded-[1.5rem] p-5 flex flex-col sm:flex-row justify-between items-center group hover:border-blue-200 transition-all"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
//                       <FileText className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-black text-slate-700 truncate max-w-[200px]">
//                         {doc.filename}
//                       </p>
//                       <StatusBadge status={doc.status} />
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2 mt-4 sm:mt-0">
//                     <button
//                       type="button"
//                       onClick={() => setPreviewDoc(doc)}
//                       className="p-3 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors"
//                     >
//                       <Eye className="w-5 h-5" />
//                     </button>
//                     <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-100">
//                       <button
//                         type="button"
//                         onClick={() => onVerifyDocument?.(index, "verified")}
//                         className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all"
//                       >
//                         <CheckCircle className="w-4 h-4" /> VERIFY
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => onVerifyDocument?.(index, "rejected")}
//                         className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all"
//                       >
//                         <XCircle className="w-4 h-4" /> REJECT
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <EmptyState onClick={() => fileInputRef.current?.click()} />
//           )}
//         </div>
//       </div>

//       {/* 4. WARNINGS */}
//       {!allVerified && (
//         <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 items-start">
//           <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
//           <p className="text-xs font-bold text-amber-700 leading-relaxed">
//             {!hasDocType
//               ? "⚠️ Please select a Document Type."
//               : "Publishing restricted until all documents are 'Verified'."}
//           </p>
//         </div>
//       )}

//       {/* 5. FOOTER ACTIONS */}
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100">
//         <button
//           onClick={() => navigate(`/${data.propertyCategory}`)}
//           className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase transition-all"
//         >
//           Exit
//         </button>
//         <button
//           onClick={onSubmit}
//           disabled={!allVerified}
//           className={`w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 rounded-[2rem] font-black text-sm uppercase transition-all transform active:scale-95 shadow-xl ${
//             allVerified
//               ? "bg-emerald-600 text-white shadow-emerald-200"
//               : "bg-slate-200 text-slate-400 cursor-not-allowed"
//           }`}
//         >
//           {allVerified && <ShieldCheck className="w-5 h-5" />}
//           Go Live Now
//         </button>
//       </div>

//       {previewDoc && (
//         <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
//       )}
//     </div>
//   );
// }

// /* ===============================
//     SUB-COMPONENTS
// ================================ */

// function EmptyState({ onClick }) {
//   return (
//     <div
//       onClick={onClick}
//       className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center cursor-pointer hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
//     >
//       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
//         <Upload className="w-8 h-8 text-slate-300" />
//       </div>
//       <h4 className="text-slate-600 font-black">No documents uploaded yet</h4>
//       <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">
//         Identity and Ownership proof required
//       </p>
//     </div>
//   );
// }

// function StatusCard({ label, value, icon, color, active = true }) {
//   const styles = {
//     blue: "bg-blue-50 text-blue-600 border-blue-100",
//     emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
//     amber: "bg-amber-50 text-amber-600 border-amber-100",
//   };

//   return (
//     <div
//       className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${active ? styles[color] : "bg-slate-50 text-slate-300 border-slate-100"}`}
//     >
//       <div className="flex items-center justify-between mb-2">
//         <span className="p-2 bg-white/50 rounded-xl">{icon}</span>
//         <ChevronRight className="w-4 h-4 opacity-30" />
//       </div>
//       <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
//         {label}
//       </p>
//       <p className="text-3xl font-black mt-1">{value}</p>
//     </div>
//   );
// }

// function StatusBadge({ status }) {
//   const config = {
//     verified: {
//       icon: <CheckCircle className="w-3 h-3" />,
//       class: "bg-emerald-100 text-emerald-700",
//     },
//     rejected: {
//       icon: <XCircle className="w-3 h-3" />,
//       class: "bg-red-100 text-red-700",
//     },
//     pending: {
//       icon: <AlertTriangle className="w-3 h-3" />,
//       class: "bg-amber-100 text-amber-700",
//     },
//   };

//   return (
//     <span
//       className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${config[status]?.class || "bg-slate-100"}`}
//     >
//       {config[status]?.icon} {status}
//     </span>
//   );
// }

// function PreviewModal({ doc, onClose }) {
//   const isPDF = doc.mimetype?.includes("pdf");
//   return (
//     <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 md:p-10">
//       <div className="bg-white w-full max-w-5xl h-full rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
//         <div className="flex justify-between items-center p-6 border-b">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-slate-100 rounded-2xl text-slate-500">
//               <FileText className="w-5 h-5" />
//             </div>
//             <div>
//               <p className="font-black text-slate-800 leading-none">
//                 {doc.filename}
//               </p>
//               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
//                 Document Preview
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-3 hover:bg-slate-100 rounded-2xl transition-colors group"
//           >
//             <XCircle className="w-6 h-6 text-slate-300 group-hover:text-red-500 transition-colors" />
//           </button>
//         </div>
//         <div className="flex-1 bg-slate-200/50 p-4 md:p-8">
//           <div className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden flex items-center justify-center">
//             {isPDF ? (
//               <iframe
//                 src={doc.url}
//                 className="w-full h-full"
//                 title="PDF Preview"
//               />
//             ) : (
//               <img
//                 src={doc.url}
//                 alt="Preview"
//                 className="max-w-full max-h-full object-contain"
//               />
//             )}
//           </div>
//         </div>
//         <div className="p-6 border-t bg-slate-50 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition-all"
//           >
//             Close Preview
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



//CI 



// StepVerifyPublish.jsx — Premium Emerald Theme, Full Responsive
import { useState, useRef, useMemo } from "react";
import { CheckCircle, XCircle, Eye, Upload, ShieldCheck, FileText, AlertTriangle, FileCheck, Info, Rocket, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const previewCache = new WeakMap();

export default function StepVerifyPublish({ data, onSubmit, onVerifyDocument, onUploadDocument, onUpdateField }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  if (!data) return null;

  const docs = useMemo(() => {
    const server = (data.verificationDocuments || data.documents || []).map((d) => ({ ...d, isPersistent: true }));
    const local = (data.documentsFiles || []).map((file) => {
      if (!(file instanceof File) && !(file instanceof Blob)) return null;
      let url = previewCache.get(file);
      if (!url) { url = URL.createObjectURL(file); previewCache.set(file, url); }
      return { filename: file.name, mimetype: file.type, status: file.status || "pending", url, file, isLocal: true };
    }).filter(Boolean);
    return [...server, ...local];
  }, [data.verificationDocuments, data.documents, data.documentsFiles]);

  const total = docs.length, verified = docs.filter((d) => d.status === "verified").length;
  const hasType = !!data.verificationDocumentType;
  const allDone = total > 0 && verified === total && hasType;

  return (
    <div className="space-y-7">
      {/* Document Type */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 sm:p-6 space-y-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#27AE60]/10 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-[#27AE60]" /></div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Verification Document Type</label>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {["Sale Deed","Tax Receipt","RERA Certificate","Encumbrance"].map((type) => {
            const active = data.verificationDocumentType === type;
            return (
              <button key={type} type="button" onClick={() => onUpdateField?.("verificationDocumentType", type)}
                className="px-5 py-2.5 rounded-xl text-xs font-black transition-all"
                style={{ background: active ? "linear-gradient(135deg,#27AE60,#1e9e52)" : "#f8fafc", color: active ? "#fff" : "#64748b", border: active ? "1.5px solid transparent" : "1.5px solid #e2e8f0", boxShadow: active ? "0 6px 20px #27AE6030" : "none", transform: active ? "scale(1.04)" : "scale(1)" }}>
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <FileText className="w-4 h-4" />, label: "Total", value: total, color: "#3B82F6", active: true },
          { icon: <FileCheck className="w-4 h-4" />, label: "Verified", value: verified, color: "#27AE60", active: verified > 0 },
          { icon: <AlertTriangle className="w-4 h-4" />, label: "Pending", value: total - verified, color: "#F59E0B", active: (total-verified) > 0 },
        ].map((s) => (
          <div key={s.label} className="p-4 sm:p-5 rounded-2xl border-2 transition-all" style={{ borderColor: s.active ? `${s.color}25` : "#f1f5f9", background: s.active ? `${s.color}08` : "#f8fafc" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.active ? `${s.color}15` : "#e2e8f0", color: s.active ? s.color : "#94a3b8" }}>{s.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.active ? s.color : "#94a3b8" }}>{s.label}</p>
            <p className="text-2xl sm:text-3xl font-black tabular-nums" style={{ color: s.active ? s.color : "#cbd5e1" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Vault */}
      <div className="bg-white rounded-3xl border-2 overflow-hidden" style={{ borderColor: "#27AE6018", boxShadow: "0 4px 24px #27AE6008" }}>
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,#27AE6060,#27AE6015,transparent)" }} />
        <div className="px-5 sm:px-7 py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-[#27AE60]" /></div>
            <div>
              <h3 className="text-base font-black text-slate-800">Verification Vault</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Secure document storage</p>
            </div>
          </div>
          <div>
            <input type="file" ref={fileInputRef} onChange={(e) => { const f = Array.from(e.target.files); if (f.length && onUploadDocument) onUploadDocument(f); e.target.value = null; }} className="hidden" accept=".pdf,image/*" multiple />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-black transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>
              <Upload className="w-3.5 h-3.5" /> Add Document
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-7 bg-slate-50/30">
          {docs.length > 0 ? (
            <div className="space-y-3">
              {docs.map((doc, idx) => (
                <div key={doc.filename||idx} className="bg-white border-2 border-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#27AE60]/20 transition-all group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#27AE60] group-hover:bg-[#27AE60]/8 transition-all shrink-0"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-black text-slate-700 truncate max-w-[180px] sm:max-w-[240px]">{doc.filename}</p>
                      <DocBadge status={doc.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button type="button" onClick={() => setPreviewDoc(doc)} className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-100 flex-1 sm:flex-none">
                      <button type="button" onClick={() => onVerifyDocument?.(idx,"verified")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:bg-[#27AE60] hover:text-white"
                        style={{ background: "#f0fdf4", color: "#15803d", border: "1.5px solid #27AE6020" }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button type="button" onClick={() => onVerifyDocument?.(idx,"rejected")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:bg-red-600 hover:text-white"
                        style={{ background: "#fff1f2", color: "#dc2626", border: "1.5px solid #fca5a520" }}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all group hover:bg-[#f0fdf4]"
              style={{ borderColor: "#27AE6025" }}>
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#27AE60]/10 transition-all shadow-sm">
                <Upload className="w-7 h-7 text-slate-300 group-hover:text-[#27AE60] transition-colors" />
              </div>
              <h4 className="font-black text-slate-600 text-sm">No documents uploaded yet</h4>
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Identity & ownership proof required</p>
            </div>
          )}
        </div>
      </div>

      {/* Warning */}
      {!allDone && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
          <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5"><Info className="w-3.5 h-3.5 text-amber-600" /></div>
          <p className="text-xs font-bold text-amber-700 leading-relaxed">
            {!hasType ? "⚠️ Please select a Document Type to proceed." : "Publishing restricted until all documents are verified."}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-slate-100">
        <button onClick={() => navigate(`/${data.propertyCategory}`)} className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200 text-center" style={{ background: "#f1f5f9", color: "#475569" }}>Exit</button>
        <button onClick={onSubmit} disabled={!allDone}
          className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
          style={{ background: allDone ? "linear-gradient(135deg,#27AE60,#1a9e50)" : "#e2e8f0", color: allDone ? "#fff" : "#94a3b8", boxShadow: allDone ? "0 10px 30px #27AE6035" : "none", cursor: allDone ? "pointer" : "not-allowed" }}>
          {allDone && <Rocket className="w-4 h-4" />}
          {allDone ? "Go Live Now" : "Complete Verification"}
        </button>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-8">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[92vh]" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#27AE60]/10 flex items-center justify-center"><FileText className="w-4 h-4 text-[#27AE60]" /></div>
                <div>
                  <p className="font-black text-slate-800 truncate max-w-[200px] sm:max-w-xs">{previewDoc.filename}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Document Preview</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 bg-slate-100 p-3 sm:p-5 overflow-hidden min-h-[300px]">
              <div className="w-full h-full min-h-[280px] bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                {previewDoc.mimetype?.includes("pdf")
                  ? <iframe src={previewDoc.url} className="w-full h-full min-h-[400px]" title="PDF Preview" />
                  : <img src={previewDoc.url} alt="Preview" className="max-w-full max-h-[60vh] object-contain" />
                }
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
              <button onClick={() => setPreviewDoc(null)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocBadge({ status }) {
  const cfg = { verified: { icon: <CheckCircle className="w-3 h-3" />, bg: "#f0fdf4", color: "#15803d" }, rejected: { icon: <XCircle className="w-3 h-3" />, bg: "#fff1f2", color: "#dc2626" }, pending: { icon: <AlertTriangle className="w-3 h-3" />, bg: "#fffbeb", color: "#d97706" } };
  const c = cfg[status] || { icon: null, bg: "#f8fafc", color: "#64748b" };
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mt-1" style={{ background: c.bg, color: c.color }}>{c.icon} {status}</span>;
}