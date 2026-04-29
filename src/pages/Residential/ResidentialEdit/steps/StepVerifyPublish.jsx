// // // StepVerifyPublish.jsx — Premium Emerald Theme, Full Responsive
// // import { useState, useRef, useMemo } from "react";
// // import { CheckCircle, XCircle, Eye, Upload, ShieldCheck, FileText, AlertTriangle, FileCheck, Info, Rocket, X } from "lucide-react";
// // import { useNavigate } from "react-router-dom";

// // const previewCache = new WeakMap();

// // export default function StepVerifyPublish({ data, onSubmit, onVerifyDocument, onUploadDocument, onUpdateField }) {
// //   const [previewDoc, setPreviewDoc] = useState(null);
// //   const fileInputRef = useRef(null);
// //   const navigate = useNavigate();
// //   if (!data) return null;

// //   const docs = useMemo(() => {
// //     const server = (data.verificationDocuments || data.documents || []).map((d) => ({ ...d, isPersistent: true }));
// //     const local = (data.documentsFiles || []).map((file) => {
// //       if (!(file instanceof File) && !(file instanceof Blob)) return null;
// //       let url = previewCache.get(file);
// //       if (!url) { url = URL.createObjectURL(file); previewCache.set(file, url); }
// //       return { filename: file.name, mimetype: file.type, status: file.status || "pending", url, file, isLocal: true };
// //     }).filter(Boolean);
// //     return [...server, ...local];
// //   }, [data.verificationDocuments, data.documents, data.documentsFiles]);

// //   const total = docs.length, verified = docs.filter((d) => d.status === "verified").length;
// //   const hasType = !!data.verificationDocumentType;
// //   const allDone = total > 0 && verified === total && hasType;

