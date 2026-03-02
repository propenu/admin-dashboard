// //D:\propenu\frontend\admin-dashboard\src\pages\Residential\PostResidentailProperty\TypeSpecificFields\CommercialFields.jsx
// import { useState, useRef, useEffect } from "react";
// import { toast } from "sonner";
// import Counter from "./common/BasicCommonComponents/Counter";
// import TopHeader from "./common/BasicCommonComponents/TopHeader";
// import SubHeader from "./common/BasicCommonComponents/SubHeader";
// import CarpetArea from "./common/BasicCommonComponents/CarpetArea";
// import BuiltUpArea from "./common/BasicCommonComponents/BuiltUpArea";
// import Furnishing from "./common/BasicCommonComponents/Furnishing";
// import Facing from "./common/BasicCommonComponents/Facing";
// import Amenities from "./common/BasicCommonComponents/Amenities";
// import Specifications from "./common/BasicCommonComponents/Specifications";
// import ParkingDetails from "./common/BasicCommonComponents/ParkingDetails";
// import FloorDetails from "./common/BasicCommonComponents/FloorDetails";
// import FlooringType from "./common/BasicCommonComponents/FlooringType";
// import AvailabilityStatus from "./common/BasicCommonComponents/AvailabilityStatus";
// import AgeOfProperty from "./common/BasicCommonComponents/AgeOfProperty";
// import Currency from "./common/BasicCommonComponents/Currency";
// import PossessionDate from "./common/BasicCommonComponents/PossessionDate";
// import PriceDetails from "./common/BasicCommonComponents/PriceDetails";
// import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
// import FeaturedPropertyComponent from "./common/BasicCommonComponents/FeaturedPropertyComponent";
// import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
// import TransactionTypes from "./common/BasicCommonComponents/TransactionTypes";
// import IsPriceNegotiable from "./common/BasicCommonComponents/IsPriceNegotiable";
// import PowerCapacity from "./common/BasicCommonComponents/PowerCapacity";
// import Pantry from "./common/BasicCommonComponents/Pantry";
// import Price from "./common/BasicCommonComponents/Price";
// import PricePerSqft from "./common/BasicCommonComponents/PricePerSqft";
// import MaintenanceCharges from "./common/BasicCommonComponents/MaintenanceCharges";
// import WallFinishStatus from "./common/BasicCommonComponents/WallFinishStatus";
// import FireSafety from "./common/BasicCommonComponents/FireSafety";
// import TenantInfo from "./common/BasicCommonComponents/TenantInfo";
// import BuildingManagement from "./common/BasicCommonComponents/BuildingManagement ";
// import  Zoning from "./common/BasicCommonComponents/Zoning";
// import { useActivePropertySlice } from "./UsePropertySlice/useActivePropertySlice";
// import Status from "./common/BasicCommonComponents/Status";
// import UploadGallery from "./common/BasicCommonComponents/UploadGallery";

// export default function CommercialFields({ back,next }) {
//   const { form } = useActivePropertySlice();
//   const [errors, setErrors] = useState({});
//   const [subStep, setSubStep] = useState(1);
//   const totalSubSteps = 3;
//   const topRef = useRef(null);

//    const mergedRef = (node) => {
//      totalFloorsRef.current = node;
//      floorNumberRef.current = node;
//    };

