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
import DescriptionMain from "./TypeSpecificFields/common/BasicCommonComponents/DescriptionMain";
import UploadGallery from "./TypeSpecificFields/common/BasicCommonComponents/UploadGallery";
import Counter from "./TypeSpecificFields/common/BasicCommonComponents/Counter";
import { savePropertyData } from "../../../store/common/propertyThunks";
import { apiClient } from "../../../api/apiClient";
import AvailabilityStatus from "./TypeSpecificFields/common/BasicCommonComponents/AvailabilityStatus";
import AgeOfProperty from "./TypeSpecificFields/common/BasicCommonComponents/AgeOfProperty";
import PricePerSqft from "./TypeSpecificFields/common/BasicCommonComponents/PricePerSqft";
import WallFinishStatus from "./TypeSpecificFields/common/BasicCommonComponents/WallFinishStatus";
import LandDimensions from "./TypeSpecificFields/common/BasicCommonComponents/LandDimensions";
import RoadWidthFt from "./TypeSpecificFields/common/BasicCommonComponents/RoadWidthFt";
import PlotArea from "./TypeSpecificFields/common/BasicCommonComponents/PlotArea";
import TotalArea from "./TypeSpecificFields/common/BasicCommonComponents/TotalArea";
import RoadWidth from "./TypeSpecificFields/common/BasicCommonComponents/RoadWidth";





/* ================= PROPERTY TYPES CONFIG ================= */
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


/* ================= PROPERTY SUB TYPES CONFIG ================= */
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

export default function Step1BasicDetails({ next }) {
  const dispatch = useDispatch();

  

  const initDraftForCategory = async (catKey, dispatch) => {
    try {
      const existing = await apiClient.get(
        `/api/properties/${catKey}/draft/me`,
      );

      if (existing?.data?._id) {
        localStorage.setItem("propertyId", existing.data._id);
        dispatch(actions[catKey].hydrateForm(existing.data));
        return;
      }
    } catch (_) {
      // ignore
    }

    const created = await apiClient.post(`/api/properties/${catKey}/draft`);

    localStorage.setItem("propertyId", created.data._id);
    dispatch(actions[catKey].hydrateForm(created.data));
  };


  const category = useSelector((state) => state.ui.activeCategory);
  
  useEffect(() => {
    if (!category) return;

    const propertyId = localStorage.getItem("propertyId");
    if (propertyId) return; // already initialized

    initDraftForCategory(category, dispatch).catch(() => {
      toast.error("Failed to initialize property draft");
    });
  }, [category]);

   
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


const handleCategoryChange = async (catKey) => {
  setErrors((prev) => {
    const updated = { ...prev };
    delete updated.category;
    return updated;
  });

  dispatch(setActiveCategory(catKey));
  localStorage.removeItem("propertyId");

  try {
    await initDraftForCategory(catKey, dispatch);
  } catch {
    toast.error("Failed to initialize property draft");
    return;
  }

  dispatch(
    actions[catKey].updateField({
      key: "propertyCategory",
      value: catKey,
    }),
  );
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

      // if (!form.galleryFiles || form.galleryFiles.length < 5) {
      //   newErrors.galleryFiles = "Please upload at least 5 photos";
      // }


      return newErrors;
    };

    
    
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

     // --- SANITIZE PAYLOAD ---
     // We extract the system fields out and keep only the 'cleanData'
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
           data: finalPayload, // Send the clean payload here
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
                {["sale", "rent", "lease"].map((item) => (
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
            <div className="grid grid-cols-1 gap-4 mb-2">
              <AvailabilityStatus error={errors.constructionStatus} />
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
                {["sale", "rent", "lease"].map((item) => (
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
                {["sale", "rent", "lease"].map((item) => (
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
              <LandDimensions error={errors.dimensions} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
             <Price error={errors.price} />
             <PlotArea error={errors.plotArea} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <PricePerSqft error={errors.pricePerSqft} />
              <RoadWidthFt error={errors.roadWidthFt} />
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
                {["sale", "rent", "lease"].map((item) => (
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