// //   return (
// //     <div className="space-y-7">
// //       {/* Document Type */}
// //       <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 sm:p-6 space-y-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
// //         <div className="flex items-center gap-2.5">
// //           <div className="w-8 h-8 rounded-xl bg-[#27AE60]/10 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-[#27AE60]" /></div>
// //           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Verification Document Type</label>
// //         </div>
// //         <div className="flex flex-wrap gap-2.5">
// //           {["Sale Deed","Tax Receipt","RERA Certificate","Encumbrance"].map((type) => {
// //             const active = data.verificationDocumentType === type;
// //             return (
// //               <button key={type} type="button" onClick={() => onUpdateField?.("verificationDocumentType", type)}
// //                 className="px-5 py-2.5 rounded-xl text-xs font-black transition-all"
// //                 style={{ background: active ? "linear-gradient(135deg,#27AE60,#1e9e52)" : "#f8fafc", color: active ? "#fff" : "#64748b", border: active ? "1.5px solid transparent" : "1.5px solid #e2e8f0", boxShadow: active ? "0 6px 20px #27AE6030" : "none", transform: active ? "scale(1.04)" : "scale(1)" }}>
// //                 {type}
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       {/* Stats */}
// //       <div className="grid grid-cols-3 gap-3">
// //         {[
// //           { icon: <FileText className="w-4 h-4" />, label: "Total", value: total, color: "#3B82F6", active: true },
// //           { icon: <FileCheck className="w-4 h-4" />, label: "Verified", value: verified, color: "#27AE60", active: verified > 0 },
// //           { icon: <AlertTriangle className="w-4 h-4" />, label: "Pending", value: total - verified, color: "#F59E0B", active: (total-verified) > 0 },
// //         ].map((s) => (
// //           <div key={s.label} className="p-4 sm:p-5 rounded-2xl border-2 transition-all" style={{ borderColor: s.active ? `${s.color}25` : "#f1f5f9", background: s.active ? `${s.color}08` : "#f8fafc" }}>
// //             <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.active ? `${s.color}15` : "#e2e8f0", color: s.active ? s.color : "#94a3b8" }}>{s.icon}</div>
// //             <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.active ? s.color : "#94a3b8" }}>{s.label}</p>
// //             <p className="text-2xl sm:text-3xl font-black tabular-nums" style={{ color: s.active ? s.color : "#cbd5e1" }}>{s.value}</p>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Vault */}
// //       <div className="bg-white rounded-3xl border-2 overflow-hidden" style={{ borderColor: "#27AE6018", boxShadow: "0 4px 24px #27AE6008" }}>
// //         <div className="h-0.5" style={{ background: "linear-gradient(90deg,#27AE6060,#27AE6015,transparent)" }} />
// //         <div className="px-5 sm:px-7 py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //           <div className="flex items-center gap-3">
// //             <div className="w-10 h-10 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-[#27AE60]" /></div>
// //             <div>
// //               <h3 className="text-base font-black text-slate-800">Verification Vault</h3>
// //               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Secure document storage</p>
// //             </div>
// //           </div>
// //           <div>
// //             <input type="file" ref={fileInputRef} onChange={(e) => { const f = Array.from(e.target.files); if (f.length && onUploadDocument) onUploadDocument(f); e.target.value = null; }} className="hidden" accept=".pdf,image/*" multiple />
// //             <button type="button" onClick={() => fileInputRef.current?.click()}
// //               className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-black transition-all active:scale-95"
// //               style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>
// //               <Upload className="w-3.5 h-3.5" /> Add Document
// //             </button>
// //           </div>
// //         </div>
// //         <div className="p-5 sm:p-7 bg-slate-50/30">
// //           {docs.length > 0 ? (
// //             <div className="space-y-3">
// //               {docs.map((doc, idx) => (
// //                 <div key={doc.filename||idx} className="bg-white border-2 border-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#27AE60]/20 transition-all group">
// //                   <div className="flex items-center gap-3.5">
// //                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#27AE60] group-hover:bg-[#27AE60]/8 transition-all shrink-0"><FileText className="w-5 h-5" /></div>
// //                     <div>
// //                       <p className="text-sm font-black text-slate-700 truncate max-w-[180px] sm:max-w-[240px]">{doc.filename}</p>
// //                       <DocBadge status={doc.status} />
// //                     </div>
// //                   </div>
// //                   <div className="flex items-center gap-2 w-full sm:w-auto">
// //                     <button type="button" onClick={() => setPreviewDoc(doc)} className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
// //                     {/* <div className="flex items-center gap-2 pl-3 border-l border-slate-100 flex-1 sm:flex-none">
// //                       <button type="button" onClick={() => onVerifyDocument?.(idx,"verified")}
// //                         className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:bg-[#27AE60] hover:text-white"
// //                         style={{ background: "#f0fdf4", color: "#15803d", border: "1.5px solid #27AE6020" }}>
// //                         <CheckCircle className="w-3.5 h-3.5" /> Verify
// //                       </button>
// //                       <button type="button" onClick={() => onVerifyDocument?.(idx,"rejected")}
// //                         className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:bg-red-600 hover:text-white"
// //                         style={{ background: "#fff1f2", color: "#dc2626", border: "1.5px solid #fca5a520" }}>
// //                         <XCircle className="w-3.5 h-3.5" /> Reject
// //                       </button>
// //                     </div> */}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <div onClick={() => fileInputRef.current?.click()}
// //               className="border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all group hover:bg-[#f0fdf4]"
// //               style={{ borderColor: "#27AE6025" }}>
// //               <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#27AE60]/10 transition-all shadow-sm">
// //                 <Upload className="w-7 h-7 text-slate-300 group-hover:text-[#27AE60] transition-colors" />
// //               </div>
// //               <h4 className="font-black text-slate-600 text-sm">No documents uploaded yet</h4>
// //               <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Identity & ownership proof required</p>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Warning */}
// //       {!allDone && (
// //         <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
// //           <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5"><Info className="w-3.5 h-3.5 text-amber-600" /></div>
// //           <p className="text-xs font-bold text-amber-700 leading-relaxed">
// //             {!hasType ? "⚠️ Please select a Document Type to proceed." : "Publishing restricted until all documents are verified."}
// //           </p>
// //         </div>
// //       )}

// //       {/* Actions */}
// //       <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-slate-100">
// //         <button onClick={() => navigate(`/${data.propertyCategory}`)} className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200 text-center" style={{ background: "#f1f5f9", color: "#475569" }}>Exit</button>
// //         <button onClick={onSubmit} disabled={!allDone}
// //           className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
// //           style={{ background: allDone ? "linear-gradient(135deg,#27AE60,#1a9e50)" : "#e2e8f0", color: allDone ? "#fff" : "#94a3b8", boxShadow: allDone ? "0 10px 30px #27AE6035" : "none", cursor: allDone ? "pointer" : "not-allowed" }}>
// //           {allDone && <Rocket className="w-4 h-4" />}
// //           {allDone ? "Go Live Now" : "Complete Verification"}
// //         </button>
// //       </div>

