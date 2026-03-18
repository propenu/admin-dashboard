// // //D:\propenu\frontend\admin-dashboard\src\pages\Residential\PostResidentailProperty\TypeSpecificFields\CommercialFields.jsx
// import { useState, useRef, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { toast } from "sonner";
// import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";
// import { savePropertyData } from "../../../../store/common/propertyThunks";

// // Components
// import TopHeader from "./common/BasicCommonComponents/TopHeader";
// import Amenities from "./common/BasicCommonComponents/Amenities";
// import Specifications from "./common/BasicCommonComponents/Specifications";
// import ParkingDetails from "./common/BasicCommonComponents/ParkingDetails";
// import Pantry from "./common/BasicCommonComponents/Pantry";
// import AvailabilityStatus from "./common/BasicCommonComponents/AvailabilityStatus";
// import PowerCapacity from "./common/BasicCommonComponents/PowerCapacity";
// import AgeOfProperty from "./common/BasicCommonComponents/AgeOfProperty";
// import FireSafety from "./common/BasicCommonComponents/FireSafety";
// import WallFinishStatus from "./common/BasicCommonComponents/WallFinishStatus";
// import BuildingManagement from "./common/BasicCommonComponents/BuildingManagement ";
// import Zoning from "./common/BasicCommonComponents/Zoning";
// import Currency from "./common/BasicCommonComponents/Currency";
// import PossessionDate from "./common/BasicCommonComponents/PossessionDate";
// import Price from "./common/BasicCommonComponents/Price";
// import PricePerSqft from "./common/BasicCommonComponents/PricePerSqft";
// import MaintenanceCharges from "./common/BasicCommonComponents/MaintenanceCharges";
// import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
// import TenantInfo from "./common/BasicCommonComponents/TenantInfo";
// import FeaturedPropertyComponent from "./common/BasicCommonComponents/FeaturedPropertyComponent";
// import IsPriceNegotiable from "./common/BasicCommonComponents/IsPriceNegotiable";
// import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
// import TransactionTypes from "./common/BasicCommonComponents/TransactionTypes";
// import Status from "./common/BasicCommonComponents/Status";
// import UploadGallery from "./common/BasicCommonComponents/UploadGallery";

// export default function CommercialFields({ back, next }) {
//   const dispatch = useDispatch();
//   const { form } = useActivePropertySlice();
//   const [errors, setErrors] = useState({});
//   const [subStep, setSubStep] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const totalSubSteps = 3;
//   const topRef = useRef(null);

//   // Refs for auto-scrolling to errors
//   const amenitiesRef = useRef(null);
//   const specificationsRef = useRef(null);
//   const parkingRef = useRef(null);
//   const pantryRef = useRef(null);
//   const availabilityRef = useRef(null);
//   const powerRef = useRef(null);
//   const fireSafetyRef = useRef(null);
//   const priceRef = useRef(null);
//   const galleryRef = useRef(null);

//   const scrollToTop = () => {
//     topRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const validateStep1 = () => {
//     const e = {};
//     if (!form.amenities || form.amenities.length === 0)
//       e.amenities = "Select at least one Amenity";
//     if (!form.specifications || form.specifications.length === 0)
//       e.specifications = "Enter Specifications";
//     if (!form.parkingType) e.parkingType = "Select parking type";
//     if (!form.pantry) e.pantry = "Select pantry type";
//     return e;
//   };

//   const validateStep2 = () => {
//     const e = {};
//     if (!form.constructionStatus)
//       e.constructionStatus = "Select availability status";
//     if (!form.powerCapacityKw) e.powerCapacityKw = "Enter power capacity";
//     if (!form.propertyAge) e.propertyAge = "Select age of property";
//     if (!form.zoning) e.zoning = "Enter zoning";
//     return e;
//   };

//   const validateStep3 = () => {
//     const e = {};
//     if (!form.price || Number(form.price) <= 0) e.price = "Enter valid price";
//     if (!form.currency) e.currency = "Select currency";
//     if (!form.description) e.description = "Enter description";
//     if (!form.status) e.status = "Select property status";
//     if (!form.galleryFiles || form.galleryFiles.length === 0)
//       e.galleryFiles = "Upload at least one image";
//     return e;
//   };

//   // Real-time error clearing
//   useEffect(() => {
//     setErrors((prev) => {
//       const updated = { ...prev };
//       if (form.amenities?.length > 0) delete updated.amenities;
//       if (form.parkingType) delete updated.parkingType;
//       if (form.constructionStatus) delete updated.constructionStatus;
//       if (form.price > 0) delete updated.price;
//       if (form.galleryFiles?.length > 0) delete updated.galleryFiles;
//       return updated;
//     });
//   }, [form]);

