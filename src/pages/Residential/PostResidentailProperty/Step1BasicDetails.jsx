// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step1BasicDetails.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../store/newIndex";
import { Phone, X } from "lucide-react";
import { setActiveCategory } from "../../../store/Ui/uiSlice";
import { toast  } from "sonner";

import BuiltUpArea from "./TypeSpecificFields/common/BasicCommonComponents/BuiltUpArea";
import CarpetArea from "./TypeSpecificFields/common/BasicCommonComponents/CarpetArea";
import Price from "./TypeSpecificFields/common/BasicCommonComponents/Price";
import Furnishing from "./TypeSpecificFields/common/BasicCommonComponents/Furnishing";
import Facing from "./TypeSpecificFields/common/BasicCommonComponents/Facing";
import TransactionTypes from "./TypeSpecificFields/common/BasicCommonComponents/TransactionTypes";
import Counter from "./TypeSpecificFields/common/BasicCommonComponents/Counter";
import AvailabilityStatus from "./TypeSpecificFields/common/BasicCommonComponents/AvailabilityStatus";
import AgeOfProperty from "./TypeSpecificFields/common/BasicCommonComponents/AgeOfProperty";
import PricePerSqft from "./TypeSpecificFields/common/BasicCommonComponents/PricePerSqft";
import WallFinishStatus from "./TypeSpecificFields/common/BasicCommonComponents/WallFinishStatus";
import LandDimensions from "./TypeSpecificFields/common/BasicCommonComponents/LandDimensions";
import RoadWidthFt from "./TypeSpecificFields/common/BasicCommonComponents/RoadWidthFt";
import PlotArea from "./TypeSpecificFields/common/BasicCommonComponents/PlotArea";
import TotalArea from "./TypeSpecificFields/common/BasicCommonComponents/TotalArea";
import RoadWidth from "./TypeSpecificFields/common/BasicCommonComponents/RoadWidth";
import CreatedBy from "./TypeSpecificFields/common/BasicCommonComponents/CreatedBy";

import { savePropertyData } from "../../../store/common/propertyThunks";
//import { apiClient } from "../../../api/apiClient";




const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment", value: "apartment" },
    { label: "Independent House", value: "independent-house" },
    { label: "Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Studio", value: "studio" },
    { label: "Duplex", value: "duplex" },
    { label: "Triplex", value: "triplex" },
    { label: "Farmhouse", value: "farmhouse" },
    { label: "Independent Builder Floor", value: "independent-builder-floor" },
  ],

  commercial: [
    { label: "Office", value: "office" },
    { label: "Retail", value: "retail" },
    { label: "Shop", value: "shop" },
    { label: "Showroom", value: "showroom" },
    { label: "Warehouse", value: "warehouse" },
    { label: "Industrial", value: "industrial" },
    { label: "Co-working Space", value: "coworking" },
    { label: "Restaurant", value: "restaurant" },
    { label: "Clinic", value: "clinic" },
    { label: "Land", value: "land" },
    { label: "Other", value: "other" },
  ],

  land: [
    { label: "Plot", value: "plot" },
    { label: "Residential Plot", value: "residential-plot" },
    { label: "Industrial Plot", value: "industrial-plot" },
    { label: "Agricultural Plot", value: "agricultural-plot" },
    { label: "Commercial Plot", value: "commercial-plot" },
    { label: "Investment Plot", value: "investment-plot" },
    { label: "Agricultural Plot", value: "corner-plot" },
    { label: "Not Applicable Plot", value: "na-plot" },
  ],

  agricultural: [
    { label: "Dry Land", value: "dry-land" },
    { label: "Wet Land", value: "wet-land" },
    { label: "Farm Land", value: "farm-land" },
    { label: "Orchard Land", value: "orchard-land" },
    { label: "Plantation", value: "plantation" },
    { label: "Agricultural Land", value: "agricultural-land" },
    { label: "Dairy Farm", value: "dairy-farm" },
    { label: "Ranch", value: "ranch" },
  ],
};

const PROPERTY_SUB_TYPES = {
  commercial: [
    { label: "Bare Shell", value: "bare-shell" },
    { label: "Warm Shell", value: "warm-shell" },
    { label: "Business Center", value: "business-center" },
    { label: "High Street Shop", value: "high-street-shop" },
    { label: "Mall Shop", value: "mall-shop" },
    { label: "Kiosk", value: "kiosk" },
    { label: "Food Court Unit", value: "food-court-unit" },
    { label: "Shutter Shop", value: "shutter-shop" },
    { label: "Showroom Space", value: "showroom-space" },
    { label: "Warehouse / Godown", value: "warehouse-godown" },
    { label: "Logistics Hub", value: "logistics-hub" },
    { label: "Cold Storage", value: "cold-storage" },
    { label: "Industrial Shed", value: "industrial-shed" },
  ],

  land: [
    { label: "Gated Community", value: "gated-community" },
    { label: "Non Gated", value: "non-gated"},
    { label: "Road Facing", value: "road-facing" },
    { label: "Two Side Open", value: "two-side-open" },
    { label: "Three Side Open", value: "three-side-open" },
    { label: "Resale", value: "resale" },
    { label: "New Plot", value: "new-plot" },
    { label: "Corner", value: "corner"}
  ],

  agricultural: [
    { label: "Irrigated", value: "irrigated" },
    { label: "Non Irrigated", value: "non-irrigated" },
    { label: "Fenced", value: "fenced" },
    { label: "Unfenced", value: "unfenced" },
    { label: "With Well", value: "with-well" },
    { label: "With Borewell", value: "with-borewell" },
    { label: "With Electricity", value: "with-electricity" },
    { label: "Near Road", value: "near-road" },
    { label: "Inside Village", value: "inside-village" },
    { label: "Farmhouse Permission", value: "farmhouse-permission" },
  ],
};