// //       {previewDoc && (
// //         <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-8">
// //           <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[92vh]" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}>
// //             <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 rounded-xl bg-[#27AE60]/10 flex items-center justify-center"><FileText className="w-4 h-4 text-[#27AE60]" /></div>
// //                 <div>
// //                   <p className="font-black text-slate-800 truncate max-w-[200px] sm:max-w-xs">{previewDoc.filename}</p>
// //                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Document Preview</p>
// //                 </div>
// //               </div>
// //               <button onClick={() => setPreviewDoc(null)} className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
// //             </div>
// //             <div className="flex-1 bg-slate-100 p-3 sm:p-5 overflow-hidden min-h-[300px]">
// //               <div className="w-full h-full min-h-[280px] bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
// //                 {previewDoc.mimetype?.includes("pdf")
// //                   ? <iframe src={previewDoc.url} className="w-full h-full min-h-[400px]" title="PDF Preview" />
// //                   : <img src={previewDoc.url} alt="Preview" className="max-w-full max-h-[60vh] object-contain" />
// //                 }
// //               </div>
// //             </div>
// //             <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
// //               <button onClick={() => setPreviewDoc(null)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Close</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // function DocBadge({ status }) {
// //   const cfg = { verified: { icon: <CheckCircle className="w-3 h-3" />, bg: "#f0fdf4", color: "#15803d" }, rejected: { icon: <XCircle className="w-3 h-3" />, bg: "#fff1f2", color: "#dc2626" }, pending: { icon: <AlertTriangle className="w-3 h-3" />, bg: "#fffbeb", color: "#d97706" } };
// //   const c = cfg[status] || { icon: null, bg: "#f8fafc", color: "#64748b" };
// //   return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mt-1" style={{ background: c.bg, color: c.color }}>{c.icon} {status}</span>;
// // }


// // StepVerifyPublish.jsx — Grouped server docs + separate new upload section
// import { useState, useRef, useMemo } from "react";
// import {
//   CheckCircle, XCircle, Eye, Upload, ShieldCheck, FileText,
//   AlertTriangle, FileCheck, Info, Rocket, X, Plus, FolderOpen, Tag,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const previewCache = new WeakMap();

// // Document types available for new uploads
// const DOC_TYPE_OPTIONS = [
//   "Sale Deed",
//   "Tax Receipt",
//   "RERA Certificate",
//   "Encumbrance",
//   "Utility Bill",
  
// ];

// export default function StepVerifyPublish({
//   data,
//   onSubmit,
//   onVerifyDocument,
//   onUploadDocument,
//   onUpdateField,
// }) {
//   const [previewDoc, setPreviewDoc] = useState(null);
//   const [newDocType, setNewDocType] = useState("");
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   if (!data) return null;

//   // ── 1. Server docs: already saved, have their own `type` field ──
//   const serverDocs = useMemo(
//     () => (data.verificationDocuments || data.documents || []).map((d) => ({ ...d, isPersistent: true })),
//     [data.verificationDocuments, data.documents]
//   );

//   // ── 2. Local docs: newly added files, not yet saved to server ──
//   const localDocs = useMemo(
//     () =>
//       (data.documentsFiles || [])
//         .map((file) => {
         
          
//           const actualFile = file?.file || file;

//           let url = file.preview;

//           if (!url) {
//             url = URL.createObjectURL(actualFile);
//           }

//           return {
//             filename: actualFile.name,
//             mimetype: actualFile.type,
//             status: file.status || "pending",
//             type: file.docType || "NEW",
//             url,
//             file: actualFile,
//             isLocal: true,
//           };
//         })
//         .filter(Boolean),
//     [data.documentsFiles]
//   );

//   // ── 3. Group server docs by their `type` field ──
//   const groupedServerDocs = useMemo(() => {
//     return serverDocs.reduce((acc, doc) => {
//       const key = doc.type || "OTHER";
//       if (!acc[key]) acc[key] = [];
//       acc[key].push(doc);
//       return acc;
//     }, {});
//   }, [serverDocs]);

//   const serverDocTypes = Object.keys(groupedServerDocs);

//   // ── Stats ──
//   const totalServer = serverDocs.length;
//   const verifiedServer = serverDocs.filter((d) => d.status === "verified").length;
//   const totalLocal = localDocs.length;

//   // const allDone =
//   //   totalServer > 0 &&
//   //   verifiedServer === totalServer &&
//   //   totalLocal === 0; // no pending local uploads

//   //onst allDone = totalServer > 0 || totalLocal > 0;
//   const allDone = totalServer > 0 && verifiedServer === totalServer && totalLocal === 0;

//   // ── Handle new file pick ──
//   // const handleFileChange = (e) => {
//   //   const files = Array.from(e.target.files);
//   //   if (!files.length) return;
//   //   if (!newDocType) {
//   //     alert("Please select a Document Type before uploading.");
//   //     e.target.value = null;
//   //     return;
//   //   }
//   //   // Attach docType onto file object so parent can read it
//   //   files.forEach((f) => { f.docType = newDocType; });
//   //   onUploadDocument?.(files);
//   //   e.target.value = null;
//   // };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);

//     if (!newDocType) {
//       alert("Select type first");
//       return;
//     }

//     // ✅ just set type globally (like old logic)
//     //onUpdateField("verificationDocumentType", newDocType);

//     // ✅ send pure files (IMPORTANT)
//     //onUploadDocument(files);