//   const handleInternalNext = async () => {
//     let validationErrors = {};
//     if (subStep === 1) validationErrors = validateStep1();
//     else if (subStep === 2) validationErrors = validateStep2();
//     else if (subStep === 3) validationErrors = validateStep3();

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       // Logic for scrolling to first error in current step
//       if (validationErrors.amenities)
//         amenitiesRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.constructionStatus)
//         availabilityRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.price)
//         priceRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.galleryFiles)
//         galleryRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       return;
//     }

//     if (subStep < totalSubSteps) {
//       setSubStep(subStep + 1);
//       setTimeout(scrollToTop, 50);
//     } else {
//       // FINAL SUBMIT
//       const propertyId = localStorage.getItem("propertyId");
//       if (!propertyId) {
//         toast.error("Property ID missing.");
//         return;
//       }

//       setIsSubmitting(true);
//       dispatch(
//         savePropertyData({
//           category: "commercial",
//           id: propertyId,
//           step: "details",
//         }),
//       )
//         .unwrap()
//         .then(() => {
//           toast.success("Commercial details saved successfully");
//           next();
//         })
//         .catch((err) => {
//           toast.error(err?.message || "Failed to save details");
//         })
//         .finally(() => setIsSubmitting(false));
//     }
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

//       {/* Progress Bar */}
//       <div className="mb-8">
//         <div className="flex justify-between mb-2">
//           <span className="text-sm font-medium text-gray-600">
//             Step {subStep} of {totalSubSteps}
//           </span>
//           <span className="text-sm font-medium text-[#27AE60]">
//             {subStep === 1 && "Infrastructure & Amenities"}
//             {subStep === 2 && "Specs & Safety"}
//             {subStep === 3 && "Pricing & Legal"}
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 h-2 rounded-full">
//           <div
//             className="bg-[#27AE60] h-2 rounded-full transition-all duration-300"
//             style={{ width: `${(subStep / totalSubSteps) * 100}%` }}
//           />
//         </div>
//       </div>

//       <div className="space-y-10">
//         {/* STEP 1: INFRASTRUCTURE */}
//         {subStep === 1 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div ref={amenitiesRef}>
//               <Amenities error={errors.amenities} />
//             </div>
//             <div ref={specificationsRef}>
//               <Specifications error={errors.specifications} />
//             </div>
//             <div ref={parkingRef} className="pt-3 ">
//               <ParkingDetails errors={errors} />
//             </div>
//             <div
//               ref={pantryRef}
//               className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-3"
//             >
//               <Pantry error={errors.pantry} />
//             </div>
//           </div>
//         )}

//         {/* STEP 2: SPECS & SAFETY */}
//         {subStep === 2 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
              
//                 <PowerCapacity error={errors.powerCapacityKw} />
//                 <Zoning error={errors.zoning} />
             
//             </div>
//             <div ref={fireSafetyRef} className="pt-3">
//               <FireSafety error={errors.fireSafety} />
//             </div>

//             <BuildingManagement errors={errors} />
//           </div>
//         )}

//         {/* STEP 3: PRICING & GALLERY */}
//         {subStep === 3 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Currency error={errors.currency} />
//               <PossessionDate error={errors.possessionDate} />
//             </div>
//             <DescriptionMain error={errors.description} />
//             <TenantInfo error={errors.tenantInfo} />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
//               <MaintenanceCharges error={errors.maintenanceCharges} />
//               <IsPriceNegotiable />
//             </div>
//             <BanksApproved error={errors.banksApproved} />
//             <UploadGallery ref={galleryRef} error={errors.galleryFiles} />
//           </div>
//         )}

//         {/* NAVIGATION */}
//         <div className="flex justify-between gap-6 pt-3">
//           <button
//             onClick={handleInternalBack}
//             className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
//           >
//             {subStep === 1 ? "Back" : "Previous"}
//           </button>
//           <button
//             disabled={isSubmitting}
//             onClick={handleInternalNext}
//             className={`w-full text-white py-3 rounded-lg font-semibold transition-all shadow-md ${
//               isSubmitting
//                 ? "bg-gray-400"
//                 : "bg-[#27AE60] hover:bg-[#219150] active:scale-95"
//             }`}
//           >
//             {isSubmitting
//               ? "Saving..."
//               : subStep === totalSubSteps
//                 ? "continue"
//                 : "Continue"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

//ci 

// CommercialFields.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";
import { savePropertyData } from "../../../../store/common/propertyThunks";

