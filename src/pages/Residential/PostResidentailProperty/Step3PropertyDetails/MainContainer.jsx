// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step3PropertyDetails/MainContainer.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../../../store/newIndex";
import { savePropertyData } from "../../../../store/common/propertyThunks";

import ResidentialFields from "../TypeSpecificFields/ResidentailFields/ResidentialFields";
import AgriculturalFields from "../TypeSpecificFields/AgriculturalFields";
import CommercialFields from "../TypeSpecificFields/CommercialFields";
import LandFields from "../TypeSpecificFields/LandFields";
import { toast } from "sonner";

export default function MainContainer({ next, back }) {
  const dispatch = useDispatch();
  const category = useSelector((state) => state.ui.activeCategory);

  // Safety guard
  if (!actions[category]) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-2xl text-sm">
        Invalid category selected. Please go back and try again.
      </div>
    );
  }

  const form = useSelector((state) => state[category]?.form || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category]);

  /* ─── Data Helpers ───────────────────────────────────────── */

  const updateFieldValue = (key, value) => {
    dispatch(actions[category].updateField({ key, value }));
    if (errors[key]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const toggleArrayValue = (key, value) => {
    const currentArray = [...(form[key] || [])];
    const needsObject = ["amenities", "nearbyPlaces", "specifications"].includes(key);

    if (needsObject) {
      const targetObj =
        typeof value === "string"
          ? { key: value.toLowerCase().replace(/\s+/g, "_"), title: value }
          : value;
      const cleanArray = currentArray.filter((item) => typeof item === "object" && item !== null);
      const exists = cleanArray.some((item) => item.key === targetObj.key);
      const updatedArray = exists
        ? cleanArray.filter((item) => item.key !== targetObj.key)
        : [...cleanArray, targetObj];
      updateFieldValue(key, updatedArray);
    } else {
      const targetValue =
        typeof value === "object" && value !== null ? value.key || value.title : value;
      const exists = currentArray.includes(targetValue);
      const updatedArray = exists
        ? currentArray.filter((item) => item !== targetValue)
        : [...currentArray, targetValue];
      updateFieldValue(key, updatedArray);
    }
  };

  const addSpecification = (spec) => {
    const currentSpecs = form.specifications || [];
    updateFieldValue("specifications", [
      ...currentSpecs,
      { category: spec.category, items: [{ title: spec.title, value: spec.description || "" }] },
    ]);
  };

  const removeSpecification = (indexToRemove) => {
    updateFieldValue(
      "specifications",
      (form.specifications || []).filter((_, i) => i !== indexToRemove)
    );
  };

  /* ─── Save & Next ────────────────────────────────────────── */

  const handleSaveAndNext = async () => {
    const activeCategory = localStorage.getItem("activeCategory");
    const propertyId = localStorage.getItem(`${activeCategory}_propertyId`);
    console.log("Property ID datatatatatatatatatatatatatatat:", propertyId);
    if (!propertyId) {
      console.log("Property draft not found. Please restart.");
      toast.error("Property draft not found. Please restart.");
      return;
    }
    try {
      await dispatch(savePropertyData({ category, id: propertyId, step: "details" })).unwrap();
      next();
    } catch (err) {
      toast.error("Failed to save property details");
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */

  const sharedProps = {
    form,
    updateFieldValue,
    toggleArrayValue,
    addSpecification,
    removeSpecification,
    category,
    errors,
    next: handleSaveAndNext,
    back,
    setGalleryFiles: (files) => {
      const targetAction = actions[category]?.setGalleryFiles;
      if (targetAction) {
        dispatch(targetAction(files));
      } else {
        dispatch(actions[category].updateField({ key: "galleryFiles", value: files }));
      }
    },
    setDocumentsFiles: (files) => {
      const targetAction = actions[category]?.setDocumentsFiles;
      if (targetAction) {
        dispatch(targetAction(files));
      } else {
        dispatch(actions[category].updateField({ key: "documentsFiles", value: files }));
      }
    },
    updateDocType: (value) => {
      dispatch(actions[category].updateField({ key: "verificationDocumentType", value }));
    },
  };

  const renderSpecificFields = () => {
    switch (category) {
      case "residential":   return <ResidentialFields {...sharedProps} />;
      case "commercial":    return <CommercialFields {...sharedProps} />;
      case "land":          return <LandFields {...sharedProps} />;
      case "agricultural":  return <AgriculturalFields {...sharedProps} />;
      default:
        return (
          <div className="p-5 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-2xl text-sm">
            Error: Category &quot;{category}&quot; is not supported.
          </div>
        );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderSpecificFields()}
    </div>
  );
}