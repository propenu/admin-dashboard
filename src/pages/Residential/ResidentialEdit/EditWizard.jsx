// frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/EditWizard.jsx
import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import debounce from "lodash/debounce";

// Components
import CompletionHeader from "./components/editable/CompletionHeader";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

// Actions & Thunks
import { actions } from "../../../store/newIndex";
import { savePropertyData } from "../../../store/common/propertyThunks";

// Steps
import StepBasicDetails from "./steps/StepBasicDetails";
import StepLocationDetails from "./steps/StepLocationDetails";
import StepPropertyDetails from "./steps/StepPropertyDetails";
import StepVerifyPublish from "./steps/StepVerifyPublish";

export default function EditWizard() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const category = useSelector(
    (state) => state.ui.activeCategory || "residential",
  );
  const { form: current, loading } = useSelector(
    (state) => state[category] || {},
  );

  const debouncedAutoSave = useCallback(
    debounce(async (stepName) => {
      try {
        await dispatch(
          savePropertyData({ category, id, step: stepName }),
        ).unwrap();
        console.log(`Patch applied: ${stepName}`);
      } catch (err) {
        console.error("Auto-save failed:", err.message);
      }
    }, 1000),
    [id, category, dispatch],
  );

  const handleFieldUpdate = (field, value, stepName) => {
    dispatch(actions[category].updateField({ key: field, value }));
    debouncedAutoSave(stepName);
  };

  /**
   * ✅ ADDED: UPLOAD DOCUMENT HANDLER
   * This bridges the gap between the file input and Redux
   */
  // const handleUploadDocument = (file) => {
  //   // 1. Create a local blob URL so the user can preview it immediately
  //   const localUrl = URL.createObjectURL(file);

  //   // 2. Format the new document object
  //   const newDoc = {
  //     filename: file.name,
  //     type: "Property Document",
  //     mimetype: file.type,
  //     url: localUrl,
  //     status: "pending",
  //     file: file, // Important: Store the raw file to upload to the server later
  //   };

  //   dispatch(
  //     actions[category].updateField({
  //       key: "documentsFiles",
  //       value: [...(current.documentsFiles || []), file],
  //     }),
  //   );


  //   // 4. Trigger sync with backend
  //   debouncedAutoSave("verification");
  //   toast.success("Document added");
  // };

  const handleUploadDocument = async (file) => {
    const fd = new FormData();
    fd.append("verificationDocuments", file);

    try {
      await dispatch(
        savePropertyData({
          category,
          id,
          step: "verification",
          formData: fd, // 👈 pass FormData explicitly
        }),
      ).unwrap();

      toast.success("Document uploaded");
    } catch (err) {
      toast.error("Upload failed");
    }
  };
  const handleVerifyDocument = (index, status) => {
    const updatedDocs = [...(current.verificationDocuments || [])];
    if (updatedDocs[index]) {
      updatedDocs[index] = { ...updatedDocs[index], status };
      dispatch(
        actions[category].updateField({
          key: "verificationDocuments",
          value: updatedDocs,
        }),
      );
      debouncedAutoSave("verification");
    }
  };

  const handleStepSave = async (stepName) => {
    toast.loading(`Saving ${stepName}...`, { id: "step-save" });
    try {
      await dispatch(
        savePropertyData({ category, id, step: stepName }),
      ).unwrap();
      toast.success("Progress saved", { id: "step-save" });
    } catch (err) {
      toast.error("Save failed", { id: "step-save" });
    }
  };

  const handleSubmit = async () => {
    toast.loading("Finalizing property...", { id: "edit-submit" });
    try {
      await dispatch(
        savePropertyData({ category, id, step: "verification" }),
      ).unwrap();
      toast.success("Property Published!", { id: "edit-submit" });
      navigate(`/${category}/dashboard`);
    } catch (err) {
      toast.error(err.message, { id: "edit-submit" });
    }
  };

  if (!current || current._id !== id) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <p className="text-slate-500">Property data not found in state.</p>
        <button
          onClick={() => navigate(`/${category}`)}
          className="rounded-lg bg-green-600 px-4 py-2 text-white"
        >
          {`Go to ${category}`}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20 pt-10">
      <CompletionHeader completion={current?.completion?.percent || 0} />

      <div className="space-y-12">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <StepBasicDetails
            data={current}
            onChange={(f, v) => handleFieldUpdate(f, v, "basic")}
            onSave={() => handleStepSave("basic")}
          />
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <StepLocationDetails
            data={current}
            onChange={(f, v) => handleFieldUpdate(f, v, "location")}
            onSave={() => handleStepSave("location")}
          />
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <StepPropertyDetails
            data={current}
            onChange={(f, v) => handleFieldUpdate(f, v, "details")}
            onSave={() => handleStepSave("details")}
          />
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <StepVerifyPublish
            data={current}
            onVerifyDocument={handleVerifyDocument}
            onUploadDocument={handleUploadDocument} // ✅ Passed here
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </div>
  );
}
