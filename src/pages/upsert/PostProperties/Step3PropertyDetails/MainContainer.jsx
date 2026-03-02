

// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step3PropertyDetails/MainContainer.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../../../store/newIndex";
import { savePropertyData } from "../../../../store/common/propertyThunks";


// Import the specific field sets
import ResidentialFields from "../TypeSpecificFields/ResidentailFields/ResidentialFields";
import AgriculturalFields from "../TypeSpecificFields/AgriculturalFields";
import CommercialFields from "../TypeSpecificFields/CommercialFields";
import LandFields from "../TypeSpecificFields/LandFields";
import { toast } from "sonner";
// import { setActiveCategory } from "../../../../store/Ui/uiSlice";
export default function MainContainer({  next, back }) {
  const dispatch = useDispatch();

  // ✅ CATEGORY FROM REDUX
   const category = useSelector((state) => state.ui.activeCategory);

  // 🟢 SAFETY GUARD
  if (!actions[category]) {
    return (
      <div className="p-4 bg-red-50 text-red-600 font-bold rounded-lg">
        Invalid category selected
      </div>
    );
  }

  
  // 🟢 Dynamically select form state from the correct slice
  const form = useSelector((state) => state[category]?.form || {});
  const [errors, setErrors] = useState({});

  // Auto-scroll to top on category change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category]);

  /* -----------------------------------------------------------
      1. DATA UPDATE HELPERS
  ----------------------------------------------------------- */

  // Standard field update
  const updateFieldValue = (key, value) => {
    dispatch(actions[category].updateField({ key, value }));

    // Clear error for the field if it exists
    if (errors[key]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[key];
        return newErrs;
      });
    }
  };

  /**
   * 🟢 UNIVERSAL ARRAY TOGGLER
   * Ensures 'amenities' are always Objects and other features are Strings
   */
  const toggleArrayValue = (key, value) => {
    const currentArray = [...(form[key] || [])];

    // 1. Determine if this key requires Objects (like amenities/nearbyPlaces)
    const needsObject = [
      "amenities",
      "nearbyPlaces",
      "specifications",
    ].includes(key);

    if (needsObject) {
      // Ensure the incoming value is an object {key, title}
      const targetObj =
        typeof value === "string"
          ? { key: value.toLowerCase().replace(/\s+/g, "_"), title: value }
          : value;

      // Filter out any old string pollution to prevent Mongoose Cast Errors
      const cleanArray = currentArray.filter(
        (item) => typeof item === "object" && item !== null
      );

      const exists = cleanArray.some((item) => item.key === targetObj.key);
      const updatedArray = exists
        ? cleanArray.filter((item) => item.key !== targetObj.key)
        : [...cleanArray, targetObj];

      updateFieldValue(key, updatedArray);
    } else {
      // 2. Standard String Logic (for banksApproved, smartHomeFeatures, approvedByAuthority)
      const targetValue =
        typeof value === "object" && value !== null
          ? value.key || value.title
          : value;

      const exists = currentArray.includes(targetValue);
      const updatedArray = exists
        ? currentArray.filter((item) => item !== targetValue)
        : [...currentArray, targetValue];

      updateFieldValue(key, updatedArray);
    }
  };

  const addSpecification = (spec) => {
    const currentSpecs = form.specifications || [];
    const newSpec = {
      category: spec.category,
      items: [{ title: spec.title, value: spec.description || "" }],
    };
    updateFieldValue("specifications", [...currentSpecs, newSpec]);
  };

  const removeSpecification = (indexToRemove) => {
    const updatedSpecs = (form.specifications || []).filter(
      (_, index) => index !== indexToRemove
    );
    updateFieldValue("specifications", updatedSpecs);
  };

  /* -----------------------------------------------------------
      2. RENDER LOGIC
  ----------------------------------------------------------- */
  const renderSpecificFields = () => {
    const props = {
      form,
      updateFieldValue,
      toggleArrayValue,
      addSpecification,
      removeSpecification,
      category,
      errors,
       next: handleSaveAndNext,back,
      // 🟢 UNIVERSAL FILE SETTER

      setGalleryFiles: (files) => {
        const targetAction = actions[category]?.setGalleryFiles;
        if (targetAction) {
          dispatch(targetAction(files));
        } else {
          // Fallback if specific setter missing
          dispatch(
            actions[category].updateField({
              key: "galleryFiles",
              value: files,
            }),
          );
        }
      },
      // 🟢 UNIVERSAL DOC SETTER
      // setDocumentsFiles: (files) => {
      //   const targetAction = actions[category]?.setDocumentsFiles;
      //   if (targetAction) {
      //     dispatch(targetAction(files));
      //   } else {
      //     dispatch(
      //       actions[category].updateField({
      //         key: "documentsFiles",
      //         value: files,
      //       })
      //     );
      //   }
      // },
      setDocumentsFiles: (files) => {
        const targetAction = actions[category]?.setDocumentsFiles;
        if (targetAction) {
          dispatch(targetAction(files));
        } else {
          // Fallback: Using your existing universal updateField
          dispatch(
            actions[category].updateField({
              key: "documentsFiles",
              value: files,
            }),
          );
        }
      },
      // Add this helper specifically for the radio buttons
      updateDocType: (value) => {
        dispatch(
          actions[category].updateField({
            key: "verificationDocumentType",
            value,
          }),
        );
      },
    };

    switch (category) {
      case "residential":
        return <ResidentialFields  {...props} />;
      case "commercial":
        return <CommercialFields {...props} />;
      case "land":
        return <LandFields {...props} />;
      case "agricultural":
        return <AgriculturalFields {...props} />;
      default:
        return (
          <div className="p-4 text-red-500 font-bold bg-red-50 rounded-lg border border-red-100">
            Error: Category "{category}" is not supported by the MainContainer.
          </div>
        );
    }
  };

  const handleSaveAndNext = async () => {
    const propertyId = localStorage.getItem("propertyId");

    if (!propertyId) {
      toast.error("Property draft not found. Please restart.");
      return;
    }

    try {
      await dispatch(
        savePropertyData({
          category,
          id: propertyId,
          step: "details", // 🔥 THIS IS THE KEY
        }),
      ).unwrap();

      next();
    } catch (err) {
      toast.error("Failed to save property details");
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* DYNAMIC FIELD SET */}
      <div className="min-h-[400px] bg-white rounded-2xl">
        {renderSpecificFields()}
      </div>
    </div>
  );
}