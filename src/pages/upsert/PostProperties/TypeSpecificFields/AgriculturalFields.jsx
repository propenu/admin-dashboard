// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/AgriculturalFields.jsx
// import { useState, useRef, useEffect } from "react";
// import TopHeader from "./common/BasicCommonComponents/TopHeader";
// import SubHeader from "./common/BasicCommonComponents/SubHeader";
// import Amenities from "./common/BasicCommonComponents/Amenities";
// import Specifications from "./common/BasicCommonComponents/Specifications";
// import Currency from "./common/BasicCommonComponents/Currency";
// import PriceDetails from "./common/BasicCommonComponents/PriceDetails";
// import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
// import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
// import RoadWidth from "./common/BasicCommonComponents/RoadWidth";
// import AgricuturalBooleanFeatures from "./common/BasicCommonComponents/AgriculturalBooleanFeatures";
// import AreaUnit from "./common/BasicCommonComponents/AreaUnit";
// import LandShape from "./common/BasicCommonComponents/LandShape";
// import TotalArea from "./common/BasicCommonComponents/TotalArea";
// import SoilType from "./common/BasicCommonComponents/SoilType";
// import IrrigationType from "./common/BasicCommonComponents/IrrigationType";
// import CurrentCrop from "./common/BasicCommonComponents/currentCrop";
// import LandName from "./common/BasicCommonComponents/LandName";
// import Suitablefor from "./common/BasicCommonComponents/SuitableFor";
// import BoreWellDetails from "./common/BasicCommonComponents/BorewellDetails";
// import PlanTationAge from "./common/BasicCommonComponents/PlantationAge";
// import NumberOfBorewells from "./common/BasicCommonComponents/NumberOfBorewells";
// import WaterSource from "./common/BasicCommonComponents/WaterSource";
// import AccessRoadType from "./common/BasicCommonComponents/AccessRoadType";
// import StatePurchaseRestrictions from "./common/BasicCommonComponents/StatePurchaseRestrictions";

// import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";

// export default function AgriculturalFields({
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

//  const validateStep1 = () => {
//    const errors = {};

//    if (!form.areaUnit) errors.areaUnit = "Area unit is required";
//    if (!form.landShape) errors.landShape = "Land shape is required";

//    if (
//      !form.totalArea ||
//      !form.totalArea.value ||
//      Number(form.totalArea.value) <= 0
//    ) {
//      errors.totalArea = "Total area must be greater than 0";
//    }

//    if (
//      !form.roadWidth.value ||
//      !form.roadWidth.value ||
//      Number(form.roadWidth.value) <= 0
//    ) {
//      errors.roadWidth = "Road width is required";
//    }

//    if (!form.soilType) errors.soilType = "Soil type is required";
//    if (!form.irrigationType)
//      errors.irrigationType = "Irrigation type is required";
//    if (!form.currentCrop) errors.currentCrop = "Current crop is required";

//    if (!form.landName || form.landName.trim().length < 3) {
//      errors.landName = "Land name must be at least 3 characters";
//    }

//    if (
//      !form.suitableFor ||
//      (Array.isArray(form.suitableFor) && form.suitableFor.length === 0)
//    ) {
//      errors.suitableFor = "Select at least one suitable purpose";
//    }

//    return errors;
//  };

// const validateStep2 = () => {
//   const errors = {};

//   if (!form.borewellDetails.depthMeters || Number(form.borewellDetails.depthMeters) <= 0) {
//     errors.depthMeters = "Depth in meters are required";
//   }

//   if (
//     !form.borewellDetails.yieldLpm ||
//     Number(form.borewellDetails.yieldLpm) <= 0
//   ) {
//     errors.yieldLpm = "Yield in LPM are required";
//   }

//   if (
//     !form.borewellDetails.drilledYear ||
//     Number(form.borewellDetails.drilledYear) <= 0
//   ) {
//     errors.drilledYear = "Drilled year are required";
//   }

//   if (form.numberOfBorewells === "" || Number(form.numberOfBorewells) < 0) {
//     errors.numberOfBorewells = "Invalid number of borewells";
//   }

//   if (!form.plantationAge) {
//     errors.plantationAge = "Plantation age is required";
//   }

//   if (!form.amenities || form.amenities.length === 0)
//     errors.amenities = "Select at least one Amenity";

//   if (!form.specifications || form.specifications.length === 0)
//     errors.specifications = "Enter Specification Details";

//   if (!form.waterSource) {
//     errors.waterSource = "Water source is required";
//   }

//   if (!form.accessRoadType) {
//     errors.accessRoadType = "Access road type is required";
//   }

