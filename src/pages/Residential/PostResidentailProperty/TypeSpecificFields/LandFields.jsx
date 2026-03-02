// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/ResidentialFields.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";
import { savePropertyData } from "../../../../store/common/propertyThunks";

// Components
import TopHeader from "./common/BasicCommonComponents/TopHeader";
import SubHeader from "./common/BasicCommonComponents/SubHeader";
import Facing from "./common/BasicCommonComponents/Facing";
import Amenities from "./common/BasicCommonComponents/Amenities";
import Specifications from "./common/BasicCommonComponents/Specifications";
import Currency from "./common/BasicCommonComponents/Currency";
import PriceDetails from "./common/BasicCommonComponents/PriceDetails";
import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
import PlotArea from "./common/BasicCommonComponents/PlotArea";
import RoadWidthFt from "./common/BasicCommonComponents/RoadWidthFt";
import LandBooleanFeatures from "./common/BasicCommonComponents/LandBooleanFeatures";
import LandUseZone from "./common/BasicCommonComponents/LandUseZone";
import SurveyNumber from "./common/BasicCommonComponents/SurveyNumber";
import LayoutType from "./common/BasicCommonComponents/LayoutType";
import LandDimensions from "./common/BasicCommonComponents/LandDimensions";
import ApprovedByAuthority from "./common/BasicCommonComponents/ApprovedByAuthority";
import LandName from "./common/BasicCommonComponents/LandName";
import Status from "./common/BasicCommonComponents/Status";
import UploadGallery from "./common/BasicCommonComponents/UploadGallery";

export default function LandFields({ back, next }) {
  const dispatch = useDispatch();
  const { form } = useActivePropertySlice();
  const [errors, setErrors] = useState({});
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSubSteps = 3;
  const topRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* =======================
       VALIDATION LOGIC
  ======================= */
  const validateStep1 = () => {
    const e = {};
    
    if (!form.roadWidthFt || Number(form.roadWidthFt) <= 0)
      e.roadWidthFt = "Road width is required";
    if (!form.landUseZone) e.landUseZone = "Land use zone is required";
    if (!form.facing) e.facing = "Select facing";
    if (!form.surveyNumber || form.surveyNumber.trim().length < 3)
      e.surveyNumber = "Survey number is required";
    if (!form.layoutType) e.layoutType = "Layout type is required";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.landName || form.landName.trim().length < 3)
      e.landName = "Land name required (min 3 chars)";
    if (!form.dimensions?.length || Number(form.dimensions.length) <= 0)
      e.length = "Length is required";
    if (!form.dimensions?.width || Number(form.dimensions.width) <= 0)
      e.width = "Width is required";
    if (!form.approvedByAuthority || form.approvedByAuthority.length === 0)
      e.approvedByAuthority = "Select authority";
    if (!form.amenities || form.amenities.length === 0)
      e.amenities = "Select at least one amenity";
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.currency) e.currency = "Currency is required";
    if (!form.price || Number(form.price) <= 0)
      e.price = "Price must be greater than 0";
    if (!form.description || form.description.trim().length < 20)
      e.description = "Description too short";
    if (!form.galleryFiles || form.galleryFiles.length === 0)
      e.galleryFiles = "Upload site photos";
    return e;
  };

  /* =======================
       REAL-TIME SYNC
  ======================= */
  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (form.plotArea > 0) delete updated.plotArea;
      if (form.landName?.trim().length >= 3) delete updated.landName;
      if (form.price > 0) delete updated.price;
      if (form.galleryFiles?.length > 0) delete updated.galleryFiles;
      return updated;
    });
  }, [form]);

  const handleInternalNext = async () => {
    let validationErrors = {};
    if (subStep === 1) validationErrors = validateStep1();
    else if (subStep === 2) validationErrors = validateStep2();
    else if (subStep === 3) validationErrors = validateStep3();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.galleryFiles) {
        galleryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        setTimeout(scrollToTop, 50);
      }
      return;
    }

    if (subStep < totalSubSteps) {
      setSubStep(subStep + 1);
      setTimeout(scrollToTop, 50);
    } else {
      const propertyId = localStorage.getItem("propertyId");
      if (!propertyId) {
        toast.error("Property ID missing.");
        return;
      }

      setIsSubmitting(true);
      dispatch(
        savePropertyData({
          category: "land",
          id: propertyId,
          step: "details",
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Land details saved successfully!");
          next();
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to save land details");
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleInternalBack = () => {
    if (subStep > 1) {
      setSubStep(subStep - 1);
      setTimeout(scrollToTop, 10);
    } else {
      back();
    }
  };

  return (
    <div
      ref={topRef}
      className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-8 mx-auto shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#27AE60] text-white font-bold">
            F
          </div>
          <div className="flex relative right-3 items-center justify-center w-9 h-9 rounded-full bg-[#9747FF] text-white font-bold">
            A
          </div>
        </div>
        <p className="text-sm text-[#111111]">
          <span className="font-semibold">GET 2 extra enquiries</span> if you
          list your property in
          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
            5:35
          </span>
        </p>
      </div>

      {/* Visual Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {subStep} of {totalSubSteps}
          </span>
          <span className="text-sm font-medium text-[#27AE60]">
            {subStep === 1 && "Land Identity & Area"}
            {subStep === 2 && "Legal & Dimensions"}
            {subStep === 3 && "Pricing & Features"}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-[#27AE60] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(subStep / totalSubSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-10">
        {/* STEP 1: LAND IDENTITY */}
        {subStep === 1 && (
          <div className="space-y-10 animate-fadeIn">
            <SubHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PlotArea error={errors.plotArea} />
              <RoadWidthFt error={errors.roadWidthFt} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <LandUseZone error={errors.landUseZone} />
              <Facing error={errors.facing} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SurveyNumber error={errors.surveyNumber} />
              <LayoutType error={errors.layoutType} />
            </div>
          </div>
        )}

        {/* STEP 2: LEGAL & DIMENSIONS */}
        {subStep === 2 && (
          <div className="space-y-10 animate-fadeIn">
            <LandName error={errors.landName} />
            <LandDimensions errors={errors} />
            <div className="pt-6 border-t">
              <ApprovedByAuthority error={errors.approvedByAuthority} />
            </div>
            <Amenities error={errors.amenities} />
            <Specifications error={errors.specifications} />
          </div>
        )}

        {/* STEP 3: PRICING & GALLERY */}
        {subStep === 3 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
              <Currency error={errors.currency} />
              <BanksApproved error={errors.banksApproved} />
            </div>
            <PriceDetails errors={errors} />
            <DescriptionMain error={errors.description} />

            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
              <LandBooleanFeatures />
            </div>
            <UploadGallery ref={galleryRef} error={errors.galleryFiles} />
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between gap-6 pt-10 border-t">
          <button
            onClick={handleInternalBack}
            className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all active:scale-95"
          >
            {subStep === 1 ? "Back" : "Previous"}
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleInternalNext}
            className={`w-full text-white py-3 rounded-lg font-semibold transition-all shadow-md active:scale-95 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#27AE60] hover:bg-[#219150]"
            }`}
          >
            {isSubmitting
              ? "Saving..."
              : subStep === totalSubSteps
                ? "Go to Publish"
                : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}