//    const mergedparkingTyperef = (node)=>{
//      twoWheelerRef.current = node;
//      fourWheelerRef.current = node;
//      parkingTypeRef.current = node;
//    }
//    ///////////// Reefs /////////////
//    //step1
//   const cabinsRef = useRef(null);
//   const seatsRef = useRef(null);
//   const bathroomsRef = useRef(null);
//   const balconiesRef = useRef(null);
//   const carpetAreaRef = useRef(null);
//   const builtUpAreaRef = useRef(null);
//   const furnishingRef = useRef(null);
//   const facingRef = useRef(null);
//   //step2
//   const amenitiesRef = useRef(null);
//   const specificationsRef = useRef(null);
//   // const parkingDetailsRef = useRef(null);
//   const parkingTypeRef  = useRef(null);
//   const twoWheelerRef = useRef(null);
//   const fourWheelerRef = useRef(null);
//   const floorNumberRef = useRef(null);
//   //const floorDetailsRef = useRef(null);
//   const flooringTypeRef = useRef(null);
//    const pantryRef = useRef(null);
//    const totalFloorsRef = useRef(null);
//    //step3
//    const constructionStatusRef = useRef(null);
//    const powerCapacityKwRef = useRef(null);
//    const propertyAgeRef = useRef(null);
//    const wallFinishStatusRef = useRef(null);
//    const managedByRef = useRef(null);
//    const contactRef = useRef(null);
//    const zoningRef = useRef(null);
//   const transactionTypeRef = useRef(null);
//   const availabilityStatusRef = useRef(null);
//   const ageOfPropertyRef = useRef(null);
//   //step4
//   const currencyRef = useRef(null);
//   const possessionDateRef = useRef(null);
//   const maintenanceChargesRef = useRef(null);
//   const tenantInfoRef = useRef(null);
//   const discriptionMainRef = useRef(null);
//   const banksApprovedRef = useRef(null);
//   const transactionTypesRef = useRef(null);
//   const powerCapacityRef = useRef(null);
//   const priceRef = useRef(null);
//   const pricePerSqftRef = useRef(null);
//   const fireSafetyRef = useRef(null);

//   const validateStep1 = () => {
//     const e = {};

//     if (!form.cabins || form.cabins <= 0) e.cabins = "Please Enter Cabins";
//     if (!form.seats || form.seats <= 0)
//       e.seats = "Please Enter Seats";
//     if (!form.bathrooms || form.bathrooms <= 0)
//       e.bathrooms = "Please Enter Bathrooms";
//     if (!form.balconies || form.balconies <= 0)
//       e.balconies = "Please Enter Balconies";
//     if (!form.carpetArea || Number(form.carpetArea) <= 0)
//       e.carpetArea = "Please Enter Carpet Area";

//     if (!form.builtUpArea || Number(form.builtUpArea) <= 0)
//       e.builtUpArea = "Please Enter Built-Up Area";

//     if (!form.furnishing) e.furnishing = "Select furnishing status";
//     if (!form.facing) e.facing = "Select facing";
//     return e;
//   };

//   const validateStep2 = () => {
//     const e = {};

//     if (!form.amenities || form.amenities.length === 0)
//       e.amenities = "Select at least one Amenity";
//     if (!form.specifications || form.specifications.length === 0)
//       e.specifications = "Enter Specification Details";

//     if (!form.parkingType) e.parkingType = "Select parking type";
//     if (!form.twoWheeler) e.twoWheeler = "Enter two wheeler capacity";
//     if (!form.fourWheeler) e.fourWheeler = "Enter four wheeler capacity";

//     if (!form.totalFloors) e.totalFloors = "Enter Total Floors";
//     if (!form.floorNumber) e.floorNumber = "Enter Floor Number";

//     if (!form.flooringType) e.flooringType = "Select flooring type";
//     if (!form.pantry) e.pantry = "Select pantry type";

//     return e;
//   };

//   const validateStep3 = () => {
//     const e = {};

//     if (!form.constructionStatus)
//       e.constructionStatus = "Select availability status";
//     if (!form.powerCapacityKw) e.powerCapacityKw = "Enter power capacity";
//     if (!form.propertyAge) e.propertyAge = "Select age of property";
//     if (!form.wallFinishStatus)
//       e.wallFinishStatus = "Select wall finish status";
//     if (!form.buildingManagement?.managedBy) e.managedBy = "Enter managed by";
//     if (!form.buildingManagement?.contact) e.contact = "Enter contact details";
//     if (!form.zoning) e.zoning = "Enter zoning";

//     return e;
//   };

//   const validateStep4 = () => {
//     const e = {};
//     if (!form.currency) e.currency = "Select currency";
//     if (!form.possessionDate) e.possessionDate = "Select possession date";
//     if (!form.price || Number(form.price) <= 0) e.price = "Enter valid price";
//     if (!form.pricePerSqft || Number(form.pricePerSqft) <= 0)
//       e.pricePerSqft = "Enter valid price per sqft";
//     if (!form.maintenanceCharges)
//       e.maintenanceCharges = "Enter maintenance charges";
//     if (!form.transactionType) e.transactionType = "Select transaction type";
//     if (!form.banksApproved || form.banksApproved.length === 0)
//       e.banksApproved = "Select banks approved";
//     if (!form.description) e.description = "Enter description";
//     if (!form.tenantInfo) e.tenantInfo = "Enter tenant info";
//     if (!form.status) e.status = "Select property status";