const LISTINGTYPES = [
  { label: "Sale", value: "sale" },
  { label: "Rent / Lease", value: "rent" },
];


export default function Step1BasicDetails({ next }) {
  const dispatch = useDispatch();
 
  const category = useSelector((state) => state.ui.activeCategory);

 
  const form = useSelector((state) => state[category]?.form || {});
  const [errors, setErrors] = useState({});
  const listingRef = useRef(null);
  const categoryRef = useRef(null);
  const propertyTypeRef = useRef(null);
  const subTypeRef = useRef(null);
  const galleryRef = useRef(null);
  const setValue = (key, value) => {
    if (category && actions[category]) {
      dispatch(actions[category].updateField({ key, value }));
    }
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };


const handleCategoryChange = (catKey) => {
  console.log("🎯 Category changed to:", catKey);

  setErrors((prev) => {
    const updated = { ...prev };
    delete updated.category;
    return updated;
  });

  // Remove old draft
  localStorage.removeItem("propertyId");

  // Set new category
  dispatch(setActiveCategory(catKey));

  // Reset dependent fields
  dispatch(actions[catKey].updateField({ key: "propertyType", value: "" }));
  dispatch(actions[catKey].updateField({ key: "propertySubType", value: "" }));
};

  const showSubTypes = PROPERTY_SUB_TYPES[category] && form.propertyType;

    const validateStep1 = () => {
      const newErrors = {};

      if (!category) {
        newErrors.category = "Please select a category";
      }

      if (!form.listingType) {
        newErrors.listingType = "Please select Sale / Rent / Lease";
      }

      if (!form.propertyType) {
        newErrors.propertyType = "Please select property type";
      }

      if (PROPERTY_SUB_TYPES[category] && !form.propertySubType) {
        newErrors.propertySubType = "Please select property sub type";
      }

      // ✅ Carpet vs Built-up validation
      const carpet = Number(form.carpetArea);
      const builtUp = Number(form.builtUpArea);

      if (carpet && builtUp) {
        if (carpet > builtUp) {
          newErrors.carpetArea =
            "Carpet area cannot be greater than Built-up area";
          newErrors.builtUpArea =
            "Built-up area must be greater than Carpet area";
        }
      }

      return newErrors;
    };;

    
    
   const handleContinue = async () => {
     const validationErrors = validateStep1();

     if (Object.keys(validationErrors).length > 0) {
       setErrors(validationErrors);
       return;
     }

     const propertyId = localStorage.getItem("propertyId");
     if (!propertyId) {
       toast.error("Property draft not found. Please restart.");
       return;
     }

     
     const {
       meta,
       completion,
       _id,
       __v,
       createdAt,
       updatedAt,
       createdBy,
       gallery,
       documents,
       ...cleanData
     } = form;

     // Final check: Ensure numeric fields are actually numbers
     const finalPayload = {
       ...cleanData,
       price: Number(cleanData.price) || 0,
       builtUpArea: Number(cleanData.builtUpArea) || 0,
       carpetArea: Number(cleanData.carpetArea) || 0,
       bhk: Number(cleanData.bhk) || 0,
       bedrooms: Number(cleanData.bedrooms) || 0,
       bathrooms: Number(cleanData.bathrooms) || 0,
       balconies: Number(cleanData.balconies) || 0,

     };

     try {
       // Pass the sanitized data to the thunk
       await dispatch(
         savePropertyData({
           category,
           id: propertyId,
           step: "basic",
           data: finalPayload, 
         }),
       ).unwrap();

       toast.success("Basic details saved");
       next();
     } catch (err) {
       console.error("Save Error:", err);
       toast.error("Failed to save basic details");
     }
   };

  return (
    <div className="min-h-screen bg-none flex justify-center py-1">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-[#E6E6E6] p-8">
        {/* ========== TOP INFO =========== */}
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

        {category === "residential" && (
          <>
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#111111]">
                Add Basic Details
              </h2>

              <button type="button" className="flex items-center gap-1 text-sm">
                <span>Need help?</span>
                <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
                <span className="font-semibold text-[#27AE60]">
                  Get a callback
                </span>
              </button>
            </div>

            {/* ================= I WANT TO ================= */}
            <div ref={listingRef} className=" mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                I want to..
              </p>

              <div className="flex gap-3">
                {LISTINGTYPES.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setValue("listingType", item.value)}
                    className={`px-6 py-2 rounded-xl text-sm border transition ${
                      form.listingType === item.value
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {errors.listingType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.listingType}
                </p>
              )}
            </div>

            {/* ================= CATEGORY ================= */}
            <div ref={categoryRef} className="mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your category and property type
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Object.keys(PROPERTY_TYPES).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === item}
                      onChange={() => handleCategoryChange(item)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-[#111111]">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* ================= PROPERTY TYPE ================= */}
            <div ref={propertyTypeRef} className="mb-10">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your property type
              </p>
              <div className="flex flex-wrap gap-3">
                {(PROPERTY_TYPES[category] || []).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setValue("propertyType", type.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      form.propertyType === type.value
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {type.label?.replace(/-/g, " ") || ""}
                  </button>
                ))}
              </div>
              {errors.propertyType && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.propertyType}
                </span>
              )}
            </div>

            {/* ================= PROPERTY SUB TYPE ================= */}
            {showSubTypes && (
              <div ref={subTypeRef} className="mb-10">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select your property Sub type
                </p>
                <div className="flex flex-wrap gap-3">
                  {(PROPERTY_SUB_TYPES[category] || []).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setValue("propertySubType", type.value)}
                      className={`px-4 py-2 rounded-lg border text-sm transition ${
                        form.propertySubType === type.value
                          ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                          : "border-gray-300 text-[#2F2F2F]"
                      }`}
                    >
                      {type.label?.replace(/-/g, " ") || ""}
                    </button>
                  ))}
                </div>
                {errors.propertySubType && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.propertySubType}
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mb-2">
              <Counter
                label="Bedrooms"
                reduxKey="bedrooms"
                error={errors.bedrooms}
              />
              <Counter
                label="Bathrooms"
                reduxKey="bathrooms"
                error={errors.bathrooms}
              />

              <Counter
                label="Balconies"
                reduxKey="balconies"
                error={errors.balconies}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <CarpetArea error={errors.carpetArea} />
              <BuiltUpArea error={errors.builtUpArea} />
              <Price error={errors.price} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <PricePerSqft error={errors.pricePerSqft} />
              <Facing error={errors.facing} />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-2">
              <Furnishing error={errors.furnishing} />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-2">
              <AgeOfProperty error={errors.ageOfProperty} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <AvailabilityStatus error={errors.constructionStatus} />
              <CreatedBy error={errors.createdBy} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-2">
              <TransactionTypes error={errors.transactionType} />
            </div>

            {/* ================= CONTINUE ================= */}
            <div className="mt-10">
              <button
                onClick={handleContinue}
                className="w-full py-3 border-2 border-[#27AE60] rounded-lg text-[#27AE60] font-semibold hover:bg-[#27AE60] hover:text-white transition"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {category === "commercial" && (
          <>
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#111111]">
                Add Basic Details
              </h2>

              <button type="button" className="flex items-center gap-1 text-sm">
                <span>Need help?</span>
                <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
                <span className="font-semibold text-[#27AE60]">
                  Get a callback
                </span>
              </button>
            </div>

            {/* ================= I WANT TO ================= */}
            <div ref={listingRef} className=" mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                I want to..
              </p>
              <div className="flex gap-3">
                {["sale", "rent"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setValue("listingType", item)}
                    className={`px-6 py-2 rounded-xl text-sm border transition ${
                      form.listingType === item
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
              {errors.listingType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.listingType}
                </p>
              )}
            </div>

            {/* ================= CATEGORY ================= */}
            <div ref={categoryRef} className="mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your category and property type
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Object.keys(PROPERTY_TYPES).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === item}
                      onChange={() => handleCategoryChange(item)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-[#111111]">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* ================= PROPERTY TYPE ================= */}
            <div ref={propertyTypeRef} className="mb-10">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your property type
              </p>
              <div className="flex flex-wrap gap-3">
                {(PROPERTY_TYPES[category] || []).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setValue("propertyType", type.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      form.propertyType === type.value
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {type.label?.replace(/-/g, " ") || ""}
                  </button>
                ))}
              </div>
              {errors.propertyType && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.propertyType}
                </span>
              )}
            </div>

            {/* ================= PROPERTY SUB TYPE ================= */}
            {showSubTypes && (
              <div ref={subTypeRef} className="mb-10">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select your property Sub type
                </p>
                <div className="flex flex-wrap gap-3">
                  {(PROPERTY_SUB_TYPES[category] || []).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setValue("propertySubType", type.value)}
                      className={`px-4 py-2 rounded-lg border text-sm transition ${
                        form.propertySubType === type.value
                          ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                          : "border-gray-300 text-[#2F2F2F]"
                      }`}
                    >
                      {type.label?.replace(/-/g, " ") || ""}
                    </button>
                  ))}
                </div>
                {errors.propertySubType && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.propertySubType}
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <Counter label="cabins" reduxKey="cabins" error={errors.cabins} />
              <Counter label="seats" reduxKey="seats" error={errors.seats} />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-2">
              <Furnishing error={errors.furnishing} />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-2">
              <WallFinishStatus error={errors.wallFinishStatus} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <CarpetArea error={errors.carpetArea} />
              <BuiltUpArea error={errors.builtUpArea} />
              <Price error={errors.price} />
              <PricePerSqft error={errors.pricePerSqft} />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-2">
              <AgeOfProperty error={errors.ageOfProperty} />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-2">
              <AvailabilityStatus error={errors.constructionStatus} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-2">
              <TransactionTypes error={errors.transactionType} />
              <CreatedBy error={errors.createdBy} />
            </div>

            {/* ================= CONTINUE ================= */}
            <div className="mt-10">
              <button
                onClick={handleContinue}
                className="w-full py-3 border-2 border-[#27AE60] rounded-lg text-[#27AE60] font-semibold hover:bg-[#27AE60] hover:text-white transition"
              >
                Continue
              </button>
            </div>
          </>
        )}
        {category === "land" && (
          <>
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#111111]">
                Add Basic Details
              </h2>

              <button type="button" className="flex items-center gap-1 text-sm">
                <span>Need help?</span>
                <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
                <span className="font-semibold text-[#27AE60]">
                  Get a callback
                </span>
              </button>
            </div>

            {/* ================= I WANT TO ================= */}
            <div ref={listingRef} className=" mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                I want to..
              </p>
              <div className="flex gap-3">
                {["sale", "rent"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setValue("listingType", item)}
                    className={`px-6 py-2 rounded-xl text-sm border transition ${
                      form.listingType === item
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
              {errors.listingType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.listingType}
                </p>
              )}
            </div>

            {/* ================= CATEGORY ================= */}
            <div ref={categoryRef} className="mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your category and property type
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Object.keys(PROPERTY_TYPES).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === item}
                      onChange={() => handleCategoryChange(item)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-[#111111]">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* ================= PROPERTY TYPE ================= */}
            <div ref={propertyTypeRef} className="mb-10">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your property type
              </p>
              <div className="flex flex-wrap gap-3">
                {(PROPERTY_TYPES[category] || []).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setValue("propertyType", type.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      form.propertyType === type.value
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {type.label?.replace(/-/g, " ") || ""}
                  </button>
                ))}
              </div>
              {errors.propertyType && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.propertyType}
                </span>
              )}
            </div>

            {/* ================= PROPERTY SUB TYPE ================= */}
            {showSubTypes && (
              <div ref={subTypeRef} className="mb-10">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select your property Sub type
                </p>
                <div className="flex flex-wrap gap-3">
                  {(PROPERTY_SUB_TYPES[category] || []).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setValue("propertySubType", type.value)}
                      className={`px-4 py-2 rounded-lg border text-sm transition ${
                        form.propertySubType === type.value
                          ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                          : "border-gray-300 text-[#2F2F2F]"
                      }`}
                    >
                      {type.label?.replace(/-/g, " ") || ""}
                    </button>
                  ))}
                </div>
                {errors.propertySubType && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.propertySubType}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 mb-2">
              <LandDimensions error={errors.dimensions} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <Price error={errors.price} />
              <PricePerSqft error={errors.pricePerSqft} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <RoadWidthFt error={errors.roadWidthFt} />
              <PlotArea error={errors.plotArea} />
            </div>

            <CreatedBy error={errors.createdBy} />

            {/* ================= CONTINUE ================= */}
            <div className="mt-10">
              <button
                onClick={handleContinue}
                className="w-full py-3 border-2 border-[#27AE60] rounded-lg text-[#27AE60] font-semibold hover:bg-[#27AE60] hover:text-white transition"
              >
                Continue
              </button>
            </div>
          </>
        )}
        {category === "agricultural" && (
          <>
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#111111]">
                Add Basic Details
              </h2>

              <button type="button" className="flex items-center gap-1 text-sm">
                <span>Need help?</span>
                <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
                <span className="font-semibold text-[#27AE60]">
                  Get a callback
                </span>
              </button>
            </div>

            {/* ================= I WANT TO ================= */}
            <div ref={listingRef} className=" mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                I want to..
              </p>
              <div className="flex gap-3">
                {["sale", "rent"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setValue("listingType", item)}
                    className={`px-6 py-2 rounded-xl text-sm border transition ${
                      form.listingType === item
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
              {errors.listingType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.listingType}
                </p>
              )}
            </div>

            {/* ================= CATEGORY ================= */}
            <div ref={categoryRef} className="mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your category and property type
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Object.keys(PROPERTY_TYPES).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === item}
                      onChange={() => handleCategoryChange(item)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-[#111111]">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* ================= PROPERTY TYPE ================= */}
            <div ref={propertyTypeRef} className="mb-10">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select your property type
              </p>
              <div className="flex flex-wrap gap-3">
                {(PROPERTY_TYPES[category] || []).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setValue("propertyType", type.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      form.propertyType === type.value
                        ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                        : "border-gray-300 text-[#2F2F2F]"
                    }`}
                  >
                    {type.label?.replace(/-/g, " ") || ""}
                  </button>
                ))}
              </div>
              {errors.propertyType && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.propertyType}
                </span>
              )}
            </div>

            {/* ================= PROPERTY SUB TYPE ================= */}
            {showSubTypes && (
              <div ref={subTypeRef} className="mb-10">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select your property Sub type
                </p>
                <div className="flex flex-wrap gap-3">
                  {(PROPERTY_SUB_TYPES[category] || []).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setValue("propertySubType", type.value)}
                      className={`px-4 py-2 rounded-lg border text-sm transition ${
                        form.propertySubType === type.value
                          ? "bg-[#DEFAEA8C] border-[#52D689] text-[#27AE60]"
                          : "border-gray-300 text-[#2F2F2F]"
                      }`}
                    >
                      {type.label?.replace(/-/g, " ") || ""}
                    </button>
                  ))}
                </div>
                {errors.propertySubType && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.propertySubType}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-2">
              <Price error={errors.price} />
              <TotalArea error={errors.totalArea} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <PricePerSqft error={errors.pricePerSqft} />
              <RoadWidth error={errors.roadWidth} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CreatedBy error={errors.createdBy} />
            </div>

            {/* ================= CONTINUE ================= */}
            <div className="mt-10">
              <button
                onClick={handleContinue}
                className="w-full py-3 border-2 border-[#27AE60] rounded-lg text-[#27AE60] font-semibold hover:bg-[#27AE60] hover:text-white transition"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



// c i

// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step1BasicDetails.jsx
// import { useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { actions } from "../../../store/newIndex";
// import { Phone, Sparkles } from "lucide-react";
// import { setActiveCategory } from "../../../store/Ui/uiSlice";
// import { toast } from "sonner";

// import BuiltUpArea from "./TypeSpecificFields/common/BasicCommonComponents/BuiltUpArea";
// import CarpetArea from "./TypeSpecificFields/common/BasicCommonComponents/CarpetArea";
// import Price from "./TypeSpecificFields/common/BasicCommonComponents/Price";
// import Furnishing from "./TypeSpecificFields/common/BasicCommonComponents/Furnishing";
// import Facing from "./TypeSpecificFields/common/BasicCommonComponents/Facing";
// import TransactionTypes from "./TypeSpecificFields/common/BasicCommonComponents/TransactionTypes";
// import Counter from "./TypeSpecificFields/common/BasicCommonComponents/Counter";
// import AvailabilityStatus from "./TypeSpecificFields/common/BasicCommonComponents/AvailabilityStatus";
// import AgeOfProperty from "./TypeSpecificFields/common/BasicCommonComponents/AgeOfProperty";
// import PricePerSqft from "./TypeSpecificFields/common/BasicCommonComponents/PricePerSqft";
// import WallFinishStatus from "./TypeSpecificFields/common/BasicCommonComponents/WallFinishStatus";
// import LandDimensions from "./TypeSpecificFields/common/BasicCommonComponents/LandDimensions";
// import RoadWidthFt from "./TypeSpecificFields/common/BasicCommonComponents/RoadWidthFt";
// import PlotArea from "./TypeSpecificFields/common/BasicCommonComponents/PlotArea";
// import TotalArea from "./TypeSpecificFields/common/BasicCommonComponents/TotalArea";
// import RoadWidth from "./TypeSpecificFields/common/BasicCommonComponents/RoadWidth";
// import CreatedBy from "./TypeSpecificFields/common/BasicCommonComponents/CreatedBy";
// import { savePropertyData } from "../../../store/common/propertyThunks";

// const PROPERTY_TYPES = {
//   residential: [
//     { label: "Flat / Apartment", value: "apartment" },
//     { label: "Independent House", value: "independent-house" },
//     { label: "Villa", value: "villa" },
//     { label: "Penthouse", value: "penthouse" },
//     { label: "Studio", value: "studio" },
//     { label: "Duplex", value: "duplex" },
//     { label: "Triplex", value: "triplex" },
//     { label: "Farmhouse", value: "farmhouse" },
//     { label: "Independent Builder Floor", value: "independent-builder-floor" },
//   ],
//   commercial: [
//     { label: "Office", value: "office" },
//     { label: "Retail", value: "retail" },
//     { label: "Shop", value: "shop" },
//     { label: "Showroom", value: "showroom" },
//     { label: "Warehouse", value: "warehouse" },
//     { label: "Industrial", value: "industrial" },
//     { label: "Co-working Space", value: "coworking" },
//     { label: "Restaurant", value: "restaurant" },
//     { label: "Clinic", value: "clinic" },
//     { label: "Land", value: "land" },
//     { label: "Other", value: "other" },
//   ],
//   land: [
//     { label: "Plot", value: "plot" },
//     { label: "Residential Plot", value: "residential-plot" },
//     { label: "Industrial Plot", value: "industrial-plot" },
//     { label: "Agricultural Plot", value: "agricultural-plot" },
//     { label: "Commercial Plot", value: "commercial-plot" },
//     { label: "Investment Plot", value: "investment-plot" },
//     { label: "Corner Plot", value: "corner-plot" },
//     { label: "NA Plot", value: "na-plot" },
//   ],
//   agricultural: [
//     { label: "Dry Land", value: "dry-land" },
//     { label: "Wet Land", value: "wet-land" },
//     { label: "Farm Land", value: "farm-land" },
//     { label: "Orchard Land", value: "orchard-land" },
//     { label: "Plantation", value: "plantation" },
//     { label: "Agricultural Land", value: "agricultural-land" },
//     { label: "Dairy Farm", value: "dairy-farm" },
//     { label: "Ranch", value: "ranch" },
//   ],
// };

// const PROPERTY_SUB_TYPES = {
//   commercial: [
//     { label: "Bare Shell", value: "bare-shell" },
//     { label: "Warm Shell", value: "warm-shell" },
//     { label: "Business Center", value: "business-center" },
//     { label: "High Street Shop", value: "high-street-shop" },
//     { label: "Mall Shop", value: "mall-shop" },
//     { label: "Kiosk", value: "kiosk" },
//     { label: "Food Court Unit", value: "food-court-unit" },
//     { label: "Shutter Shop", value: "shutter-shop" },
//     { label: "Showroom Space", value: "showroom-space" },
//     { label: "Warehouse / Godown", value: "warehouse-godown" },
//     { label: "Logistics Hub", value: "logistics-hub" },
//     { label: "Cold Storage", value: "cold-storage" },
//     { label: "Industrial Shed", value: "industrial-shed" },
//   ],
//   land: [
//     { label: "Gated Community", value: "gated-community" },
//     { label: "Non Gated", value: "non-gated" },
//     { label: "Road Facing", value: "road-facing" },
//     { label: "Two Side Open", value: "two-side-open" },
//     { label: "Three Side Open", value: "three-side-open" },
//     { label: "Resale", value: "resale" },
//     { label: "New Plot", value: "new-plot" },
//     { label: "Corner", value: "corner" },
//   ],
//   agricultural: [
//     { label: "Irrigated", value: "irrigated" },
//     { label: "Non Irrigated", value: "non-irrigated" },
//     { label: "Fenced", value: "fenced" },
//     { label: "Unfenced", value: "unfenced" },
//     { label: "With Well", value: "with-well" },
//     { label: "With Borewell", value: "with-borewell" },
//     { label: "With Electricity", value: "with-electricity" },
//     { label: "Near Road", value: "near-road" },
//     { label: "Inside Village", value: "inside-village" },
//     { label: "Farmhouse Permission", value: "farmhouse-permission" },
//   ],
// };

// const LISTING_TYPES = [
//   { label: "Sale", value: "sale" },
//   { label: "Rent / Lease", value: "rent" },
// ];

// const CATEGORIES = [
//   { key: "residential", label: "Residential", emoji: "🏠" },
//   { key: "commercial", label: "Commercial", emoji: "🏢" },
//   { key: "land", label: "Land", emoji: "🌿" },
//   { key: "agricultural", label: "Agricultural", emoji: "🌾" },
// ];

// // ─── Shared sub-components ───────────────────────────────────────────────────

// const SectionLabel = ({ children }) => (
//   <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">{children}</p>
// );

// const CardWrapper = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>{children}</div>
// );

// const ChoiceChip = ({ label, selected, onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
//       selected
//         ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60] shadow-sm shadow-green-100"
//         : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60] hover:bg-[#f0fdf4]"
//     }`}
//   >
//     {label}
//   </button>
// );

// // ─── Category-agnostic form sections ─────────────────────────────────────────

// function CommonHeader({ form, setValue, category, errors, listingRef, categoryRef, propertyTypeRef, subTypeRef }) {
//   const showSubTypes = PROPERTY_SUB_TYPES[category] && form.propertyType;

//   return (
//     <>
//       {/* Listing Type */}
//       <CardWrapper>
//         <SectionLabel>I want to</SectionLabel>
//         <div ref={listingRef} className="flex gap-3 flex-wrap">
//           {LISTING_TYPES.map((item) => (
//             <ChoiceChip
//               key={item.value}
//               label={item.label}
//               selected={form.listingType === item.value}
//               onClick={() => setValue("listingType", item.value)}
//             />
//           ))}
//         </div>
//         {errors.listingType && <p className="text-red-500 text-xs mt-2 font-medium">{errors.listingType}</p>}
//       </CardWrapper>

//       {/* Category */}
//       <CardWrapper>
//         <SectionLabel>Property Category</SectionLabel>
//         <div ref={categoryRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {CATEGORIES.map((cat) => (
//             <label
//               key={cat.key}
//               className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
//                 category === cat.key
//                   ? "border-[#27AE60] bg-[#f0fdf4]"
//                   : "border-[#e5e7eb] hover:border-[#bbf7d0]"
//               }`}
//             >
//               <input type="radio" name="category" checked={category === cat.key} onChange={() => setValue("__category__", cat.key)} className="sr-only" />
//               <span className="text-xl">{cat.emoji}</span>
//               <span className={`text-xs font-bold ${category === cat.key ? "text-[#27AE60]" : "text-[#6b7280]"}`}>{cat.label}</span>
//             </label>
//           ))}
//         </div>
//         {errors.category && <p className="text-red-500 text-xs mt-2 font-medium">{errors.category}</p>}
//       </CardWrapper>

//       {/* Property Type */}
//       <CardWrapper>
//         <SectionLabel>Property Type</SectionLabel>
//         <div ref={propertyTypeRef} className="flex flex-wrap gap-2">
//           {(PROPERTY_TYPES[category] || []).map((type) => (
//             <ChoiceChip
//               key={type.value}
//               label={type.label}
//               selected={form.propertyType === type.value}
//               onClick={() => setValue("propertyType", type.value)}
//             />
//           ))}
//         </div>
//         {errors.propertyType && <p className="text-red-500 text-xs mt-2 font-medium">{errors.propertyType}</p>}
//       </CardWrapper>

//       {/* Property Sub Type */}
//       {showSubTypes && (
//         <CardWrapper>
//           <SectionLabel>Property Sub Type</SectionLabel>
//           <div ref={subTypeRef} className="flex flex-wrap gap-2">
//             {(PROPERTY_SUB_TYPES[category] || []).map((type) => (
//               <ChoiceChip
//                 key={type.value}
//                 label={type.label}
//                 selected={form.propertySubType === type.value}
//                 onClick={() => setValue("propertySubType", type.value)}
//               />
//             ))}
//           </div>
//           {errors.propertySubType && <p className="text-red-500 text-xs mt-2 font-medium">{errors.propertySubType}</p>}
//         </CardWrapper>
//       )}
//     </>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function Step1BasicDetails({ next }) {
//   const dispatch = useDispatch();
//   const category = useSelector((state) => state.ui.activeCategory);
//   const form = useSelector((state) => state[category]?.form || {});
//   const [errors, setErrors] = useState({});

//   const listingRef = useRef(null);
//   const categoryRef = useRef(null);
//   const propertyTypeRef = useRef(null);
//   const subTypeRef = useRef(null);

//   const setValue = (key, value) => {
//     if (key === "__category__") {
//       localStorage.removeItem("propertyId");
//       dispatch(setActiveCategory(value));
//       dispatch(actions[value].updateField({ key: "propertyType", value: "" }));
//       dispatch(actions[value].updateField({ key: "propertySubType", value: "" }));
//       setErrors((prev) => { const u = { ...prev }; delete u.category; return u; });
//       return;
//     }
//     if (category && actions[category]) dispatch(actions[category].updateField({ key, value }));
//     setErrors((prev) => { if (!prev[key]) return prev; const u = { ...prev }; delete u[key]; return u; });
//   };

//   const validateStep1 = () => {
//     const e = {};
//     if (!category) e.category = "Please select a category";
//     if (!form.listingType) e.listingType = "Please select Sale / Rent";
//     if (!form.propertyType) e.propertyType = "Please select property type";
//     if (PROPERTY_SUB_TYPES[category] && !form.propertySubType) e.propertySubType = "Please select property sub type";
//     const carpet = Number(form.carpetArea);
//     const builtUp = Number(form.builtUpArea);
//     if (carpet && builtUp && carpet > builtUp) {
//       e.carpetArea = "Carpet area cannot be greater than Built-up area";
//       e.builtUpArea = "Built-up area must be greater than Carpet area";
//     }
//     return e;
//   };

//   const handleContinue = async () => {
//     const validationErrors = validateStep1();
//     if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
//     const propertyId = localStorage.getItem("propertyId");
//     if (!propertyId) { toast.error("Property draft not found. Please restart."); return; }

//     const { meta, completion, _id, __v, createdAt, updatedAt, createdBy, gallery, documents, ...cleanData } = form;
//     const finalPayload = {
//       ...cleanData,
//       price: Number(cleanData.price) || 0,
//       builtUpArea: Number(cleanData.builtUpArea) || 0,
//       carpetArea: Number(cleanData.carpetArea) || 0,
//       bhk: Number(cleanData.bhk) || 0,
//       bedrooms: Number(cleanData.bedrooms) || 0,
//       bathrooms: Number(cleanData.bathrooms) || 0,
//       balconies: Number(cleanData.balconies) || 0,
//     };

//     try {
//       await dispatch(savePropertyData({ category, id: propertyId, step: "basic", data: finalPayload })).unwrap();
//       toast.success("Basic details saved");
//       next();
//     } catch (err) {
//       console.error("Save Error:", err);
//       toast.error("Failed to save basic details");
//     }
//   };

//   const sharedProps = { form, setValue, category, errors, listingRef, categoryRef, propertyTypeRef, subTypeRef };

//   return (
//     <div className="space-y-5">
//       {/* Top Banner */}
//       {/* <div className="bg-gradient-to-r from-[#27AE60] to-[#52D689] rounded-2xl p-5 text-white flex items-center justify-between shadow-lg shadow-green-200/50">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
//             <Sparkles size={14} className="text-green-200" />
//             <p className="text-[11px] font-bold text-green-200 uppercase tracking-widest">Quick Tip</p>
//           </div>
//           <p className="text-sm font-semibold">Get <span className="text-yellow-300">2 extra enquiries</span> by listing in the next</p>
//           <p className="text-xs text-green-100 mt-0.5">Complete all steps accurately</p>
//         </div>
//         <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
//           <p className="text-xl font-black">5:35</p>
//           <p className="text-[10px] text-green-100">minutes</p>
//         </div>
//       </div> */}

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-[#111827]">Basic Details</h2>
//           <p className="text-xs text-[#9ca3af] mt-0.5">Tell us about your property</p>
//         </div>
//         <button type="button" className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-4 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors">
//           <Phone size={13} />
//           Get a callback
//         </button>
//       </div>

//       {/* Common sections */}
//       <CommonHeader {...sharedProps} />

//       {/* Category-specific fields */}
//       {category === "residential" && (
//         <>
//           <CardWrapper>
//             <SectionLabel>Room Configuration</SectionLabel>
//             <div className="grid grid-cols-3 gap-4">
//               <Counter label="Bedrooms" reduxKey="bedrooms" error={errors.bedrooms} />
//               <Counter label="Bathrooms" reduxKey="bathrooms" error={errors.bathrooms} />
//               <Counter label="Balconies" reduxKey="balconies" error={errors.balconies} />
//             </div>
//           </CardWrapper>
//           <CardWrapper>
//             <SectionLabel>Area & Pricing</SectionLabel>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <CarpetArea error={errors.carpetArea} />
//               <BuiltUpArea error={errors.builtUpArea} />
//               <Price error={errors.price} />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//               <PricePerSqft error={errors.pricePerSqft} />
//               <Facing error={errors.facing} />
//             </div>
//           </CardWrapper>
//           <CardWrapper>
//             <SectionLabel>Property Details</SectionLabel>
//             <div className="space-y-5">
//               <Furnishing error={errors.furnishing} />
//               <AgeOfProperty error={errors.ageOfProperty} />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <AvailabilityStatus error={errors.constructionStatus} />
//                 <CreatedBy error={errors.createdBy} />
//               </div>
//               <TransactionTypes error={errors.transactionType} />
//             </div>
//           </CardWrapper>
//         </>
//       )}

//       {category === "commercial" && (
//         <>
//           <CardWrapper>
//             <SectionLabel>Space Configuration</SectionLabel>
//             <div className="grid grid-cols-2 gap-4">
//               <Counter label="Cabins" reduxKey="cabins" error={errors.cabins} />
//               <Counter label="Seats" reduxKey="seats" error={errors.seats} />
//             </div>
//           </CardWrapper>
//           <CardWrapper>
//             <SectionLabel>Furnishing & Finish</SectionLabel>
//             <div className="space-y-5">
//               <Furnishing error={errors.furnishing} />
//               <WallFinishStatus error={errors.wallFinishStatus} />
//             </div>
//           </CardWrapper>
//           <CardWrapper>
//             <SectionLabel>Area & Pricing</SectionLabel>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <CarpetArea error={errors.carpetArea} />
//               <BuiltUpArea error={errors.builtUpArea} />
//               <Price error={errors.price} />
//               <PricePerSqft error={errors.pricePerSqft} />
//             </div>
//           </CardWrapper>
//           <CardWrapper>
//             <SectionLabel>Property Details</SectionLabel>
//             <div className="space-y-5">
//               <AgeOfProperty error={errors.ageOfProperty} />
//               <AvailabilityStatus error={errors.constructionStatus} />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <TransactionTypes error={errors.transactionType} />
//                 <CreatedBy error={errors.createdBy} />
//               </div>
//             </div>
//           </CardWrapper>
//         </>
//       )}

//       {category === "land" && (
//         <>
//           <CardWrapper>
//             <SectionLabel>Land Details</SectionLabel>
//             <div className="space-y-5">
//               <LandDimensions error={errors.dimensions} />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Price error={errors.price} />
//                 <PricePerSqft error={errors.pricePerSqft} />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <RoadWidthFt error={errors.roadWidthFt} />
//                 <PlotArea error={errors.plotArea} />
//               </div>
//               <CreatedBy error={errors.createdBy} />
//             </div>
//           </CardWrapper>
//         </>
//       )}

//       {category === "agricultural" && (
//         <>
//           <CardWrapper>
//             <SectionLabel>Agricultural Details</SectionLabel>
//             <div className="space-y-5">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Price error={errors.price} />
//                 <TotalArea error={errors.totalArea} />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <PricePerSqft error={errors.pricePerSqft} />
//                 <RoadWidth error={errors.roadWidth} />
//               </div>
//               <CreatedBy error={errors.createdBy} />
//             </div>
//           </CardWrapper>
//         </>
//       )}

//       {/* Continue Button */}
//       <button
//         onClick={handleContinue}
//         className="w-full py-4 bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white font-bold rounded-2xl hover:from-[#219150] hover:to-[#27AE60] transition-all duration-200 shadow-lg shadow-green-200/60 active:scale-[0.99] text-sm tracking-wide"
//       >
//         Continue to Location →
//       </button>
//     </div>
//   );
// }