//   if (!form.statePurchaseRestrictions) {
//     errors.statePurchaseRestrictions = "Restriction details required";
//   }

//   return errors;
// };

// const validateStep3 = () => {
//   const errors = {};

//   if (!form.currency) errors.currency = "Currency is required";

//   if (!form.price || Number(form.price) <= 0) {
//     errors.price = "Price must be greater than 0";
//   }

//   if (form.pricePerSqft || Number(form.pricePerSqft) <= 0) {
//     errors.pricePerSqft = "Invalid price per sqft";
//   }

//   if (!form.description || form.description.trim().length < 20) {
//     errors.description = "Description must be at least 20 characters";
//   }

//   if (!form.banksApproved || form.banksApproved.length === 0) {
//     errors.banksApproved = "Select at least one bank";
//   }

//   return errors;
// };

//  useEffect(() => {
//    setErrors((prev) => {
//      const updated = { ...prev };

//      /* =======================
//        STEP 1: LAND & AREA
//     ======================= */

//      if (form.areaUnit) delete updated.areaUnit;
//      if (form.landShape) delete updated.landShape;

//      if (form.totalArea?.value && Number(form.totalArea.value) > 0) {
//        delete updated.totalArea;
//      }

//      if (form.roadWidth.value && Number(form.roadWidth.value) > 0) {
//        delete updated.roadWidth;
//      }

//      if (form.soilType) delete updated.soilType;
//      if (form.irrigationType) delete updated.irrigationType;
//      if (form.currentCrop) delete updated.currentCrop;

//      if (form.landName && form.landName.trim().length >= 3) {
//        delete updated.landName;
//      }

//      if (
//        form.suitableFor &&
//        (!Array.isArray(form.suitableFor) || form.suitableFor.length > 0)
//      ) {
//        delete updated.suitableFor;
//      }

//      /* =======================
//        STEP 2: WATER & INFRA
//     ======================= */

//      if (form.borewellDetails.depthMeters || Number(form.borewellDetails.depthMeters) > 0) {
//        delete updated.depthMeters;
//      }

//      if (form.borewellDetails.yieldLpm || Number(form.borewellDetails.yieldLpm) > 0) {
//        delete updated.yieldLpm;
//      }

//      if (
//        form.borewellDetails.drilledYear ||
//        Number(form.borewellDetails.drilledYear) > 0
//      ) {
//        delete updated.drilledYear;
//      }

//      if (form.numberOfBorewells !== "" && Number(form.numberOfBorewells) >= 0) {
//        delete updated.numberOfBorewells;
//      }

//      if (form.plantationAge) delete updated.plantationAge;

//      if (form.amenities && form.amenities.length > 0) {
//        delete updated.amenities;
//      }
//      if (form.specifications && form.specifications.length > 0) {
//        delete updated.specifications;
//      }
//      if (form.waterSource) delete updated.waterSource;
//      if (form.accessRoadType) delete updated.accessRoadType;
//      if (form.statePurchaseRestrictions)
//        delete updated.statePurchaseRestrictions;

//      /* =======================
//        STEP 3: PRICING & LEGAL
//     ======================= */

//      if (form.currency) delete updated.currency;

//      if (form.price && Number(form.price) > 0) {
//        delete updated.price;
//      }

//      if (form.pricePerSqft && Number(form.pricePerSqft) > 0) {
//        delete updated.pricePerSqft;
//      }

//      if (form.description && form.description.trim().length >= 20) {
//        delete updated.description;
//      }

//      if (form.banksApproved && form.banksApproved.length > 0) {
//        delete updated.banksApproved;
//      }

//      return updated;
//    });
//  }, [
//    /* STEP 1 */
//    form.areaUnit,
//    form.landShape,
//    form.totalArea,
//    form.roadWidth,
//    form.soilType,
//    form.irrigationType,
//    form.currentCrop,
//    form.landName,
//    form.suitableFor,

//    /* STEP 2 */
//    form.borewellDetails.depthMeters,
//    form.borewellDetails.yieldLpm,
//    form.borewellDetails.drilledYear,
//    form.numberOfBorewells,
//    form.plantationAge,
//    form.waterSource,
//    form.accessRoadType,
//    form.statePurchaseRestrictions,

//    form.amenities,
//    form.specifications,