//     return e;
//   }

//    useEffect(() => {
//         setErrors((prev) => {
//           const updated = { ...prev };
//           //verification for step 1
//           if (form.cabins > 0) delete updated.cabins;
//           if (form.seats > 0) delete updated.seats;
//           if (form.bathrooms > 0) delete updated.bathrooms;
//           if (form.balconies > 0) delete updated.balconies;
//           if (form.carpetArea && Number(form.carpetArea) > 0)
//             delete updated.carpetArea;
//           if (form.builtUpArea && Number(form.builtUpArea) > 0)
//             delete updated.builtUpArea;
//           if (form.furnishing) delete updated.furnishing;
//           if (form.facing) delete updated.facing;
//           //verification for step 2
//           if (form.specifications.length > 0) delete updated.specifications;
//           if (form.parkingType) delete updated.parkingType;
//           if (form.twoWheeler) delete updated.twoWheeler;
//           if (form.fourWheeler) delete updated.fourWheeler;

//           if (form.floorDetails) delete updated.floorDetails;
//           if (form.totalFloors) delete updated.totalFloors;
//           if (form.floorNumber) delete updated.floorNumber;
//           if (form.propertyAge) delete updated.propertyAge;

//           if (form.amenities.length > 0) delete updated.amenities;
//           if (form.flooringType) delete updated.flooringType;
//           if (form.kitchenType) delete updated.kitchenType;
//           if (form.price && Number(form.price) > 0) delete updated.price;
//           if (form.pricePerSqft && Number(form.pricePerSqft) > 0)
//             delete updated.pricePerSqft;
//           if (form.currency) delete updated.currency;
//           if (form.constructionStatus) delete updated.constructionStatus;
//           if (form.description) delete updated.description;
//           if (form.possessionDate) delete updated.possessionDate;
//           if (form.transactionType) delete updated.transactionType;
//           if (form.banksApproved) delete updated.banksApproved;
//           if (form.pantry) delete updated.pantry;

//           //verification for step 3
//           if (form.powerCapacityKw) delete updated.powerCapacityKw;
//           if (form.wallFinishStatus) delete updated.wallFinishStatus;

//           if (form.buildingManagement?.managedBy) delete updated.managedBy;
//           if (form.buildingManagement?.contact) delete updated.contact;

//           if (form.zoning) delete updated.zoning;

//           //verification for step 4
//           if (form.maintenanceCharges) delete updated.maintenanceCharges;
//           if (form.tenantInfo) delete updated.tenantInfo;
//           if (form.status) delete updated.status;

//           return updated;
//         });
//       }, [
//         form.cabins,
//         form.seats,
//         form.bathrooms,
//         form.balconies,
//         form.carpetArea,
//         form.builtUpArea,
//         form.furnishing,
//         form.facing,
//         form.amenities,
//         form.specifications,
//         form.parkingType,
//         form.twoWheeler,
//         form.fourWheeler,
//         form.floorDetails,
//         form.totalFloors,
//         form.floorNumber,
//         form.propertyAge,
//         form.flooringType,
//         form.kitchenType,
//         form.price,
//         form.pricePerSqft,
//         form.currency,
//         form.constructionStatus,
//         form.possessionDate,
//         form.transactionType,
//         form.banksApproved,
//         form.description,
//         form.pantry,
//         form.powerCapacityKw,
//         form.wallFinishStatus,
//         form.buildingManagement?.managedBy,
//         form.buildingManagement?.contact,
//         form.zoning,
//         form.maintenanceCharges,
//         form.tenantInfo,
//         form.status
//       ]);

// const scrollToTop = () => {
//   topRef.current?.scrollIntoView({ behavior: "smooth" });
// };

//   const handleInternalNext = () => {
//     let validationErrors = {};

//     if (subStep === 1) validationErrors = validateStep1();
//     if (subStep === 2) validationErrors = validateStep2();
//     if (subStep === 3) validationErrors = validateStep3();
//     if (subStep === 4) validationErrors = validateStep4();

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       scrollToTop();