// //     files.forEach((f) => {
// //   f.docType = newDocType; // 🔥 attach type to each file
// // });

// const formattedFiles = files.map((f) => ({
//   file: f,
//   docType: newDocType,
//   preview: URL.createObjectURL(f),
//   source: "local",
// }));

// onUploadDocument(formattedFiles);

//     e.target.value = null;
//   };

//   return (
//     <div className="space-y-7">

//       {/* ════════════════════════════════════════════
//           SECTION 1 — Existing (Server) Documents
//           Grouped by type, read-only display
//       ════════════════════════════════════════════ */}
//       <div
//         className="bg-white rounded-3xl border-2 overflow-hidden"
//         style={{ borderColor: "#27AE6018", boxShadow: "0 4px 24px #27AE6008" }}
//       >
//         {/* Green top bar */}
//         <div className="h-0.5" style={{ background: "linear-gradient(90deg,#27AE6060,#27AE6015,transparent)" }} />

//         {/* Header */}
//         <div className="px-5 sm:px-7 py-5 border-b border-slate-50 flex items-center gap-3">
//           <div className="w-10 h-10 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center">
//             <FolderOpen className="w-5 h-5 text-[#27AE60]" />
//           </div>
//           <div>
//             <h3 className="text-base font-black text-slate-800">Submitted Documents</h3>
//             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
//               {totalServer} document{totalServer !== 1 ? "s" : ""} · {verifiedServer} verified
//             </p>
//           </div>
//         </div>

//         <div className="p-5 sm:p-7 bg-slate-50/30 space-y-5">
//           {serverDocTypes.length === 0 ? (
//             <div className="py-10 text-center">
//               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documents on record</p>
//             </div>
//           ) : (
//             serverDocTypes.map((type) => (
//               <div key={type}>
//                 {/* Type label */}
//                 <div className="flex items-center gap-2 mb-3">
//                   <Tag className="w-3 h-3 text-[#27AE60]" />
//                   <span className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">{type}</span>
//                   <div className="flex-1 h-px bg-[#27AE60]/10" />
//                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
//                     {groupedServerDocs[type].length} file{groupedServerDocs[type].length !== 1 ? "s" : ""}
//                   </span>
//                 </div>

//                 {/* Documents in this type group */}
//                 <div className="space-y-2 pl-1">
//                   {groupedServerDocs[type].map((doc, idx) => (
//                     <div
//                       key={doc.filename || idx}
//                       className="bg-white border-2 border-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#27AE60]/20 transition-all group"
//                     >
//                       <div className="flex items-center gap-3.5">
//                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#27AE60] group-hover:bg-[#27AE60]/8 transition-all shrink-0">
//                           <FileText className="w-5 h-5" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-black text-slate-700 truncate max-w-[180px] sm:max-w-[300px]">
//                             {doc.filename || doc.title}
//                           </p>
//                           <DocBadge status={doc.status} />
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setPreviewDoc(doc)}
//                         className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"
//                         title="Preview"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* ── Stats row ── */}
//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { icon: <FileText className="w-4 h-4" />, label: "Total", value: totalServer, color: "#3B82F6", active: true },
//           { icon: <FileCheck className="w-4 h-4" />, label: "Verified", value: verifiedServer, color: "#27AE60", active: verifiedServer > 0 },
//           { icon: <AlertTriangle className="w-4 h-4" />, label: "Pending", value: totalServer - verifiedServer, color: "#F59E0B", active: (totalServer - verifiedServer) > 0 },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="p-4 sm:p-5 rounded-2xl border-2 transition-all"
//             style={{ borderColor: s.active ? `${s.color}25` : "#f1f5f9", background: s.active ? `${s.color}08` : "#f8fafc" }}
//           >
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.active ? `${s.color}15` : "#e2e8f0", color: s.active ? s.color : "#94a3b8" }}>{s.icon}</div>
//             <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.active ? s.color : "#94a3b8" }}>{s.label}</p>
//             <p className="text-2xl sm:text-3xl font-black tabular-nums" style={{ color: s.active ? s.color : "#cbd5e1" }}>{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* ════════════════════════════════════════════
//           SECTION 2 — Add New Document
//           User picks a type, then uploads — shown
//           separately as "pending / not yet saved"
//       ════════════════════════════════════════════ */}
//       <div
//         className="bg-white rounded-3xl border-2 overflow-hidden"
//         style={{ borderColor: "#3B82F618", boxShadow: "0 4px 24px #3B82F608" }}
//       >
//         <div className="h-0.5" style={{ background: "linear-gradient(90deg,#3B82F660,#3B82F615,transparent)" }} />