//    /* STEP 3 */
//    form.currency,
//    form.price,
//    form.pricePerSqft,
//    form.description,
//    form.banksApproved,
//  ]);

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
//             {subStep === 1 && "Land & Area Details"}
//             {subStep === 2 && "Water & Infrastructure"}
//             {subStep === 3 && "Pricing & Legal"}
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
//         {/* STEP 1: LAND & AREA DETAILS */}
//         {subStep === 1 && (
//           <div className="space-y-10 animate-fadeIn">
//             <SubHeader />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <AreaUnit error={errors.areaUnit} />
//               <LandShape error={errors.landShape} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <TotalArea error={errors.totalArea} />
//               <RoadWidth error={errors.roadWidth} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <SoilType error={errors.soilType} />
//               <IrrigationType error={errors.irrigationType} />
//               <CurrentCrop error={errors.currentCrop} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
//               <LandName error={errors.landName} />
//               <Suitablefor error={errors.suitableFor} />
//             </div>
//           </div>
//         )}

//         {/* STEP 2: WATER & INFRASTRUCTURE */}
//         {subStep === 2 && (
//           <div className="space-y-10 animate-fadeIn">
//             <BoreWellDetails errors={errors} />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <PlanTationAge error={errors.plantationAge} />
//               <NumberOfBorewells  error={errors.numberOfBorewells} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <WaterSource  error={errors.waterSource} />
//               <AccessRoadType error={errors.accessRoadType} />
//               <StatePurchaseRestrictions  error={errors.statePurchaseRestrictions} />
//             </div>
//             <div className="pt-6 border-t">
//               <Amenities  error={errors.amenities} />
//               <Specifications error={errors.specifications} />
//             </div>
//           </div>
//         )}

//         {/* STEP 3: PRICING & LEGAL */}
//         {subStep === 3 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Currency error={errors.currency} />
//             </div>
//             <PriceDetails errors={errors} />
//             <DescriptionMain  error={errors.description} />

//             <div className="pt-6 border-t">
//               <BanksApproved  error={errors.banksApproved} />
//             </div>

//             <div className="bg-green-50/50 p-6 rounded-xl border border-dashed border-green-200">
//               <p className="text-xs font-bold text-green-800 uppercase mb-4 tracking-wider">
//                 Additional Features
//               </p>
//               <AgricuturalBooleanFeatures error={errors.agriculturalFeatures} />
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
import Amenities from "./common/BasicCommonComponents/Amenities";
import Specifications from "./common/BasicCommonComponents/Specifications";
import Currency from "./common/BasicCommonComponents/Currency";
import PriceDetails from "./common/BasicCommonComponents/PriceDetails";
import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
import RoadWidth from "./common/BasicCommonComponents/RoadWidth";
import AgricuturalBooleanFeatures from "./common/BasicCommonComponents/AgriculturalBooleanFeatures";
import AreaUnit from "./common/BasicCommonComponents/AreaUnit";
import LandShape from "./common/BasicCommonComponents/LandShape";
import TotalArea from "./common/BasicCommonComponents/TotalArea";
import SoilType from "./common/BasicCommonComponents/SoilType";
import IrrigationType from "./common/BasicCommonComponents/IrrigationType";
import CurrentCrop from "./common/BasicCommonComponents/currentCrop";
import LandName from "./common/BasicCommonComponents/LandName";
import Suitablefor from "./common/BasicCommonComponents/SuitableFor";
import BoreWellDetails from "./common/BasicCommonComponents/BorewellDetails";
import PlanTationAge from "./common/BasicCommonComponents/PlantationAge";
import NumberOfBorewells from "./common/BasicCommonComponents/NumberOfBorewells";
import WaterSource from "./common/BasicCommonComponents/WaterSource";
import AccessRoadType from "./common/BasicCommonComponents/AccessRoadType";
import StatePurchaseRestrictions from "./common/BasicCommonComponents/StatePurchaseRestrictions";
import Status from "./common/BasicCommonComponents/Status";
import UploadGallery from "./common/BasicCommonComponents/UploadGallery";

