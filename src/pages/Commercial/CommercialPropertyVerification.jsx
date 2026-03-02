
// frontend/admin-dashboard/src/pages/Commercial/CommercialPropertyVerification.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Maximize2,
  ChevronLeft,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  FileImage,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  fetchCommercialById,
  updateCommercialDocumentStatus,
} from "../../services/CommercialServices/CommercialServices";

const PropertyVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["commercial", id],
    queryFn: () => fetchCommercialById(id),
  });

  const property = response?.data;

  // --- HELPER FUNCTIONS ---

  const getFileType = (url) => {
    if (!url) return "unknown";
    const extension = url
      .split(/[#?]/)[0]
      .split(".")
      .pop()
      .trim()
      .toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension))
      return "image";
    if (extension === "pdf") return "pdf";
    return "document";
  };

  // REAL DOWNLOAD LOGIC: Triggers a true browser download
  // ... (keep all your imports and state variables)

  // UPDATED REAL DOWNLOAD LOGIC
  const handleDownload = async (url, fileName) => {
    if (!url) return;
    setIsDownloading(true);

    try {
      // 1. Try the Blob approach first (Best for images)
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "property-document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download started");
    } catch (error) {
      console.warn("CORS/Fetch failed, trying fallback download...", error);

      // 2. FALLBACK: Direct Anchor Download (Best for PDFs if CORS fails)
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      // Note: 'download' attribute only works for same-origin or CORS-enabled URLs
      link.setAttribute("download", fileName || "document");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Opening file for download...");
    } finally {
      setIsDownloading(false);
    }
  };

  // ... (keep the rest of your component)

  // --- PROGRESS CALCULATIONS ---
  const totalDocs = property?.verificationDocuments?.length || 0;
  const verifiedCount =
    property?.verificationDocuments?.filter((d) => d.status === "verified")
      .length || 0;
  const progress =
    totalDocs > 0 ? Math.round((verifiedCount / totalDocs) * 100) : 0;

  useEffect(() => {
    if (property?.verificationDocuments?.length > 0 && !selectedDoc) {
      const pendingDoc =
        property.verificationDocuments.find((d) => d.status === "pending") ||
        property.verificationDocuments[0];
      setSelectedDoc(pendingDoc);
    }
  }, [property, selectedDoc]);

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: (payload) => updateCommercialDocumentStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["commercial", id]);
      toast.success("Document updated");
      setShowRejectionInput(false);
      setRejectionReason("");

      const docs = property.verificationDocuments;
      const currentIndex = docs.findIndex((d) => d.url === selectedDoc.url);
      if (currentIndex < docs.length - 1) {
        setSelectedDoc(docs[currentIndex + 1]);
      } else {
        toast.success("All documents processed!");
        setTimeout(() => navigate("/commercial"), 1500);
      }
    },
    onError: () => toast.error("Failed to update status"),
  });

  if (isLoading)
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#27AE60] mb-4" size={48} />
        <span className="text-slate-400 animate-pulse font-medium">
          Initializing Secure Viewer...
        </span>
      </div>
    );

  return (
    <div className="flex  bg-[#020617] text-slate-200 overflow-hidden rounded-3xl font-sans">
      
      <aside className="w-[350px] border-r border-slate-800 flex flex-col bg-[#0b0f1a]">
        <div className="p-6 border-b border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-semibold">Back to Properties</span>
          </button>

          <h1 className="text-xl font-bold text-white mb-1">Verification</h1>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
              <span>Overall Progress</span>
              <span className={progress === 100 ? "text-green-500" : ""}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {property.verificationDocuments?.map((doc, idx) => {
            const isSelected = selectedDoc?.url === doc.url;
            const fileType = getFileType(doc.url);

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDoc(doc);
                  setShowRejectionInput(false);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                  isSelected
                    ? "bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/10"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${isSelected ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"}`}
                >
                  {fileType === "image" ? (
                    <FileImage size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-slate-100 truncate uppercase tracking-tight">
                    {doc.type?.replace("_", " ")}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {doc.title}
                  </p>
                </div>
                {doc.status === "verified" && (
                  <CheckCircle2 size={16} className="text-green-500" />
                )}
                {doc.status === "rejected" && (
                  <XCircle size={16} className="text-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* VIEWER AREA */}
      <main className="flex-1 flex flex-col justify-center bg-[#010409]">
        <header className="h-20 border-b border-slate-800/60 flex items-center justify-between px-8 bg-[#0b0f1a]/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-800 rounded-xl text-blue-400 ">
              {getFileType(selectedDoc?.url) === "image" ? (
                <FileImage size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none mb-1">
                {selectedDoc?.title}
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                {selectedDoc?.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                handleDownload(
                  selectedDoc?.url,
                  selectedDoc?.title || "document",
                )
              }
              disabled={isDownloading}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition disabled:opacity-50"
              title="Download File"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Download size={20} />
              )}
            </button>
            <button
              onClick={() => setIsFullScreen(true)}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              title="Fullscreen View"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-hidden flex flex-col items-center ">
          <div className="w-full max-w-5xl h-screen  bg-[#0b0f1a]  overflow-hidden flex flex-col ">
            <div className="flex-1 overflow-hidden relative bg-slate-900/50 flex rounded-sm p-4  items-center justify-center">
              {getFileType(selectedDoc?.url) === "pdf" ? (
                <iframe
                  src={`${selectedDoc.url}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              ) : (
                <div className="w-full h-full overflow-auto p-10 flex items-center justify-center custom-scrollbar">
                  <img
                    src={selectedDoc?.url}
                    alt="Property Doc"
                    className="max-w-full h-auto shadow-2xl rounded-lg object-contain transition-transform hover:scale-105 duration-500"
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-[#0f172a] border-t border-slate-800">
              {showRejectionInput ? (
                <div className="flex flex-col gap-4">
                  <textarea
                    placeholder="Provide a reason for rejection..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:ring-2 ring-red-500/50 outline-none transition"
                    onChange={(e) => setRejectionReason(e.target.value)}
                    value={rejectionReason}
                    rows={3}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectionInput(false)}
                      className="px-4 py-2 text-slate-400 text-xs font-bold uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        mutation.mutate({
                          documentIndex:
                            property.verificationDocuments.indexOf(selectedDoc),
                          status: "rejected",
                          reason: rejectionReason,
                        })
                      }
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Eye size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Inspector Mode Active
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowRejectionInput(true)}
                      className="px-8 py-4 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        mutation.mutate({
                          documentIndex:
                            property.verificationDocuments.indexOf(selectedDoc),
                          status: "verified",
                        })
                      }
                      disabled={mutation.isPending}
                      className="px-12 py-4 bg-[#27AE60] hover:bg-[#2ecc71] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 transition disabled:opacity-50"
                    >
                      {mutation.isPending ? "Syncing..." : "Approve"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FULLSCREEN MODAL */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-white">
                  {getFileType(selectedDoc?.url) === "image" ? (
                    <FileImage size={24} />
                  ) : (
                    <FileText size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedDoc?.title}</h3>
                  <p className="text-xs text-slate-500 tracking-widest uppercase">
                    {selectedDoc?.type}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`p-4 rounded-full text-white transition ${isZoomed ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"}`}
                  title={isZoomed ? "Zoom Out" : "Zoom In"}
                >
                  <Maximize2 size={24} />
                </button>
                <button
                  onClick={() =>
                    handleDownload(selectedDoc?.url, selectedDoc?.title)
                  }
                  className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
                >
                  <Download size={24} />
                </button>
                <button
                  onClick={() => {
                    setIsFullScreen(false);
                    setIsZoomed(false);
                  }}
                  className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Viewport Container */}
            <div
              className="flex-1 relative bg-slate-900/50 rounded-[2rem] overflow-hidden border border-white/5 flex items-center justify-center cursor-zoom-in"
              onMouseMove={(e) => {
                if (!isZoomed) return;
                const { left, top, width, height } =
                  e.currentTarget.getBoundingClientRect();
                const x = ((e.pageX - left) / width) * 100;
                const y = ((e.pageY - top) / height) * 100;
                setMousePos({ x, y });
              }}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {getFileType(selectedDoc?.url) === "pdf" ? (
                <iframe
                  src={selectedDoc?.url}
                  className="w-full h-full border-none"
                  title="Fullscreen PDF"
                />
              ) : (
                <motion.img
                  src={selectedDoc?.url}
                  alt="Property Document"
                  animate={{
                    scale: isZoomed ? 3.5 : 1,
                    transformOrigin: isZoomed
                      ? `${mousePos.x}% ${mousePos.y}%`
                      : "center",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                  style={{ cursor: isZoomed ? "zoom-out" : "zoom-in" }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default PropertyVerification;