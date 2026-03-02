// // frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/steps/StepVerifyPublish.jsx
// import { useState, useRef } from "react";
// import {
//   CheckCircle,
//   XCircle,
//   Clock,
//   Eye,
//   Upload,
//   ShieldCheck,
//   AlertTriangle,
//   FileText,
//   Plus,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// /**
//  * Step 4 – Verify & Publish
//  * Updated with Document Upload Capability
//  */
// export default function StepVerifyPublish({
//   data,
//   onSubmit,
//   onVerifyDocument,
//   onUploadDocument, // Passed from parent to handle file selection
// }) {
//   const [previewDoc, setPreviewDoc] = useState(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   if (!data) return null;

//   const docs = [
//     ...(data.verificationDocuments || []),

//     ...(data.documentsFiles?.map((file) => ({
//       filename: file.name,
//       mimetype: file.type,
//       status: "pending",
//       url: URL.createObjectURL(file),
//     })) || []),
//   ];


//   // Calculate verification status
//   const totalDocs = docs.length;
//   const verifiedDocs = docs.filter((d) => d.status === "verified").length;
//   const pendingDocs = docs.filter((d) => d.status === "pending").length;
//   const rejectedDocs = docs.filter((d) => d.status === "rejected").length;
//   const allVerified = totalDocs > 0 && verifiedDocs === totalDocs;

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && onUploadDocument) {
//       onUploadDocument(file);
//       // Reset input so same file can be uploaded again if needed
//       e.target.value = null;
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 shadow-sm">
//       {/* Header */}
//       <div className="flex items-center gap-4 border-b pb-6">
//         <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-green-600">
//           <ShieldCheck className="w-8 h-8" />
//         </div>
//         <div className="flex-1">
//           <h2 className="text-xl font-bold text-gray-900">Verify & Publish</h2>
//           <p className="text-gray-500 text-sm">
//             Review documentation and go live
//           </p>
//         </div>
//         <div className="hidden sm:block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
//           Final Step
//         </div>
//       </div>

//       {/* Verification Dashboard */}
//       <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
//         <div className="p-6 bg-white border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div>
//             <h3 className="font-bold text-gray-900">Document Compliance</h3>
//             <p className="text-xs text-gray-500">
//               Ensure all legal documents are verified before publishing
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//               accept=".pdf,image/*"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
//             >
//               <Upload className="w-4 h-4" />
//               UPLOAD NEW
//             </button>

//             {totalDocs > 0 &&
//               (allVerified ? (
//                 <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
//                   <CheckCircle className="w-4 h-4" />
//                   <span className="text-[10px] font-bold uppercase">Ready</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
//                   <Clock className="w-4 h-4" />
//                   <span className="text-[10px] font-bold uppercase">
//                     Pending
//                   </span>
//                 </div>
//               ))}
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {totalDocs > 0 ? (
//             <>
//               {/* Stats Grid */}
//               <div className="grid grid-cols-3 gap-4">
//                 <StatCard
//                   label="Verified"
//                   count={verifiedDocs}
//                   color="text-green-600"
//                 />
//                 <StatCard
//                   label="Pending"
//                   count={pendingDocs}
//                   color="text-amber-500"
//                 />
//                 <StatCard
//                   label="Rejected"
//                   count={rejectedDocs}
//                   color="text-red-500"
//                 />
//               </div>

//               {/* Document List */}
//               <div className="space-y-3">
//                 {docs.map((doc, index) => (
//                   <DocumentRow
//                     key={index}
//                     doc={doc}
//                     onPreview={() => setPreviewDoc(doc)}
//                     onVerify={(status) => onVerifyDocument?.(index, status)}
//                   />
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div
//               onClick={() => fileInputRef.current?.click()}
//               className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
//             >
//               <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
//                 <Upload className="text-gray-400 group-hover:text-blue-600" />
//               </div>
//               <h3 className="text-gray-900 font-bold">No Documents Uploaded</h3>
//               <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
//                 Click here to upload property deeds, tax receipts, or ID proofs.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Publishing Tips */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <TipCard
//           step="1"
//           title="Check Pricing"
//           desc="Ensure tax and maintenance inclusions are accurate."
//           bgColor="bg-blue-50"
//           iconColor="bg-blue-600"
//         />
//         <TipCard
//           step="2"
//           title="Review Media"
//           desc="High-quality photos increase lead generation by 40%."
//           bgColor="bg-purple-50"
//           iconColor="bg-purple-600"
//         />
//       </div>

//       {/* Action Footer */}
//       <div className="flex items-center justify-between pt-8 border-t">
//         <button
//           onClick={() => navigate("/residential")}
//           className="px-6 py-3 text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors"
//         >
//           Cancel & Exit
//         </button>

//         <div className="flex gap-3">
//           <button
//             onClick={() => navigate("/residential")}
//             className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
//           >
//             Save as Draft
//           </button>

//           <button
//             onClick={onSubmit}
//             disabled={totalDocs > 0 && !allVerified}
//             className={`px-10 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
//               allVerified || totalDocs === 0
//                 ? "bg-[#27AE60] text-white hover:bg-[#219150] shadow-green-100 transform active:scale-95"
//                 : "bg-gray-200 text-gray-400 cursor-not-allowed"
//             }`}
//           >
//             <CheckCircle className="w-5 h-5" />
//             {allVerified || totalDocs === 0
//               ? "Publish Listing"
//               : "Verify to Publish"}
//           </button>
//         </div>
//       </div>

//       {/* Modals */}
//       {previewDoc && (
//         <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
//       )}
//     </div>
//   );
// }

// /* ================= HELPER COMPONENTS ================= */

// function StatCard({ label, count, color }) {
//   return (
//     <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
//       <div className={`text-2xl font-black ${color}`}>{count}</div>
//       <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
//         {label}
//       </div>
//     </div>
//   );
// }

// function TipCard({ step, title, desc, bgColor, iconColor }) {
//   return (
//     <div
//       className={`flex gap-4 p-4 ${bgColor} rounded-xl border border-opacity-50`}
//     >
//       <div
//         className={`w-10 h-10 ${iconColor} text-white flex items-center justify-center rounded-lg shrink-0 font-bold`}
//       >
//         {step}
//       </div>
//       <div>
//         <p className="text-sm font-bold text-gray-900">{title}</p>
//         <p className="text-xs text-gray-600">{desc}</p>
//       </div>
//     </div>
//   );
// }

// function DocumentRow({ doc, onPreview, onVerify }) {
//   const isPending = doc.status === "pending";

//   return (
//     <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between group hover:shadow-md transition-all">
//       <div className="flex items-center gap-4">
//         <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
//           <FileText className="w-5 h-5" />
//         </div>
//         <div className="max-w-[150px] sm:max-w-[300px]">
//           <p className="text-sm font-bold text-gray-900 truncate">
//             {doc.filename || "Uploaded Document"}
//           </p>
//           <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
//             {doc.type} • {doc.mimetype?.split("/")[1] || "File"}
//           </p>
//         </div>
//       </div>

//       <div className="flex items-center gap-2 sm:gap-4">
//         <StatusBadge status={doc.status} />

//         <div className="hidden sm:block h-8 w-[1px] bg-gray-100" />

//         <button
//           onClick={onPreview}
//           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//           title="Preview Document"
//         >
//           <Eye className="w-5 h-5" />
//         </button>

//         {isPending && (
//           <div className="flex gap-1">
//             <button
//               onClick={() => onVerify("verified")}
//               className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
//               title="Verify"
//             >
//               <CheckCircle className="w-5 h-5" />
//             </button>
//             <button
//               onClick={() => onVerify("rejected")}
//               className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
//               title="Reject"
//             >
//               <XCircle className="w-5 h-5" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatusBadge({ status }) {
//   const configs = {
//     verified: {
//       color: "text-green-600 bg-green-50 border-green-100",
//       icon: CheckCircle,
//       label: "Verified",
//     },
//     rejected: {
//       color: "text-red-600 bg-red-50 border-red-100",
//       icon: XCircle,
//       label: "Rejected",
//     },
//     pending: {
//       color: "text-amber-600 bg-amber-50 border-amber-100",
//       icon: Clock,
//       label: "Pending",
//     },
//   };
//   const config = configs[status] || configs.pending;
//   const Icon = config.icon;
//   return (
//     <span
//       className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${config.color}`}
//     >
//       <Icon className="w-3 h-3" />
//       <span className="hidden xs:inline">{config.label}</span>
//     </span>
//   );
// }

// function PreviewModal({ doc, onClose }) {
//   const isPDF = doc.mimetype?.includes("pdf");
//   const url = doc.url || (doc instanceof File ? URL.createObjectURL(doc) : "");

//   return (
//     <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
//       <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
//         <div className="p-4 border-b flex items-center justify-between bg-white">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
//               <FileText className="w-5 h-5" />
//             </div>
//             <span className="font-bold text-gray-900 truncate max-w-xs">
//               {doc.filename || "Preview"}
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <XCircle className="w-6 h-6 text-gray-400" />
//           </button>
//         </div>

//         <div className="flex-1 bg-gray-100 relative">
//           {isPDF ? (
//             <iframe src={url} className="w-full h-full border-none" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center p-8">
//               <img
//                 src={url}
//                 alt="Preview"
//                 className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
//               />
//             </div>
//           )}
//         </div>

//         <div className="p-4 bg-white border-t flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black"
//           >
//             Close Preview
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/steps/StepVerifyPublish.jsx

import { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Upload,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StepVerifyPublish({
  data,
  onSubmit,
  onVerifyDocument,
  onUploadDocument,
}) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [localPreviews, setLocalPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!data) return null;

  /* ===============================
     SAFE PREVIEW GENERATION (LIKE FIRST FILE)
  =============================== */
  useEffect(() => {
    if (!data?.documentsFiles?.length) {
      setLocalPreviews([]);
      return;
    }

    const previews = data.documentsFiles.map((file) => ({
      filename: file.name,
      mimetype: file.type,
      status: "pending",
      url: URL.createObjectURL(file),
    }));

    setLocalPreviews(previews);

    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [data?.documentsFiles]);

  /* ===============================
     MERGE SERVER + LOCAL FILES
  =============================== */
  const docs = [
    ...(data.verificationDocuments || []),
    ...localPreviews,
  ];

  /* ===============================
     STATUS CALCULATIONS
  =============================== */
  const totalDocs = docs.length;
  const verifiedDocs = docs.filter((d) => d.status === "verified").length;
  const pendingDocs = docs.filter((d) => d.status === "pending").length;
  const rejectedDocs = docs.filter((d) => d.status === "rejected").length;
  const allVerified = totalDocs > 0 && verifiedDocs === totalDocs;

  /* ===============================
     FILE UPLOAD HANDLER (MATCH FIRST FILE STYLE)
  =============================== */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length && onUploadDocument) {
      onUploadDocument(files); // pass full array like first file
    }

    e.target.value = null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 shadow-sm">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            Verify & Publish
          </h2>
          <p className="text-gray-500 text-sm">
            Review documentation and go live
          </p>
        </div>
      </div>

      {/* DOCUMENT SECTION */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">
              Document Compliance
            </h3>
            <p className="text-xs text-gray-500">
              Ensure all legal documents are verified
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,image/*"
            multiple
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            UPLOAD NEW
          </button>
        </div>

        <div className="p-6 space-y-4">
          {docs.length > 0 ? (
            docs.map((doc, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold truncate max-w-xs">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-gray-400">
                      {doc.mimetype}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={doc.status} />

                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {doc.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          onVerifyDocument?.(index, "verified")
                        }
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </button>
                      <button
                        onClick={() =>
                          onVerifyDocument?.(index, "rejected")
                        }
                      >
                        <XCircle className="w-5 h-5 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer"
            >
              <Upload className="mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">
                Click to upload documents
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="flex justify-between pt-8 border-t">
        <button
          onClick={() => navigate("/residential")}
          className="px-6 py-3 bg-gray-100 rounded-xl font-bold text-sm"
        >
          Save as Draft
        </button>

        <button
          onClick={onSubmit}
          disabled={totalDocs > 0 && !allVerified}
          className={`px-10 py-3 rounded-xl font-bold text-sm ${
            allVerified || totalDocs === 0
              ? "bg-[#27AE60] text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Publish Listing
        </button>
      </div>

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <PreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }) {
  const colors = {
    verified: "text-green-600",
    rejected: "text-red-600",
    pending: "text-amber-500",
  };

  return (
    <span className={`text-xs font-bold ${colors[status]}`}>
      {status}
    </span>
  );
}

/* PREVIEW MODAL */
function PreviewModal({ doc, onClose }) {
  const isPDF = doc.mimetype?.includes("pdf");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-bold">{doc.filename}</span>
          <button onClick={onClose}>
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 bg-gray-100">
          {isPDF ? (
            <iframe
              src={doc.url}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <img
              src={doc.url}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}