//       /* ---------- STEP 1 ---------- */
//       if (validationErrors.cabins)
//         cabinsRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.seats)
//         seatsRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.bathrooms)
//         bathroomsRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.balconies)
//         balconiesRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.carpetArea)
//         carpetAreaRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.builtUpArea)
//         builtUpAreaRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.furnishing)
//         furnishingRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.facing)
//         facingRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       /* ---------- STEP 2 ---------- */ else if (validationErrors.amenities)
//         // ✅ FIXED KEY
//         amenitiesRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.specifications)
//         specificationsRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.parkingType)
//         parkingTypeRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.twoWheeler)
//         twoWheelerRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.fourWheeler)
//         fourWheelerRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.totalFloors)
//         totalFloorsRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.floorNumber)
//         floorNumberRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.flooringType)
//         flooringTypeRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.pantry)
//         pantryRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       /* ---------- STEP 3 ---------- */ else if (
//         validationErrors.constructionStatus
//       )
//         constructionStatusRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.powerCapacityKw)
//         powerCapacityKwRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.propertyAge)
//         propertyAgeRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.wallFinishStatus)
//         wallFinishStatusRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.managedBy)
//         managedByRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.contact)
//         contactRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.zoning)
//         zoningRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       /* ---------- STEP 4 ---------- */ else if (validationErrors.currency)
//         currencyRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.possessionDate)
//         possessionDateRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.price)
//         priceRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.pricePerSqft)
//         pricePerSqftRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.maintenanceCharges)
//         maintenanceChargesRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.description)
//         discriptionMainRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.tenantInfo)
//         tenantInfoRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.banksApproved)
//         banksApprovedRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       else if (validationErrors.transactionType)
//         transactionTypeRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });

//       return;
//     }

//     const propertyId = localStorage.getItem("propertyId");
//         if (!propertyId) {
//           toast.error("Property ID missing.");
//           return;
//         }

//         setIsSubmitting(true);
//         dispatch(
//           savePropertyData({
//             category: "commercial",
//             id: propertyId,
//             step: "details",
//           }),
//         )
//           .unwrap()
//           .then(() => {
//             toast.success("All details saved successfully");
//             next();
//           })
//           .catch((err) => {
//             console.error("Save error:", err);
//             toast.error(err?.message || "Failed to save details");
//           })
//           .finally(() => setIsSubmitting(false));
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
//             {subStep === 1 && "Space & Area"}
//             {subStep === 2 && "Infrastructure & Amenities"}
//             {subStep === 3 && "Commercial Specs & Safety"}
//             {subStep === 4 && "Pricing & Legal"}
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
//         {/* STEP 1: SPACE & AREA */}

//         {/* STEP 2: INFRASTRUCTURE */}
//         {subStep === 1 && (
//           <div className="space-y-10 animate-fadeIn">
//             <Amenities error={errors.amenities} ref={amenitiesRef} />
//             <Specifications
//               error={errors.specifications}
//               ref={specificationsRef}
//             />
//             <div className="grid grid-cols-1 md:grid-cols-1 gap-8 pt-6 border-t">
//               <ParkingDetails errors={errors} ref={mergedparkingTyperef} />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Pantry error={errors.pantry} ref={pantryRef} />
//             </div>
//           </div>
//         )}

//         {/* STEP 3: COMMERCIAL SPECS & SAFETY */}
//         {subStep === 2 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <AvailabilityStatus
//                 error={errors.constructionStatus}
//                 ref={constructionStatusRef}
//               />
//               <PowerCapacity
//                 error={errors.powerCapacityKw}
//                 ref={powerCapacityKwRef}
//               />
//             </div>
//             <AgeOfProperty error={errors.propertyAge} ref={propertyAgeRef} />
//             <div className="grid grid-cols-1 md:grid-cols-1 gap-8 pt-6 border-t">
//               <FireSafety error={errors.fireSafety} ref={fireSafetyRef} />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-1 gap-8 pt-6 border-t">
//               <WallFinishStatus
//                 error={errors.wallFinishStatus}
//                 ref={wallFinishStatusRef}
//               />
//             </div>
//             <BuildingManagement
//               errors={errors}
//               ref={[managedByRef, contactRef]}
//             />
//             <Zoning error={errors.zoning} ref={zoningRef} />
//           </div>
//         )}

