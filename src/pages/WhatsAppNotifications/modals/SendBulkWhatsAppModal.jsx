// src/pages/WhatsAppNotifications/modals/SendBulkWhatsAppModal.jsx
import { useState } from "react";
import {
  Send,
  FileSpreadsheet,
  Upload,
  X,
  Loader2,
  FileText,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { sentBulkWhatsAppNotification } from "../../../features/user/userService";
import { Modal } from "./Modal";

export const SendBulkWhatsAppModal = ({ template, onClose }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  const accept = (f) => {
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) {
      setFile(f);
    } else {
      toast.error("Please upload a .csv or .xlsx file");
    }
  };

  const handleSend = async () => {
    if (!file) {
      toast.error("Upload a file first");
      return;
    }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("templateName", template.name);
      await sentBulkWhatsAppNotification(fd);
      toast.success("Bulk WhatsApp campaign started! 🚀");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk send failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Bulk Send — ${template.name}`}
      icon={<FileSpreadsheet size={16} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {/* Template banner */}
        <div className="flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
              Template
            </p>
            <p className="text-xs font-semibold text-green-900 font-mono truncate">
              {template.name}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              template.status === "APPROVED"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {template.status}
          </span>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <FileText size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file.
            Template{" "}
            <span className="font-mono bg-blue-100 px-1 rounded">
              {template.name}
            </span>{" "}
            will be sent to each row. Columns must match your template
            variables.
          </p>
        </div>

        {/* Drop zone */}
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
          onClick={() => document.getElementById("wa-bulk-file-inp")?.click()}
          className={`flex flex-col items-center justify-center gap-3 py-8 px-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragging || file
              ? "border-[#25D366] bg-[#E8F8EF]"
              : "border-gray-200 bg-gray-50 hover:border-[#25D366] hover:bg-[#E8F8EF]/50"
          }`}
        >
          <input
            id="wa-bulk-file-inp"
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => accept(e.target.files[0])}
          />
          {file ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-sm shadow-green-200">
                <FileSpreadsheet size={22} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-green-800 break-all">
                  {file.name}
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB — ready to send
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={11} /> Remove file
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center">
                <Upload size={22} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">
                  Drop your CSV
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  or tap to browse · .csv
                </p>
              </div>
            </>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={busy || !file}
          className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-2xl hover:bg-[#1EAF54] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 14px rgba(37,211,102,.3)" }}
        >
          {busy ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send size={14} />
              {file ? "Send Bulk Campaign" : "Upload File First"}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
