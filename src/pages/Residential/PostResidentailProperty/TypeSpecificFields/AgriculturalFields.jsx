// AgriculturalFields.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";
import { savePropertyData } from "../../../../store/common/propertyThunks";

import TopHeader from "./common/BasicCommonComponents/TopHeader";
import Amenities from "./common/BasicCommonComponents/Amenities";
import Specifications from "./common/BasicCommonComponents/Specifications";
import Currency from "./common/BasicCommonComponents/Currency";
import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
import AgricuturalBooleanFeatures from "./common/BasicCommonComponents/AgriculturalBooleanFeatures";
import AreaUnit from "./common/BasicCommonComponents/AreaUnit";
import LandShape from "./common/BasicCommonComponents/LandShape";
import SoilType from "./common/BasicCommonComponents/SoilType";
import IrrigationType from "./common/BasicCommonComponents/IrrigationType";
import CurrentCrop from "./common/BasicCommonComponents/CurrentCrop";
import LandName from "./common/BasicCommonComponents/LandName";
import Suitablefor from "./common/BasicCommonComponents/SuitableFor";
import BoreWellDetails from "./common/BasicCommonComponents/BorewellDetails";
import PlanTationAge from "./common/BasicCommonComponents/PlantationAge";
import NumberOfBorewells from "./common/BasicCommonComponents/NumberOfBorewells";
import WaterSource from "./common/BasicCommonComponents/WaterSource";
import AccessRoadType from "./common/BasicCommonComponents/AccessRoadType";
import StatePurchaseRestrictions from "./common/BasicCommonComponents/StatePurchaseRestrictions";
import UploadGallery from "./common/BasicCommonComponents/UploadGallery";

const STEPS = [
  { label: "Land & Area Details" },
  { label: "Water & Infrastructure" },
  { label: "Pricing & Legal" },
];

const SectionCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm space-y-6 ${className}`}>
    {children}
  </div>
);

export default function AgriculturalFields({ back, next }) {
  const dispatch = useDispatch();
  const { form } = useActivePropertySlice();
  const [errors, setErrors] = useState({});
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSubSteps = STEPS.length;

  const topRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  /* ─── Validation ─────────────────────────────────────────── */

  const validateStep1 = () => {
    const e = {};
    if (!form.areaUnit) e.areaUnit = "Area unit is required";
    if (!form.landShape) e.landShape = "Land shape is required";
    if (!form.soilType) e.soilType = "Soil type is required";
   
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.waterSource) e.waterSource = "Water source is required";
    if (!form.amenities?.length) e.amenities = "Select at least one amenity";
    if (!form.accessRoadType) e.accessRoadType = "Access road type is required";
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.currency) e.currency = "Currency is required";
     if (!form.galleryFiles || form.galleryFiles.length < 5)
       e.galleryFiles = "Upload at least Five image";
    return e;
  };

  /* ─── Real-time error clearing ───────────────────────────── */

  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (form.areaUnit) delete updated.areaUnit;
      if (form.totalArea?.value > 0) delete updated.totalArea;
      if (form.waterSource) delete updated.waterSource;
      
      if (form.galleryFiles?.length > 0) delete updated.galleryFiles;
      return updated;
    });
  }, [form]);

  /* ─── Navigation ─────────────────────────────────────────── */

  const handleInternalNext = async () => {
    let validationErrors = {};
    if (subStep === 1) validationErrors = validateStep1();
    else if (subStep === 2) validationErrors = validateStep2();
    else if (subStep === 3) validationErrors = validateStep3();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.galleryFiles) galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else setTimeout(scrollToTop, 50);
      return;
    }

    if (subStep < totalSubSteps) {
      setSubStep(subStep + 1);
      setTimeout(scrollToTop, 50);
    } else {
      const activeCategory = localStorage.getItem("activeCategory");
      const propertyId = localStorage.getItem(`${activeCategory}_propertyId`);
      if (!propertyId) { toast.error("Property ID missing."); return; }
      setIsSubmitting(true);
      dispatch(savePropertyData({ category: "agricultural", id: propertyId, step: "details" }))
        .unwrap()
        .then(() => { toast.success("Agricultural details saved successfully"); next(); })
        .catch((err) => toast.error(err?.message || "Failed to save details"))
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleInternalBack = () => {
    if (subStep > 1) { setSubStep(subStep - 1); setTimeout(scrollToTop, 10); }
    else back();
  };

  const progressPct = Math.round((subStep / totalSubSteps) * 100);

  return (
    <div ref={topRef} className="w-full max-w-3xl mx-auto space-y-6">
      <TopHeader />

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-[#e6f4ec] px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest">
              Step {subStep} of {totalSubSteps}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#d1d5db]" />
            <span className="text-[11px] font-bold text-[#27AE60] uppercase tracking-widest">
              {STEPS[subStep - 1].label}
            </span>
          </div>
          <span className="text-xs font-bold text-[#27AE60]">{progressPct}%</span>
        </div>
        <div className="w-full bg-[#f0fdf4] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#27AE60] to-[#52D689] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${i + 1 <= subStep ? "bg-[#27AE60]" : "bg-[#e5e7eb]"}`} />
              <span className={`text-[10px] font-bold hidden sm:block ${i + 1 === subStep ? "text-[#27AE60]" : "text-[#9ca3af]"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 — Land & Area Details */}
      {subStep === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AreaUnit error={errors.areaUnit} />
              <LandShape error={errors.landShape} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SoilType error={errors.soilType} />
              <IrrigationType error={errors.irrigationType} />
              <CurrentCrop error={errors.currentCrop} />
            </div>
          </SectionCard>
          <SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <LandName error={errors.landName} /> */}
              <Suitablefor error={errors.suitableFor} />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Step 2 — Water & Infrastructure */}
      {subStep === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionCard>
            <BoreWellDetails errors={errors} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlanTationAge error={errors.plantationAge} />
              <NumberOfBorewells error={errors.numberOfBorewells} />
            </div>
          </SectionCard>
          <SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <WaterSource error={errors.waterSource} />
              <AccessRoadType error={errors.accessRoadType} />
              <StatePurchaseRestrictions error={errors.statePurchaseRestrictions} />
            </div>
          </SectionCard>
          <SectionCard>
            <Amenities error={errors.amenities} />
            <Specifications error={errors.specifications} />
          </SectionCard>
        </div>
      )}

      {/* Step 3 — Pricing & Legal */}
      {subStep === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Currency error={errors.currency} />
              <BanksApproved error={errors.banksApproved} />
            </div>
          </SectionCard>
          <SectionCard>
            <DescriptionMain error={errors.description} />
          </SectionCard>
          <SectionCard>
            <AgricuturalBooleanFeatures error={errors.agriculturalFeatures} />
          </SectionCard>
          <div ref={galleryRef}>
            <SectionCard>
              <UploadGallery error={errors.galleryFiles} />
            </SectionCard>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={handleInternalBack}
          className="flex-1 py-3.5 rounded-xl border-2 border-[#27AE60] text-[#27AE60] text-sm font-bold hover:bg-[#f0fdf4] transition-all"
        >
          {subStep === 1 ? "← Back" : "← Previous"}
        </button>
        <button
          disabled={isSubmitting}
          onClick={handleInternalNext}
          className={`flex-1 py-3.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg shadow-green-200/60 ${
            isSubmitting
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-[#27AE60] to-[#52D689] hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          {isSubmitting ? "Saving…" : subStep === totalSubSteps ? "Save & Continue →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}