import TopHeader from "./common/BasicCommonComponents/TopHeader";
import Amenities from "./common/BasicCommonComponents/Amenities";
import Specifications from "./common/BasicCommonComponents/Specifications";
import ParkingDetails from "./common/BasicCommonComponents/ParkingDetails";
import Pantry from "./common/BasicCommonComponents/Pantry";
import PowerCapacity from "./common/BasicCommonComponents/PowerCapacity";
import FireSafety from "./common/BasicCommonComponents/FireSafety";
import BuildingManagement from "./common/BasicCommonComponents/BuildingManagement ";
import Zoning from "./common/BasicCommonComponents/Zoning";
import Currency from "./common/BasicCommonComponents/Currency";
import PossessionDate from "./common/BasicCommonComponents/PossessionDate";
import MaintenanceCharges from "./common/BasicCommonComponents/MaintenanceCharges";
import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
import TenantInfo from "./common/BasicCommonComponents/TenantInfo";
import IsPriceNegotiable from "./common/BasicCommonComponents/IsPriceNegotiable";
import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
import UploadGallery from "./common/BasicCommonComponents/UploadGallery";
import FloorDetails from "./common/BasicCommonComponents/FloorDetails";
import FlooringType from "./common/BasicCommonComponents/FlooringType";

const STEPS = [
  { label: "Infrastructure & Amenities" },
  { label: "Specs & Safety" },
  { label: "Pricing & Gallery" },
];

const SectionCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm space-y-6 ${className}`}>
    {children}
  </div>
);

export default function CommercialFields({ back, next }) {
  const dispatch = useDispatch();
  const { form } = useActivePropertySlice();
  const [errors, setErrors] = useState({});
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSubSteps = STEPS.length;
  const topRef = useRef(null);

  const amenitiesRef = useRef(null);
  const availabilityRef = useRef(null);
  const priceRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const validateStep1 = () => {
    const e = {};
    if (!form.amenities?.length) e.amenities = "Select at least one amenity";
    if (!form.specifications?.length) e.specifications = "Enter at least one specification";
    
    if (!form.pantry) e.pantry = "Select pantry type";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.constructionStatus) e.constructionStatus = "Select availability status";
    if (!form.powerCapacityKw) e.powerCapacityKw = "Enter power capacity";
    if (!form.propertyAge) e.propertyAge = "Select age of property";
    if (!form.zoning) e.zoning = "Enter zoning";
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.currency) e.currency = "Select currency";
    if (!form.description) e.description = "Enter a description";
    if (!form.status) e.status = "Select property status";
    if (!form.galleryFiles?.length) e.galleryFiles = "Upload at least one image";
    return e;
  };

  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (form.amenities?.length > 0) delete updated.amenities;
      if (form.parkingType) delete updated.parkingType;
      if (form.constructionStatus) delete updated.constructionStatus;
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
      if (validationErrors.amenities) amenitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (validationErrors.constructionStatus) availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (validationErrors.price) priceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (validationErrors.galleryFiles) galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (subStep < totalSubSteps) {
      setSubStep(subStep + 1);
      setTimeout(scrollToTop, 50);
    } else {
      const propertyId = localStorage.getItem("propertyId");
      if (!propertyId) { toast.error("Property ID missing."); return; }
      setIsSubmitting(true);
      dispatch(savePropertyData({ category: "commercial", id: propertyId, step: "details" }))
        .unwrap()
        .then(() => { toast.success("Commercial details saved successfully"); next(); })
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
        {/* Step dots */}
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

      {/* Step 1 — Infrastructure & Amenities */}
      {subStep === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionCard>
            <div ref={amenitiesRef}><Amenities error={errors.amenities} /></div>
            <div><Specifications error={errors.specifications} /></div>
          </SectionCard>
          <SectionCard>
            <ParkingDetails errors={errors} />
            <FloorDetails errors={errors} />
            <FlooringType error={errors.flooringType} />
            <Pantry error={errors.pantry} />
          </SectionCard>
        </div>
      )}

      {/* Step 2 — Specs & Safety */}
      {subStep === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PowerCapacity error={errors.powerCapacityKw} />
              <Zoning error={errors.zoning} />
            </div>
            <FireSafety error={errors.fireSafety} />
          </SectionCard>
          <SectionCard>
            <BuildingManagement errors={errors} />
          </SectionCard>
        </div>
      )}

      {/* Step 3 — Pricing & Gallery */}
      {subStep === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Currency error={errors.currency} />
              <PossessionDate error={errors.possessionDate} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MaintenanceCharges error={errors.maintenanceCharges} />
              <IsPriceNegotiable />
            </div>
            <BanksApproved error={errors.banksApproved} />
          </SectionCard>
          <SectionCard>
            <DescriptionMain error={errors.description} />
          </SectionCard>
          <SectionCard>
            <TenantInfo error={errors.tenantInfo} />
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