//         {/* Header */}
//         <div className="px-5 sm:px-7 py-5 border-b border-slate-50 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
//               <Plus className="w-5 h-5 text-blue-500" />
//             </div>
//             <div>
//               <h3 className="text-base font-black text-slate-800">Add New Document</h3>
//               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
//                 Select type first, then upload
//               </p>
//             </div>
//           </div>

//           {/* Type selector + upload trigger side by side */}
//           <div className="flex items-center gap-2 flex-wrap justify-end">
//             <select
//               value={newDocType}
//               onChange={(e) => setNewDocType(e.target.value)}
//               className="text-xs font-black text-slate-700 border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"
//               style={{ minWidth: "140px" }}
//             >
//               <option value="">Select Type…</option>
//               {DOC_TYPE_OPTIONS.map((t) => (
//                 <option key={t} value={t}>{t}</option>
//               ))}
//             </select>

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
//               onClick={() => {
//                 if (!newDocType) {
//                   alert("Please select a Document Type first.");
//                   return;
//                 }
//                 fileInputRef.current?.click();
//               }}
//               className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-black transition-all active:scale-95"
//               style={{
//                 background: newDocType
//                   ? "linear-gradient(135deg,#1e293b,#0f172a)"
//                   : "#cbd5e1",
//                 boxShadow: newDocType ? "0 4px 14px rgba(0,0,0,0.25)" : "none",
//                 cursor: newDocType ? "pointer" : "not-allowed",
//               }}
//             >
//               <Upload className="w-3.5 h-3.5" /> Upload
//             </button>
//           </div>
//         </div>

//         {/* Local (new, unsaved) docs list */}
//         <div className="p-5 sm:p-7 bg-slate-50/30">
//           {localDocs.length === 0 ? (
//             <div
//               onClick={() => { if (newDocType) fileInputRef.current?.click(); }}
//               className="border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all group"
//               style={{
//                 borderColor: newDocType ? "#3B82F640" : "#e2e8f0",
//                 cursor: newDocType ? "pointer" : "default",
//               }}
//             >
//               <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-50 transition-all shadow-sm">
//                 <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
//               </div>
//               <h4 className="font-black text-slate-500 text-sm">
//                 {newDocType ? `Click to upload as "${newDocType}"` : "Select a type above, then upload"}
//               </h4>
//               <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
//                 PDF or image · these will be saved when you submit
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {/* New uploads header */}
//               <div className="flex items-center gap-2 mb-1">
//                 <AlertTriangle className="w-3 h-3 text-amber-500" />
//                 <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending Save</span>
//                 <div className="flex-1 h-px bg-amber-100" />
//                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
//                   {localDocs.length} file{localDocs.length !== 1 ? "s" : ""} · not yet saved
//                 </span>
//               </div>

//               {localDocs.map((doc, idx) => (
//                 <div
//                   key={doc.filename || idx}
//                   className="bg-white border-2 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all group"
//                   style={{ borderColor: "#FDE68A" }}
//                 >
//                   <div className="flex items-center gap-3.5">
//                     <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
//                       <FileText className="w-5 h-5 text-amber-400" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-black text-slate-700 truncate max-w-[180px] sm:max-w-[280px]">
//                         {doc.filename}
//                       </p>
//                       <div className="flex items-center gap-2 mt-1">
//                         {/* Show the type this file was tagged with */}
//                         <span
//                           className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter"
//                           style={{ background: "#eff6ff", color: "#2563eb" }}
//                         >
//                           <Tag className="w-2.5 h-2.5" /> {doc.type}
//                         </span>
//                         <DocBadge status={doc.status} />
//                       </div>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setPreviewDoc(doc)}
//                     className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"
//                     title="Preview"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Warning ── */}
//       {!allDone && (
//         <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
//           <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
//             <Info className="w-3.5 h-3.5 text-amber-600" />
//           </div>
//           <p className="text-xs font-bold text-amber-700 leading-relaxed">
//             {totalServer === 0
//               ? "⚠️ No verified documents found. Please upload at least one document."
//               : verifiedServer < totalServer
//                 ? `⚠️ ${totalServer - verifiedServer} document(s) are still pending verification.`
//                 : localDocs.length > 0
//                   ? "⚠️ You have unsaved new documents. Submit to save them."
//                   : "Publishing restricted until all documents are verified."}
//           </p>
//         </div>
//       )}

//       {/* ── Actions ── */}
//       <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-slate-100">
//         <button
//           onClick={() => navigate(`/${data.propertyCategory}`)}
//           className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200 text-center"
//           style={{ background: "#f1f5f9", color: "#475569" }}
//         >
//           Exit
//         </button>
//         <button
//           onClick={onSubmit}
//           disabled={!allDone}
//           className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
//           style={{
//             background: allDone ? "linear-gradient(135deg,#27AE60,#1a9e50)" : "#e2e8f0",
//             color: allDone ? "#fff" : "#94a3b8",
//             boxShadow: allDone ? "0 10px 30px #27AE6035" : "none",
//             cursor: allDone ? "pointer" : "not-allowed",
//           }}
//         >
//           {allDone && <Rocket className="w-4 h-4" />}
//           {allDone ? "Go Live Now" : "Complete Verification"}
//         </button>
//       </div>