export default function AgriculturalFields({ back, next }) {
  const dispatch = useDispatch();
  const { form } = useActivePropertySlice();
  const [errors, setErrors] = useState({});
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSubSteps = 3;

  // Refs for scrolling
  const topRef = useRef(null);
  const landDetailsRef = useRef(null);
  const waterInfraRef = useRef(null);
  const pricingRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* =======================
       VALIDATION LOGIC
  ======================= */
  const validateStep1 = () => {
    const e = {};
    if (!form.areaUnit) e.areaUnit = "Area unit is required";
    if (!form.landShape) e.landShape = "Land shape is required";
    if (!form.totalArea?.value || Number(form.totalArea.value) <= 0)
      e.totalArea = "Total area is required";
    if (!form.roadWidth?.value || Number(form.roadWidth.value) <= 0)
      e.roadWidth = "Road width is required";
    if (!form.soilType) e.soilType = "Soil type is required";
    if (!form.landName || form.landName.trim().length < 3)
      e.landName = "Invalid Land Name";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.waterSource) e.waterSource = "Water source is required";
    if (!form.amenities || form.amenities.length === 0)
      e.amenities = "Select at least one Amenity";
    if (!form.accessRoadType) e.accessRoadType = "Access road type is required";
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.currency) e.currency = "Currency is required";
    if (!form.price || Number(form.price) <= 0) e.price = "Price is required";
    if (!form.description || form.description.trim().length < 20)
      e.description = "Description too short";
    if (!form.galleryFiles || form.galleryFiles.length === 0)
      e.galleryFiles = "Upload property images";
    return e;
  };

  // Real-time error cleanup
  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (form.areaUnit) delete updated.areaUnit;
      if (form.totalArea?.value > 0) delete updated.totalArea;
      if (form.waterSource) delete updated.waterSource;
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
      // Smart Scroll
      if (subStep === 1)
        landDetailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      if (subStep === 2)
        waterInfraRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      if (validationErrors.galleryFiles)
        galleryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      return;
    }

    if (subStep < totalSubSteps) {
      setSubStep(subStep + 1);
      setTimeout(scrollToTop, 50);
    } else {
      // FINAL SUBMISSION
      const propertyId = localStorage.getItem("propertyId");
      if (!propertyId) {
        toast.error("Property ID missing.");
        return;
      }

      setIsSubmitting(true);
      dispatch(
        savePropertyData({
          category: "agricultural",
          id: propertyId,
          step: "details",
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Agricultural details saved successfully");
          next();
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to save details");
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

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {subStep} of {totalSubSteps}
          </span>
          <span className="text-sm font-medium text-[#27AE60]">
            {subStep === 1 && "Land & Area Details"}
            {subStep === 2 && "Water & Infrastructure"}
            {subStep === 3 && "Pricing & Legal"}
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
        {/* STEP 1: LAND & AREA */}
        {subStep === 1 && (
          <div ref={landDetailsRef} className="space-y-10 animate-fadeIn">
            <SubHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AreaUnit error={errors.areaUnit} />
              <LandShape error={errors.landShape} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TotalArea error={errors.totalArea} />
              <RoadWidth error={errors.roadWidth} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SoilType error={errors.soilType} />
              <IrrigationType error={errors.irrigationType} />
              <CurrentCrop error={errors.currentCrop} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
              <LandName error={errors.landName} />
              <Suitablefor error={errors.suitableFor} />
            </div>
          </div>
        )}

        {/* STEP 2: WATER & INFRA */}
        {subStep === 2 && (
          <div ref={waterInfraRef} className="space-y-10 animate-fadeIn">
            <BoreWellDetails errors={errors} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PlanTationAge error={errors.plantationAge} />
              <NumberOfBorewells error={errors.numberOfBorewells} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <WaterSource error={errors.waterSource} />
              <AccessRoadType error={errors.accessRoadType} />
              <StatePurchaseRestrictions
                error={errors.statePurchaseRestrictions}
              />
            </div>
            <div className="pt-6 border-t">
              <Amenities error={errors.amenities} />
              <Specifications error={errors.specifications} />
            </div>
          </div>
        )}

        {/* STEP 3: PRICING & GALLERY */}
        {subStep === 3 && (
          <div ref={pricingRef} className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Currency error={errors.currency} />
            </div>
            <PriceDetails errors={errors} />
            <DescriptionMain error={errors.description} />
            <div className="pt-6 border-t">
              <BanksApproved error={errors.banksApproved} />
            </div>
            <div className="bg-green-50/50 p-6 rounded-xl border border-dashed border-green-200">
              <p className="text-xs font-bold text-green-800 uppercase mb-4 tracking-wider">
                Additional Features
              </p>
              <AgricuturalBooleanFeatures error={errors.agriculturalFeatures} />
            </div>
            <Status error={errors.status} />
            <UploadGallery ref={galleryRef} error={errors.galleryFiles} />
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between gap-6 pt-10 border-t">
          <button
            onClick={handleInternalBack}
            className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all active:scale-95"
          >
            {subStep === 1 ? "Back" : "Previous Step"}
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleInternalNext}
            className={`w-full text-white py-3 rounded-lg font-semibold transition-all shadow-md active:scale-95 ${
              isSubmitting ? "bg-gray-400" : "bg-[#27AE60] hover:bg-[#219150]"
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