//         {/* STEP 4: PRICING & LEGAL */}
//         {subStep === 3 && (
//           <div className="space-y-10 animate-fadeIn">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Currency error={errors.currency} ref={currencyRef} />
//               <PossessionDate
//                 error={errors.possessionDate}
//                 ref={possessionDateRef}
//               />
//             </div>
//             <div className="pt-4 border-t">
//               <p className="text-[13px] font-bold text-black uppercase font-poppins mb-4">
//                 Price Details
//               </p>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <Price error={errors.price} ref={priceRef} />
//                 <PricePerSqft
//                   error={errors.pricePerSqft}
//                   ref={pricePerSqftRef}
//                 />
//                 <MaintenanceCharges
//                   error={errors.maintenanceCharges}
//                   ref={maintenanceChargesRef}
//                 />
//               </div>
//             </div>
//             <DescriptionMain
//               error={errors.description}
//               ref={discriptionMainRef}
//             />
//             <TenantInfo error={errors.tenantInfo} ref={tenantInfoRef} />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
//               <FeaturedPropertyComponent />
//               <IsPriceNegotiable />
//             </div>
//             <BanksApproved
//               error={errors.banksApproved}
//               ref={banksApprovedRef}
//             />
//             <TransactionTypes
//               error={errors.transactionType}
//               ref={transactionTypeRef}
//             />
//             <Status error={errors.status} />
//             <UploadGallery error={errors.galleryFiles} ref={galleryFilesRef} />
//           </div>
//         )}

//         {/* NAVIGATION BUTTONS */}
//         <div className="flex justify-between gap-6 pt-10 border-t">
//           <button
//             onClick={handleInternalBack}
//             className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all active:scale-95"
//           >
//             {subStep === 1 ? "Back" : "Previous"}
//           </button>
//           <button
//             onClick={handleInternalNext}
//             className="w-full bg-[#27AE60] text-white py-3 rounded-lg font-semibold hover:bg-[#219150] transition-all shadow-md active:scale-95"
//           >
//             {subStep === totalSubSteps ? "Go to Bublish" : "Continue"}
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
import Amenities from "./common/BasicCommonComponents/Amenities";
import Specifications from "./common/BasicCommonComponents/Specifications";
import ParkingDetails from "./common/BasicCommonComponents/ParkingDetails";
import Pantry from "./common/BasicCommonComponents/Pantry";
import AvailabilityStatus from "./common/BasicCommonComponents/AvailabilityStatus";
import PowerCapacity from "./common/BasicCommonComponents/PowerCapacity";
import AgeOfProperty from "./common/BasicCommonComponents/AgeOfProperty";
import FireSafety from "./common/BasicCommonComponents/FireSafety";
import WallFinishStatus from "./common/BasicCommonComponents/WallFinishStatus";
import BuildingManagement from "./common/BasicCommonComponents/BuildingManagement ";
import Zoning from "./common/BasicCommonComponents/Zoning";
import Currency from "./common/BasicCommonComponents/Currency";
import PossessionDate from "./common/BasicCommonComponents/PossessionDate";
import Price from "./common/BasicCommonComponents/Price";
import PricePerSqft from "./common/BasicCommonComponents/PricePerSqft";
import MaintenanceCharges from "./common/BasicCommonComponents/MaintenanceCharges";
import DescriptionMain from "./common/BasicCommonComponents/DescriptionMain";
import TenantInfo from "./common/BasicCommonComponents/TenantInfo";
import FeaturedPropertyComponent from "./common/BasicCommonComponents/FeaturedPropertyComponent";
import IsPriceNegotiable from "./common/BasicCommonComponents/IsPriceNegotiable";
import BanksApproved from "./common/BasicCommonComponents/BanksApproved";
import TransactionTypes from "./common/BasicCommonComponents/TransactionTypes";
import Status from "./common/BasicCommonComponents/Status";
import UploadGallery from "./common/BasicCommonComponents/UploadGallery";

