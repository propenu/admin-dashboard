// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step4VerifyPublish.jsx
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Phone, X, FileText } from "lucide-react";
import { actions } from "../../../store/newIndex";
import { savePropertyData } from "../../../store/common/propertyThunks";
import { useState, useEffect } from "react";

export default function Step4VerifyPublish({ back }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const category = useSelector((state) => state.ui.activeCategory);
  const form = useSelector((state) => (category ? state[category]?.form : {}));
  const loading = useSelector((state) =>
    category ? state[category]?.loading : false,
  );

  const [previews, setPreviews] = useState([]);

  /* ================================
     Generate File Previews
  ================================= */
  useEffect(() => {
    if (!form?.documentsFiles?.length) {
      setPreviews([]);
      return;
    }

    const newPreviews = form.documentsFiles.map((file) => ({
      name: file.name,
      type: file.type,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [form?.documentsFiles]);

  /* ================================
     Document Options
  ================================= */
  const docOptions = [
    { id: "ec", label: "Encumbrance Certificate (EC)" },
    { id: "tax", label: "Municipal Tax (Receipt)" },
    { id: "utility", label: "Water or Electricity Bill" },
    { id: "sale_deed", label: "Sale Deed" },
  ];

  const handleDocTypeSelect = (id) => {
    if (!category) return;
    dispatch(
      actions[category].updateField({
        key: "verificationDocumentType",
        value: id,
      }),
    );
  };

  const handleFileChange = (e) => {
    if (!category) return;
    const files = Array.from(e.target.files);
    dispatch(actions[category].setDocumentsFiles(files));
  };

  const removeFile = (index) => {
    if (!category) return;
    const updatedFiles = form.documentsFiles.filter((_, i) => i !== index);
    dispatch(actions[category].setDocumentsFiles(updatedFiles));
  };

  /* ================================
     Publish Handler
  ================================= */
  const handlePublish = async () => {
    if (!category) {
      toast.error("Property category missing");
      return;
    }

    const propertyId = localStorage.getItem("propertyId");

    if (!propertyId) {
      toast.error("Property ID missing");
      return;
    }

    if (!form.verificationDocumentType) {
      toast.error("Please select a document type");
      return;
    }

    if (!form.documentsFiles?.length) {
      toast.error("Please upload the required document");
      return;
    }

    toast.loading("Publishing property...", { id: "publish" });

    try {
      await dispatch(
        savePropertyData({
          category,
          id: propertyId,
          step: "verification",
        }),
      ).unwrap();

      toast.success("Property Published Successfully!", {
        id: "publish",
      });

      setTimeout(() => {
        navigate(`/${category}`);
      }, 1500);
    } catch (err) {
      console.error("Publish Error:", err);
      toast.error(err?.message || "Submission failed.", { id: "publish" });
    }
  };

  /* ================================
     UI
  ================================= */
  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="bg-[#F6FFF9] border border-[#E1F5E8] p-5 rounded-2xl">
        <p className="text-[#27AE60] text-sm">
          Upload ownership proofs to verify your property and prevent duplicate
          listings.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#111111]">
          Verification & Publish
        </h2>

        <button type="button" className="flex items-center gap-1 text-sm">
          <span>Need help?</span>
          <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
          <span className="font-semibold text-[#27AE60]">Get a callback</span>
        </button>
      </div>

      {/* ================================
         Document Type Selection
      ================================= */}
      <div className="grid gap-3">
        {docOptions.map((doc) => (
          <label
            key={doc.id}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              checked={form.verificationDocumentType === doc.id}
              onChange={() => handleDocTypeSelect(doc.id)}
              className="w-5 h-5 accent-[#27AE60]"
            />
            <span className="text-sm text-slate-600">{doc.label}</span>
          </label>
        ))}
      </div>

      {/* ================================
         Preview Section
      ================================= */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((file, index) => (
            <div
              key={index}
              className="relative group border rounded-xl overflow-hidden bg-white shadow-sm h-32"
            >
              {file.url ? (
                <img
                  src={file.url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-2">
                  <FileText className="text-[#27AE60] mb-1" size={24} />
                  <p className="text-[10px] text-center truncate w-full">
                    {file.name}
                  </p>
                </div>
              )}

              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================================
         Upload Box
      ================================= */}
      <div
        className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center transition-all ${
          form.documentsFiles?.length
            ? "border-[#27AE60] bg-[#F6FFF9]"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <input
          type="file"
          id="doc-upload"
          hidden
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />

        <label htmlFor="doc-upload" className="cursor-pointer text-center">
          <UploadCloud
            size={32}
            className={
              form.documentsFiles?.length ? "text-[#27AE60]" : "text-slate-400"
            }
          />
          <p className="text-sm mt-2">
            {form.documentsFiles?.length
              ? "Add more files"
              : "Click to upload documents"}
          </p>
        </label>
      </div>

      {/* ================================
         Buttons
      ================================= */}
      <div className="flex justify-between gap-6 pt-8 border-t">
        <button
          onClick={back}
          className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50"
        >
          Previous Step
        </button>

        <button
          onClick={handlePublish}
          disabled={
            loading ||
            !form.verificationDocumentType ||
            !form.documentsFiles?.length
          }
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            loading ||
            !form.verificationDocumentType ||
            !form.documentsFiles?.length
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-[#27AE60] hover:bg-[#219150]"
          }`}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
