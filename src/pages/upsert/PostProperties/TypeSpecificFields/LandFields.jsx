// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/ResidentialFields.jsx
// import { useState, useRef , useEffect} from "react";
// import TopHeader from "./common/BasicCommonComponents/TopHeader";
// import SubHeader from "./common/BasicCommonComponents/SubHeader";
// import Facing from "./common/BasicCommonComponents/Facing";
// import Amenities from "./common/BasicCommonComponents/Amenities";
// import Specifications from "./common/BasicCommonComponents/Specifications";
// import Currency from "./common/BasicCommonComponents/Currency";
// import PriceDetails from "./common/BasicCommonComponents/PriceDetails";
// import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
// import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
// import PlotArea from "./common/BasicCommonComponents/PlotArea";
// import RoadWidthFt from "./common/BasicCommonComponents/RoadWidthFt";
// import LandBooleanFeatures from "./common/BasicCommonComponents/LandBooleanFeatures";
// import LandUseZone from "./common/BasicCommonComponents/LandUseZone";
// import SurveyNumber from "./common/BasicCommonComponents/SurveyNumber";
// import LayoutType from "./common/BasicCommonComponents/LayoutType";
// import LandDimensions from "./common/BasicCommonComponents/LandDimensions";
// import ApprovedByAuthority from "./common/BasicCommonComponents/ApprovedByAuthority";
// import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";
// import LandName from "./common/BasicCommonComponents/LandName";

// export default function LandFields({
//   back,
//   next,

// }) {
//   const { form } = useActivePropertySlice();
//   const [errors, setErrors] = useState({});
//   const [subStep, setSubStep] = useState(1);
//   const totalSubSteps = 3;
//   const topRef = useRef(null);

//   const scrollToTop = () => {
//     topRef.current?.scrollIntoView({ behavior: "smooth" });

//   };

//   const validateStep1 = () => {
//     const errors = {};
//     if (!form.plotArea || Number(form.plotArea) <= 0) {
//       errors.plotArea = "Plot area is required";
//     }
//     if (!form.roadWidthFt || Number(form.roadWidthFt) <= 0) {
//       errors.roadWidthFt = "Road width is required";
//     }
//     if (!form.landUseZone) {
//       errors.landUseZone = "Land use zone is required";
//     }
//     if (!form.facing) {
//       errors.facing = "Select facing";
//     }
//     if (!form.surveyNumber || form.surveyNumber.trim().length < 3) {
//       errors.surveyNumber = "Survey number is required";
//     }
//     if (!form.layoutType) {
//       errors.layoutType = "Layout type is required";
//     }

//     return errors;
//   };

//   const validateStep2 = () => {
//     const errors = {};

//     if (!form.landName || form.landName.trim().length < 3) {
//       errors.landName = "Land name must be at least 3 characters";
//     }

//     if (
//       !form.dimensions.length ||
//       Number(form.dimensions.length) <= 0
//     ) {
//       errors.length = "Length is required";
//     }

//     if (
//       !form.dimensions.width ||
//       Number(form.dimensions.width) <= 0
//     ) {
//       errors.width = "Width is required";
//     }

//     if (!form.approvedByAuthority || form.approvedByAuthority.length === 0) {
//       errors.approvedByAuthority = "Select at least one approving authority";
//     }

//     if (!form.amenities || form.amenities.length === 0) {
//       errors.amenities = "Select at least one amenity";
//     }

//     if (!form.specifications || form.specifications.length === 0) {
//       errors.specifications = "Enter specification details";
//     }

//     return errors;
//   };

//   const validateStep3 = () => {
//     const errors = {};

//     if (!form.currency) {
//       errors.currency = "Currency is required";
//     }

//     if (!form.price || Number(form.price) <= 0) {
//       errors.price = "Price must be greater than 0";
//     }

//     if (form.pricePerSqft || Number(form.pricePerSqft) <= 0) {
//       errors.pricePerSqft = "Invalid price per sqft";
//     }

//     if (!form.description || form.description.trim().length < 20) {
//       errors.description = "Description must be at least 20 characters";
//     }

//     if (!form.banksApproved || form.banksApproved.length === 0) {
//       errors.banksApproved = "Select at least one bank";
//     }

//     return errors;
//   };

//   useEffect(() => {
//     setErrors((prev) => {
//       const updated = { ...prev };

//       /* =======================
//        STEP 1
//     ======================= */

//       if (form.plotArea && Number(form.plotArea) > 0) delete updated.plotArea;

//       if (form.roadWidthFt && Number(form.roadWidthFt) > 0)
//         delete updated.roadWidthFt;

//       if (form.landUseZone) delete updated.landUseZone;
//       if (form.facing) delete updated.facing;

//       if (form.surveyNumber && form.surveyNumber.trim().length >= 3)
//         delete updated.surveyNumber;

//       if (form.layoutType) delete updated.layoutType;

//       /* =======================
//        STEP 2
//     ======================= */

//     if(form.landName && form.landName.trim().length >= 3) delete updated.landName;

//       if (form.dimensions?.length && Number(form.dimensions.length) > 0) {
//         delete updated.length;
//       }

//       if (form.dimensions?.width && Number(form.dimensions.width) > 0) {
//         delete updated.width;
//       }

//       if (form.approvedByAuthority.length > 0)
//         delete updated.approvedByAuthority;

//       if (form.amenities.length > 0) delete updated.amenities;