export default function CommercialFields({ back, next }) {
  const dispatch = useDispatch();
  const { form } = useActivePropertySlice();
  const [errors, setErrors] = useState({});
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSubSteps = 3;
  const topRef = useRef(null);

  // Refs for auto-scrolling to errors
  const amenitiesRef = useRef(null);
  const specificationsRef = useRef(null);
  const parkingRef = useRef(null);
  const pantryRef = useRef(null);
  const availabilityRef = useRef(null);
  const powerRef = useRef(null);
  const fireSafetyRef = useRef(null);
  const priceRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.amenities || form.amenities.length === 0)
      e.amenities = "Select at least one Amenity";
    if (!form.specifications || form.specifications.length === 0)
      e.specifications = "Enter Specifications";
    if (!form.parkingType) e.parkingType = "Select parking type";
    if (!form.pantry) e.pantry = "Select pantry type";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.constructionStatus)
      e.constructionStatus = "Select availability status";
    if (!form.powerCapacityKw) e.powerCapacityKw = "Enter power capacity";
    if (!form.propertyAge) e.propertyAge = "Select age of property";
    if (!form.zoning) e.zoning = "Enter zoning";
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.price || Number(form.price) <= 0) e.price = "Enter valid price";
    if (!form.currency) e.currency = "Select currency";
    if (!form.description) e.description = "Enter description";
    if (!form.status) e.status = "Select property status";
    if (!form.galleryFiles || form.galleryFiles.length === 0)
      e.galleryFiles = "Upload at least one image";
    return e;
  };

  // Real-time error clearing
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
      // Logic for scrolling to first error in current step
      if (validationErrors.amenities)
        amenitiesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (validationErrors.constructionStatus)
        availabilityRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (validationErrors.price)
        priceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (validationErrors.galleryFiles)
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
      // FINAL SUBMIT
      const propertyId = localStorage.getItem("propertyId");
      if (!propertyId) {
        toast.error("Property ID missing.");
        return;
      }

      setIsSubmitting(true);
      dispatch(
        savePropertyData({
          category: "commercial",
          id: propertyId,
          step: "details",
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Commercial details saved successfully");
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
            {subStep === 1 && "Infrastructure & Amenities"}
            {subStep === 2 && "Specs & Safety"}
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
        {/* STEP 1: INFRASTRUCTURE */}
        {subStep === 1 && (
          <div className="space-y-10 animate-fadeIn">
            <div ref={amenitiesRef}>
              <Amenities error={errors.amenities} />
            </div>
            <div ref={specificationsRef}>
              <Specifications error={errors.specifications} />
            </div>
            <div ref={parkingRef} className="pt-6 border-t">
              <ParkingDetails errors={errors} />
            </div>
            <div
              ref={pantryRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6"
            >
              <Pantry error={errors.pantry} />
            </div>
          </div>
        )}

        {/* STEP 2: SPECS & SAFETY */}
        {subStep === 2 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div ref={availabilityRef}>
                <AvailabilityStatus error={errors.constructionStatus} />
              </div>
              <div ref={powerRef}>
                <PowerCapacity error={errors.powerCapacityKw} />
              </div>
            </div>
            <AgeOfProperty error={errors.propertyAge} />
            <div ref={fireSafetyRef} className="pt-6 border-t">
              <FireSafety error={errors.fireSafety} />
            </div>
            <WallFinishStatus error={errors.wallFinishStatus} />
            <BuildingManagement errors={errors} />
            <Zoning error={errors.zoning} />
          </div>
        )}

        {/* STEP 3: PRICING & GALLERY */}
        {subStep === 3 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Currency error={errors.currency} />
              <PossessionDate error={errors.possessionDate} />
            </div>
            <div ref={priceRef} className="pt-4 border-t">
              <p className="text-[13px] font-bold text-black uppercase mb-4">
                Price Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Price error={errors.price} />
                <PricePerSqft error={errors.pricePerSqft} />
                <MaintenanceCharges error={errors.maintenanceCharges} />
              </div>
            </div>
            <DescriptionMain error={errors.description} />
            <TenantInfo error={errors.tenantInfo} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              <FeaturedPropertyComponent />
              <IsPriceNegotiable />
            </div>
            <BanksApproved error={errors.banksApproved} />
            <TransactionTypes error={errors.transactionType} />
            <Status error={errors.status} />
            <UploadGallery ref={galleryRef} error={errors.galleryFiles} />
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between gap-6 pt-10 border-t">
          <button
            onClick={handleInternalBack}
            className="w-full border border-[#27AE60] text-[#27AE60] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            {subStep === 1 ? "Back" : "Previous"}
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleInternalNext}
            className={`w-full text-white py-3 rounded-lg font-semibold transition-all shadow-md ${
              isSubmitting
                ? "bg-gray-400"
                : "bg-[#27AE60] hover:bg-[#219150] active:scale-95"
            }`}
          >
            {isSubmitting
              ? "Saving..."
              : subStep === totalSubSteps
                ? "Submit Property"
                : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}