//       {/* ── Preview Modal ── */}
//       {previewDoc && (
//         <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-8">
//           <div
//             className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[92vh]"
//             style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}
//           >
//             <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-[#27AE60]/10 flex items-center justify-center">
//                   <FileText className="w-4 h-4 text-[#27AE60]" />
//                 </div>
//                 <div>
//                   <p className="font-black text-slate-800 truncate max-w-[200px] sm:max-w-xs">
//                     {previewDoc.filename || previewDoc.title}
//                   </p>
//                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Document Preview</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setPreviewDoc(null)}
//                 className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="flex-1 bg-slate-100 p-3 sm:p-5 overflow-hidden min-h-[300px]">
//               <div className="w-full h-full min-h-[280px] bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
//                 {previewDoc.mimetype?.includes("pdf")
//                   ? <iframe src={previewDoc.url} className="w-full h-full min-h-[400px]" title="PDF Preview" />
//                   : <img src={previewDoc.url} alt="Preview" className="max-w-full max-h-[60vh] object-contain" />
//                 }
//               </div>
//             </div>
//             <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
//               <button
//                 onClick={() => setPreviewDoc(null)}
//                 className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── DocBadge ──
// function DocBadge({ status }) {
//   const cfg = {
//     verified: { icon: <CheckCircle className="w-3 h-3" />, bg: "#f0fdf4", color: "#15803d" },
//     rejected: { icon: <XCircle className="w-3 h-3" />, bg: "#fff1f2", color: "#dc2626" },
//     pending: { icon: <AlertTriangle className="w-3 h-3" />, bg: "#fffbeb", color: "#d97706" },
//   };
//   const c = cfg[status] || { icon: null, bg: "#f8fafc", color: "#64748b" };
//   return (
//     <span
//       className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mt-1"
//       style={{ background: c.bg, color: c.color }}
//     >
//       {c.icon} {status}
//     </span>
//   );
// // }a





///////////////////////////////////////////////////// 


