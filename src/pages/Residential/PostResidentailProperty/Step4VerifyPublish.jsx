

// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step4VerifyPublish.jsx
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Phone, X, FileText, ShieldCheck, CheckCircle2 } from "lucide-react";
import { actions } from "../../../store/newIndex";
import { savePropertyData } from "../../../store/common/propertyThunks";
import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";



const CardWrapper = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-4 shadow-sm ${className}`}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-4">{children}</p>
);

export default function Step4VerifyPublish({ back }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const category = useSelector((state) => state.ui.activeCategory);
  const form = useSelector((state) => (category ? state[category]?.form : {}));
  const loading = useSelector((state) => category ? state[category]?.loading : false);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (!form?.documentsFiles?.length) { setPreviews([]); return; }
    const newPreviews = form.documentsFiles.map((file) => ({
      name: file.name,
      type: file.type,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setPreviews(newPreviews);
    return () => { newPreviews.forEach((p) => { if (p.url) URL.revokeObjectURL(p.url); }); };
  }, [form?.documentsFiles]);

  const docOptions = [
    { id: "ec", label: "Encumbrance Certificate (EC)", desc: "Official document of ownership history" },
    { id: "tax", label: "Municipal Tax Receipt", desc: "Latest property tax payment receipt" },
    { id: "utility", label: "Water or Electricity Bill", desc: "Recent utility bill in owner's name" },
    { id: "sale_deed", label: "Sale Deed", desc: "Registered sale deed document" },
  ];

  const handleDocTypeSelect = (id) => {
    if (!category) return;
    dispatch(actions[category].updateField({ key: "verificationDocumentType", value: id }));
  };

  // const handleFileChange = (e) => {
  //   if (!category) return;
  //   dispatch(actions[category].setDocumentsFiles(Array.from(e.target.files)));
  // };

const handleFileChange = async (e) => {
  if (!category) return;

  const files = Array.from(e.target.files);

  const compressedFiles = await Promise.all(
    files.map(async (file) => {
      // only compress images
      if (file.type.startsWith("image/")) {
        try {
          const options = {
            maxSizeMB: 1, // ✅ 1MB limit
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(file, options);

          // optional: rename file
          return new File([compressedFile], file.name, {
            type: compressedFile.type,
          });
        } catch (error) {
          console.error("Compression error:", error);
          return file;
        }
      }

      // for PDFs or others → no compression
      return file;
    }),
  );

  dispatch(actions[category].setDocumentsFiles(compressedFiles));
};

  const removeFile = (index) => {
    if (!category) return;
    dispatch(actions[category].setDocumentsFiles(form.documentsFiles.filter((_, i) => i !== index)));
  };

  const handlePublish = async () => {
    if (!category) { toast.error("Property category missing"); return; }
    const propertyId = localStorage.getItem("propertyId");
    if (!propertyId) { toast.error("Property ID missing"); return; }
    if (!form.verificationDocumentType) { toast.error("Please select a document type"); return; }
    if (!form.documentsFiles?.length) { toast.error("Please upload the required document"); return; }

    toast.loading("Publishing property...", { id: "publish" });
    try {
      await dispatch(savePropertyData({ category, id: propertyId, step: "verification" })).unwrap();
      toast.success("Property Published Successfully!", { id: "publish" });
      localStorage.removeItem("propertyId");
      setTimeout(() => { navigate(`/${category}`); }, 1500);
    } catch (err) {
      console.error("Publish Error:", err);
      toast.error(err?.message || "Submission failed.", { id: "publish" });
    }
  };

  const canPublish = !loading && form.verificationDocumentType && form.documentsFiles?.length;

  return (
    <div className="space-y-1 mt-1 px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#27AE60]">Verify & Publish</h2>
          <p className="text-xs text-[#000000] mt-0.5">Final step to list your property</p>
        </div>
        <button type="button" className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-2 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors  max-sm:text-[12px]  max-sm:justify-between">
          <Phone size={13} />
          Get a callback
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] rounded-2xl p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#27AE60]/10 border border-[#bbf7d0] flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-[#27AE60]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#27AE60]">Why verify your property?</p>
          <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">Upload ownership proofs to verify your property, boost credibility with buyers, and prevent duplicate listings on Propenu.</p>
        </div>
      </div>

      {/* Document Type Selection */}
      <CardWrapper>
        <SectionLabel>Select Document Type</SectionLabel>
        <div className="space-y-3">
          {docOptions.map((doc) => (
            <label
              key={doc.id}
              className={`flex items-center gap-3 p-2 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                form.verificationDocumentType === doc.id
                  ? "border-[#27AE60] bg-[#f0fdf4]"
                  : "border-[#e5e7eb] hover:border-[#bbf7d0] hover:bg-[#fafafa]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                form.verificationDocumentType === doc.id ? "border-[#27AE60] bg-[#27AE60]" : "border-[#d1d5db]"
              }`}>
                {form.verificationDocumentType === doc.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <input type="radio" checked={form.verificationDocumentType === doc.id} onChange={() => handleDocTypeSelect(doc.id)} className="sr-only" />
              <div>
                <p className={`text-sm font-semibold ${form.verificationDocumentType === doc.id ? "text-[#27AE60]" : "text-[#374151]"}`}>{doc.label}</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">{doc.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </CardWrapper>

      {/* Upload */}
      <CardWrapper>
        <SectionLabel>Upload Document</SectionLabel>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid  grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {previews.map((file, index) => (
              <div key={index} className="relative group border border-[#e6f4ec] rounded-xl overflow-hidden bg-white shadow-sm h-28">
                {file.url ? (
                  <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#f0fdf4] p-2">
                    <FileText className="text-[#27AE60] mb-1" size={22} />
                    <p className="text-[10px] text-center text-[#6b7280] truncate w-full px-1">{file.name}</p>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drop Zone */}
        <label className={`relative flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          form.documentsFiles?.length
            ? "border-[#27AE60] bg-[#f0fdf4]"
            : "border-[#d1d5db] bg-[#fafafa] hover:border-[#27AE60] hover:bg-[#f0fdf4]"
        }`}>
          <input type="file" id="doc-upload" hidden multiple accept="image/*,.pdf" onChange={handleFileChange} />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
            form.documentsFiles?.length ? "bg-[#27AE60]/10 border border-[#bbf7d0]" : "bg-white border border-[#e5e7eb]"
          }`}>
            <UploadCloud size={26} className={form.documentsFiles?.length ? "text-[#27AE60]" : "text-[#9ca3af]"} />
          </div>
          <p className="text-sm font-semibold text-[#374151]">
            {form.documentsFiles?.length ? "Add more files" : "Upload your document"}
          </p>
          <p className="text-xs text-[#9ca3af] mt-1">JPG, PNG or PDF · Max 10MB each</p>
        </label>
      </CardWrapper>

      {/* Publish readiness indicator */}
      {canPublish && (
        <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="text-[#27AE60] flex-shrink-0" />
          <p className="text-xs font-semibold text-[#27AE60]">All set! Your property is ready to be published.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={back}
          className="flex-1 py-4 border-2 border-[#e5e7eb] text-[#6b7280] font-bold rounded-2xl hover:border-[#27AE60] hover:text-[#27AE60] transition-all duration-200 text-sm"
        >
          ← Previous
        </button>
        <button
          onClick={handlePublish}
          disabled={!canPublish}
          className={`flex-1 py-4 font-bold rounded-2xl text-sm transition-all duration-200 ${
            canPublish
              ? "bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white hover:from-[#219150] hover:to-[#27AE60] shadow-lg shadow-green-200/60"
              : "bg-[#f0f0f0] text-[#c9c9c9] cursor-not-allowed"
          }`}
        >
          {loading ? "Publishing..." : "🚀 Publish Property"}
        </button>
      </div>
    </div>
  );
}