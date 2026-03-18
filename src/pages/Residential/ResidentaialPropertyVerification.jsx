// frontend/admin-dashboard/src/pages/Residential/ResidentaialPropertyVerification.jsx
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
  Loader2,
  Eye,
  FileImage,
  Menu, // New icon
  X, // New icon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  fetchResidentialById,
  updateResidentialDocumentStatus,
} from "../../services/ResidentialServices/ResidentialServices";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  const { data: response, isLoading } = useQuery({
    queryKey: ["residential", id],
    queryFn: () => fetchResidentialById(id),
  });

  const property = response?.data;
  console.log(property);

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

  const handleDownload = async (url, fileName) => {
    if (!url) return;
    setIsDownloading(true);
    try {
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
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.setAttribute("download", fileName || "document");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

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

  const mutation = useMutation({
    mutationFn: (payload) => updateResidentialDocumentStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["residential", id]);
      toast.success("Document updated");
      setShowRejectionInput(false);
      setRejectionReason("");
      const docs = property.verificationDocuments;
      const currentIndex = docs.findIndex((d) => d.url === selectedDoc.url);
      if (currentIndex < docs.length - 1) {
        setSelectedDoc(docs[currentIndex + 1]);
      } else {
        toast.success("All documents processed!");
        setTimeout(() => navigate("/residential"), 1500);
      }
    },
    onError: () => toast.error("Failed to update status"),
  });

  if (isLoading)
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="animate-spin text-[#27AE60] mb-4" size={48} />
        <span className="text-slate-400 animate-pulse font-medium text-center">
          Initializing Secure Viewer...
        </span>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0b0f1a] border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-widest text-white">
          Verification
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-[#27AE60]"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR (Responsive) */}
      <aside
        className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 fixed lg:relative z-40 w-full lg:w-[350px] h-[calc(100vh-64px)] lg:h-full 
        transition-transform duration-300 ease-in-out border-r border-slate-800 flex flex-col bg-[#0b0f1a]
      `}
      >
        <div className="p-6 border-b border-slate-800 hidden lg:block">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-semibold">Back to Properties</span>
          </button>
          <h1 className="text-xl font-bold text-white">Documents</h1>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <span>Progress</span>
            <span className={progress === 100 ? "text-green-500" : ""}>
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className={`h-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {property.verificationDocuments?.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDoc(doc);
                setShowRejectionInput(false);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                selectedDoc?.url === doc.url
                  ? "bg-blue-600/10 border-blue-500/50"
                  : "bg-slate-900/40 border-slate-800"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${selectedDoc?.url === doc.url ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                {getFileType(doc.url) === "image" ? (
                  <FileImage size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-[10px] font-bold text-slate-100 truncate uppercase">
                  {doc.type?.replace("_", " ")}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
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
          ))}
        </div>
      </aside>

      {/* VIEWER AREA */}
      <main className="flex-1 flex flex-col bg-[#010409] relative">
        <header className="h-16 lg:h-20 border-b border-slate-800/60 flex items-center justify-between px-4 lg:px-8 bg-[#0b0f1a]/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="hidden sm:block p-2 bg-slate-800 rounded-xl text-blue-400">
              {getFileType(selectedDoc?.url) === "image" ? (
                <FileImage size={18} />
              ) : (
                <FileText size={18} />
              )}
            </div>
            <div className="truncate">
              <h2 className="text-xs lg:text-sm font-bold text-white truncate">
                {selectedDoc?.title}
              </h2>
              <p className="text-[9px] font-black text-slate-500 uppercase">
                {selectedDoc?.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleDownload(selectedDoc?.url, selectedDoc?.title)
              }
              disabled={isDownloading}
              className="p-2 lg:p-3 bg-slate-800/50 rounded-xl text-slate-400"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
            </button>
            <button
              onClick={() => setIsFullScreen(true)}
              className="p-2 lg:p-3 bg-slate-800/50 rounded-xl text-slate-400"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-2 lg:p-8 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full max-w-5xl h-full bg-[#0b0f1a] rounded-2xl lg:rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto relative bg-slate-900/50 flex items-center justify-center p-2">
              {getFileType(selectedDoc?.url) === "pdf" ? (
                <iframe
                  src={`${selectedDoc?.url}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="PDF"
                />
              ) : (
                <img
                  src={selectedDoc?.url}
                  alt="Doc"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Actions */}
            <div className="p-4 lg:p-6 bg-[#0f172a] border-t border-slate-800">
              {showRejectionInput ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    placeholder="Reason..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-1 ring-red-500 outline-none"
                    onChange={(e) => setRejectionReason(e.target.value)}
                    value={rejectionReason}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectionInput(false)}
                      className="px-4 py-2 text-slate-400 text-[10px] font-bold uppercase"
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
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-slate-500">
                    <Eye size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      Inspector Mode
                    </span>
                  </div>
                  <div className="flex w-full sm:w-auto gap-3">
                    <button
                      onClick={() => setShowRejectionInput(true)}
                      className="flex-1 sm:flex-none px-6 lg:px-8 py-3 lg:py-4 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase"
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
                      className="flex-1 sm:flex-none px-10 lg:px-12 py-3 lg:py-4 bg-[#27AE60] text-white rounded-xl text-[10px] font-black uppercase"
                    >
                      {mutation.isPending ? "..." : "Approve"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FULLSCREEN MODAL (Maintained your logic) */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 p-4 lg:p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xs font-bold truncate pr-4">
                {selectedDoc?.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`p-3 rounded-full ${isZoomed ? "bg-blue-600" : "bg-white/10"}`}
                >
                  <Maximize2 size={20} />
                </button>
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="p-3 bg-white/10 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              {getFileType(selectedDoc?.url) === "pdf" ? (
                <iframe
                  src={selectedDoc?.url}
                  className="w-full h-full"
                  title="FS PDF"
                />
              ) : (
                <motion.img
                  src={selectedDoc?.url}
                  animate={{ scale: isZoomed ? 2.5 : 1 }}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyVerification;