//       if (form.specifications.length > 0) delete updated.specifications;

//       /* =======================
//        STEP 3
//     ======================= */

//       if (form.currency) delete updated.currency;

//       if (form.price && Number(form.price) > 0) delete updated.price;

//       if (form.pricePerSqft && Number(form.pricePerSqft) > 0)
//         delete updated.pricePerSqft;

//       if (form.description && form.description.trim().length >= 20)
//         delete updated.description;

//       if (form.banksApproved?.length > 0) delete updated.banksApproved;

//       return updated;
//     });
//   }, [
//     /* STEP 1 */
//     form.plotArea,
//     form.roadWidthFt,
//     form.landUseZone,
//     form.facing,
//     form.surveyNumber,
//     form.layoutType,

//     /* STEP 2 */
//     form.landName,
//     form.dimensions.length,
//     form.dimensions.width,
//     form.approvedByAuthority,

//     /* STEP 3 */
//     form.currency,
//     form.price,
//     form.pricePerSqft,
//     form.description,
//     form.banksApproved,
//   ]);

//   // const handleInternalNext = () => {
//   //   if (subStep < totalSubSteps) {
//   //     setSubStep(subStep + 1);
//   //     setTimeout(scrollToTop, 10);
//   //   } else {
//   //     next();
//   //   }
//   // };

//   const handleInternalNext = () => {
//     let validationErrors = {};

//     if (subStep === 1) validationErrors = validateStep1();
//     if (subStep === 2) validationErrors = validateStep2();
//     if (subStep === 3) validationErrors = validateStep3();

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       setTimeout(scrollToTop, 50);
//       return;
//     }

//     setErrors({});
//     subStep < totalSubSteps ? setSubStep(subStep + 1) : next();
//   };

//   const handleInternalBack = () => {
//     if (subStep > 1) {
//       setSubStep(subStep - 1);
//       setTimeout(scrollToTop, 10);
//     } else {
//       back();
//     }
//   };

//   return (
//     <div
//       ref={topRef}
//       className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-8 mx-auto shadow-sm"
//     >
//       <TopHeader />

//       {/* Visual Progress Bar */}
//       <div className="mb-8">
//         <div className="flex justify-between mb-2">
//           <span className="text-sm font-medium text-gray-600">
//             Step {subStep} of {totalSubSteps}
//           </span>
//           <span className="text-sm font-medium text-[#27AE60]">
//             {subStep === 1 && "Land Identity & Area"}
//             {subStep === 2 && "Legal & Dimensions"}
//             {subStep === 3 && "Pricing & Features"}
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 h-2 rounded-full">
//           <div
//             className="bg-[#27AE60] h-2 rounded-full transition-all duration-300"
//             style={{ width: `${(subStep / totalSubSteps) * 100}%` }}
//           ></div>
//         </div>
//       </div>

//       <div className="space-y-10">
//         {/* STEP 1: LAND IDENTITY & AREA */}
//         {subStep === 1 && (
//           <div className="space-y-10 animate-fadeIn">
//             <SubHeader />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <PlotArea error={errors.plotArea} />
//               <RoadWidthFt error={errors.roadWidthFt} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <LandUseZone  error={errors.landUseZone} />
//               <Facing error={errors.facing} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <SurveyNumber error={errors.surveyNumber} />
//               <LayoutType error={errors.layoutType}  />
//             </div>
//           </div>
//         )}

//         {/* STEP 2: LEGAL & DIMENSIONS */}
//         {subStep === 2 && (
//           <div className="space-y-10 animate-fadeIn">
//             <LandName error={errors.landName} />
//             <LandDimensions errors={errors}  />
//             <div className="pt-6 border-t">
//               <ApprovedByAuthority error={errors.approvedByAuthority} />
//             </div>
//             <Amenities error={errors.amenities} />
//             <Specifications error={errors.specifications}  />
//           </div>
//         )}

//         {/* STEP 3: PRICING & FINAL FEATURES */}
//         {subStep === 3 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Currency error={errors.currency} />
//             </div>
//             <PriceDetails errors={errors}  />
//             <DescriptionMain error={errors.description} />

//             <div className="pt-6 border-t">
//               <BanksApproved error={errors.banksApproved} />
//             </div>

//             <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
//               <LandBooleanFeatures />
//             </div>
//           </div>
//         )}

//         {/* NAVIGATION BUTTONS */}
//         <div className="flex justify-between gap-6 pt-10 border-t">
//           <button
//             onClick={handleInternalBack}
//             className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all active:scale-95"
//           >
//             {subStep === 1 ? "Back" : "Previous Step"}
//           </button>
//           <button
//             onClick={handleInternalNext}
//             className="w-full bg-[#27AE60] text-white py-3 rounded-lg font-semibold hover:bg-[#219150] transition-all shadow-md active:scale-95"
//           >
//             {subStep === totalSubSteps ? "Go to Bublish" : "Countinue"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
    if (!form.plotArea || Number(form.plotArea) <= 0)
      e.plotArea = "Plot area is required";
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
      <TopHeader />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Currency error={errors.currency} />
            </div>
            <PriceDetails errors={errors} />
            <DescriptionMain error={errors.description} />
            <div className="pt-6 border-t">
              <BanksApproved error={errors.banksApproved} />
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
              <LandBooleanFeatures />
            </div>
            <Status error={errors.status} />
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