// StepVerifyPublish.jsx — select doc type → upload → auto-save via verification PATCH
import { useState, useRef, useMemo } from "react";
import {
  CheckCircle, XCircle, Eye, Upload, FileText,
  AlertTriangle, FileCheck, Info, Rocket, X, Plus, FolderOpen, Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DOC_TYPE_OPTIONS = [
  { id: "ec",         label: "Encumbrance Certificate (EC)" },
  { id: "tax",        label: "Municipal Tax Receipt" },
  { id: "utility",    label: "Water or Electricity Bill" },
  { id: "sale_deed",  label: "Sale Deed" },
];

export default function StepVerifyPublish({
  data,
  onSubmit,
  onVerifyDocument,
  onUploadDocument,   
  onUpdateField,      // (field, value) => void
}) {
  const [previewDoc, setPreviewDoc]   = useState(null);
  const [newDocType,  setNewDocType]  = useState("");
  const [uploading,   setUploading]   = useState(false);
  const fileInputRef = useRef(null);
  const navigate     = useNavigate();

  if (!data) return null;

  // ── 1. Server docs (already saved) ──────────────────────────────────────
  const serverDocs = useMemo(
    () => (data.verificationDocuments || data.documents || []).map((d) => ({ ...d, isPersistent: true })),
    [data.verificationDocuments, data.documents],
  );

  // ── 2. Local docs (newly queued, not yet saved) ──────────────────────────
  const localDocs = useMemo(
    () =>
      (data.documentsFiles || [])
        .map((item) => {
          const actualFile = item?.file || item;
          const url        = item.preview || (actualFile instanceof File ? URL.createObjectURL(actualFile) : null);
          return {
            filename : actualFile?.name,
            mimetype : actualFile?.type,
            status   : item.status   || "pending",
            type     : item.docType  || data.verificationDocumentType || "NEW",
            url,
            file     : actualFile,
            isLocal  : true,
          };
        })
        .filter(Boolean),
    [data.documentsFiles, data.verificationDocumentType],
  );

  // ── 3. Group server docs by type ────────────────────────────────────────
  const groupedServerDocs = useMemo(() => {
    return serverDocs.reduce((acc, doc) => {
      const key = doc.type || "OTHER";
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});
  }, [serverDocs]);

  const serverDocTypes = Object.keys(groupedServerDocs);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalServer    = serverDocs.length;
  const verifiedServer = serverDocs.filter((d) => d.status === "verified").length;
  const totalLocal     = localDocs.length;

  const allDone = totalServer > 0 && verifiedServer === totalServer && totalLocal === 0;

  // ── Handle doc type change → also persist to Redux via onUpdateField ─────
  const handleDocTypeChange = (value) => {
    setNewDocType(value);
    // keep Redux in sync so thunk can read verificationDocumentType
    onUpdateField?.("verificationDocumentType", value);
  };

  // ── Handle file upload ────────────────────────────────────────────────────
  // Flow:
  //   1. User picks files
  //   2. We format them with docType attached
  //   3. Call onUploadDocument → EditWizard.handleUploadDocument
  //      → dispatch(setDocumentsFiles) + dispatch(savePropertyData {step:"verification"})
  //      → propertyThunks builds FormData with verificationType + verificationDocuments
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (!newDocType) {
      alert("Please select a Document Type before uploading.");
      e.target.value = null;
      return;
    }

    setUploading(true);

    try {
      const formattedFiles = files.map((f) => ({
        file    : f,
        docType : newDocType,          // used in localDocs display
        preview : URL.createObjectURL(f),
        source  : "local",
        status  : "pending",
      }));

      // This calls EditWizard.handleUploadDocument which:
      //   1. dispatch(setDocumentsFiles(formattedFiles))
      //   2. dispatch(savePropertyData({ step:"verification", data:{ ...current, documentsFiles: formattedFiles } }))
      // propertyThunks then reads:
      //   verificationDocumentType  → fd.append("verificationType", ...)
      //   documentsFiles            → fd.append("verificationDocuments", file)
      await onUploadDocument?.(formattedFiles);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="space-y-7">

      {/* ═══════════════════════════════════════════
          SECTION 1 — Existing (Server) Documents
      ═══════════════════════════════════════════ */}
      <div
        className="bg-white rounded-3xl border-2 overflow-hidden"
        style={{ borderColor: "#27AE6018", boxShadow: "0 4px 24px #27AE6008" }}
      >
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,#27AE6060,#27AE6015,transparent)" }} />

        {/* Header */}
        <div className="px-5 sm:px-7 py-5 border-b border-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-[#27AE60]" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">Submitted Documents</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {totalServer} document{totalServer !== 1 ? "s" : ""} · {verifiedServer} verified
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7 bg-slate-50/30 space-y-5">
          {serverDocTypes.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documents on record</p>
            </div>
          ) : (
            serverDocTypes.map((type) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3 h-3 text-[#27AE60]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">{type}</span>
                  <div className="flex-1 h-px bg-[#27AE60]/10" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {groupedServerDocs[type].length} file{groupedServerDocs[type].length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2 pl-1">
                  {groupedServerDocs[type].map((doc, idx) => (
                    <div
                      key={doc.filename || idx}
                      className="bg-white border-2 border-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#27AE60]/20 transition-all group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#27AE60] group-hover:bg-[#27AE60]/8 transition-all shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700 truncate max-w-[180px] sm:max-w-[300px]">
                            {doc.filename || doc.title}
                          </p>
                          <DocBadge status={doc.status} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <FileText className="w-4 h-4" />,  label: "Total",    value: totalServer,                   color: "#3B82F6", active: true },
          { icon: <FileCheck className="w-4 h-4" />, label: "Verified", value: verifiedServer,                color: "#27AE60", active: verifiedServer > 0 },
          { icon: <AlertTriangle className="w-4 h-4" />, label: "Pending", value: totalServer - verifiedServer, color: "#F59E0B", active: (totalServer - verifiedServer) > 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 sm:p-5 rounded-2xl border-2 transition-all"
            style={{ borderColor: s.active ? `${s.color}25` : "#f1f5f9", background: s.active ? `${s.color}08` : "#f8fafc" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.active ? `${s.color}15` : "#e2e8f0", color: s.active ? s.color : "#94a3b8" }}>{s.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.active ? s.color : "#94a3b8" }}>{s.label}</p>
            <p className="text-2xl sm:text-3xl font-black tabular-nums" style={{ color: s.active ? s.color : "#cbd5e1" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2 — Add New Document
          1. Select type (updates Redux verificationDocumentType)
          2. Upload files → onUploadDocument → saves to backend
      ═══════════════════════════════════════════ */}
      <div
        className="bg-white rounded-3xl border-2 overflow-hidden"
        style={{ borderColor: "#3B82F618", boxShadow: "0 4px 24px #3B82F608" }}
      >
        <div className="h-0.5" style={{ background: "linear-gradient(90deg,#3B82F660,#3B82F615,transparent)" }} />

        {/* Header — type selector + upload button */}
        <div className="px-5 sm:px-7 py-5 border-b border-slate-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Add New Document</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Select type → upload → saves automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* ── Step 1: pick type ── */}
            <select
              value={newDocType}
              onChange={(e) => handleDocTypeChange(e.target.value)}
              className="text-xs font-black text-slate-700 border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"
              style={{ minWidth: "170px" }}
            >
              <option value="">① Select Type…</option>
              {DOC_TYPE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>

            {/* ── Step 2: upload (enabled only when type selected) ── */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,image/*"
              multiple
            />
            <button
              type="button"
              onClick={() => {
                if (!newDocType) { alert("Please select a Document Type first."); return; }
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background  : newDocType ? "linear-gradient(135deg,#1e293b,#0f172a)" : "#cbd5e1",
                boxShadow   : newDocType ? "0 4px 14px rgba(0,0,0,0.25)" : "none",
                cursor      : newDocType && !uploading ? "pointer" : "not-allowed",
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Saving…" : "② Upload & Save"}
            </button>
          </div>
        </div>

        {/* Local (pending) docs list */}
        <div className="p-5 sm:p-7 bg-slate-50/30">
          {localDocs.length === 0 ? (
            <div
              onClick={() => { if (newDocType) fileInputRef.current?.click(); }}
              className="border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all group"
              style={{
                borderColor : newDocType ? "#3B82F640" : "#e2e8f0",
                cursor      : newDocType ? "pointer" : "default",
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-50 transition-all shadow-sm">
                <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="font-black text-slate-500 text-sm">
                {newDocType
                  ? `Click to upload as "${DOC_TYPE_OPTIONS.find((o) => o.id === newDocType)?.label || newDocType}"`
                  : "① Select a type above, then ② upload"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                PDF or image · saved to server immediately on upload
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending Verification</span>
                <div className="flex-1 h-px bg-amber-100" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {localDocs.length} file{localDocs.length !== 1 ? "s" : ""} · saved, awaiting review
                </span>
              </div>

              {localDocs.map((doc, idx) => (
                <div
                  key={doc.filename || idx}
                  className="bg-white border-2 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all group"
                  style={{ borderColor: "#FDE68A" }}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700 truncate max-w-[180px] sm:max-w-[280px]">
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter"
                          style={{ background: "#eff6ff", color: "#2563eb" }}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {DOC_TYPE_OPTIONS.find((o) => o.id === doc.type)?.label || doc.type}
                        </span>
                        <DocBadge status={doc.status} />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Warning ── */}
      {!allDone && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
          <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-amber-700 leading-relaxed">
            {totalServer === 0
              ? "⚠️ No verified documents found. Select a type, upload a document, and it will be saved automatically."
              : verifiedServer < totalServer
                ? `⚠️ ${totalServer - verifiedServer} document(s) are still pending verification.`
                : localDocs.length > 0
                  ? "⚠️ Documents uploaded. Awaiting admin verification before publishing."
                  : "Publishing restricted until all documents are verified."}
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-slate-100">
        <button
          onClick={() => navigate(`/${data.propertyCategory}`)}
          className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200 text-center"
          style={{ background: "#f1f5f9", color: "#475569" }}
        >
          Exit
        </button>
        {/* <button
          onClick={onSubmit}
          disabled={!allDone}
          className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
          style={{
            background : allDone ? "linear-gradient(135deg,#27AE60,#1a9e50)" : "#e2e8f0",
            color      : allDone ? "#fff" : "#94a3b8",
            boxShadow  : allDone ? "0 10px 30px #27AE6035" : "none",
            cursor     : allDone ? "pointer" : "not-allowed",
          }}
        >
           {allDone && <Rocket className="w-4 h-4" />} 
          {allDone ? "exit" : "Complete Verification"} 
        </button> */}
      </div>

      {/* ── Preview Modal ── */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-8">
          <div
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[92vh]"
            style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#27AE60]/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#27AE60]" />
                </div>
                <div>
                  <p className="font-black text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                    {previewDoc.filename || previewDoc.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Document Preview</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
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
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DocBadge ──────────────────────────────────────────────────────────────
function DocBadge({ status }) {
  const cfg = {
    verified : { icon: <CheckCircle className="w-3 h-3" />,    bg: "#f0fdf4", color: "#15803d" },
    rejected : { icon: <XCircle className="w-3 h-3" />,        bg: "#fff1f2", color: "#dc2626" },
    pending  : { icon: <AlertTriangle className="w-3 h-3" />,  bg: "#fffbeb", color: "#d97706" },
  };
  const c = cfg[status] || { icon: null, bg: "#f8fafc", color: "#64748b" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mt-1"
      style={{ background: c.bg, color: c.color }}
    >
      {c.icon} {status || "unknown"}
    </span>
  );
}