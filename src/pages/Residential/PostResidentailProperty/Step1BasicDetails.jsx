
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step1BasicDetails.jsx
import { useState,useEffect,  useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../store/newIndex";
import { Phone, Sparkles } from "lucide-react";
import { setActiveCategory } from "../../../store/Ui/uiSlice";
import { toast } from "sonner";

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
import FurnishedStatus from "./TypeSpecificFields/common/BasicCommonComponents/FurnishedStatus";

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
    { label: "Corner Plot", value: "corner-plot" },
    { label: "NA Plot", value: "na-plot" },
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
    { label: "Non Gated", value: "non-gated" },
    { label: "Road Facing", value: "road-facing" },
    { label: "Two Side Open", value: "two-side-open" },
    { label: "Three Side Open", value: "three-side-open" },
    { label: "Resale", value: "resale" },
    { label: "New Plot", value: "new-plot" },
    { label: "Corner", value: "corner" },
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

const LISTING_TYPES = [
  { label: "Sale", value: "sale" },
  { label: "Rent / Lease", value: "rent" },
];

const CATEGORIES = [
  { key: "residential", label: "Residential", emoji: "🏠" },
  { key: "commercial", label: "Commercial", emoji: "🏢" },
  { key: "land", label: "Land", emoji: "🌿" },
  { key: "agricultural", label: "Agricultural", emoji: "🌾" },
];


const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">{children}</p>
);

const CardWrapper = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>{children}</div>
);

const ChoiceChip = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
      selected
        ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60] shadow-sm shadow-green-100"
        : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60] hover:bg-[#f0fdf4]"
    }`}
  >
    {label}
  </button>
);



function CommonHeader({ form, setValue, category, errors, listingRef, categoryRef, propertyTypeRef, subTypeRef }) {
  const showSubTypes = PROPERTY_SUB_TYPES[category] && form.propertyType;

  return (
    <>
      {/* Listing Type */}
      <CardWrapper>
        <SectionLabel>I want to</SectionLabel>
        <div ref={listingRef} className="flex gap-3 flex-wrap">
          {LISTING_TYPES.map((item) => (
            <ChoiceChip
              key={item.value}
              label={item.label}
              selected={form.listingType === item.value}
              onClick={() => setValue("listingType", item.value)}
            />
          ))}
        </div>
        {errors.listingType && <p className="text-red-500 text-xs mt-2 font-medium">{errors.listingType}</p>}
      </CardWrapper>

      {/* Category */}
      <CardWrapper>
        <SectionLabel>Property Category</SectionLabel>
        <div ref={categoryRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.key}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                category === cat.key
                  ? "border-[#27AE60] bg-[#f0fdf4]"
                  : "border-[#e5e7eb] hover:border-[#bbf7d0]"
              }`}
            >
              <input type="radio" name="category" checked={category === cat.key} onChange={() => setValue("__category__", cat.key)} className="sr-only" />
              <span className="text-xl">{cat.emoji}</span>
              <span className={`text-xs font-bold ${category === cat.key ? "text-[#27AE60]" : "text-[#6b7280]"}`}>{cat.label}</span>
            </label>
          ))}
        </div>
        {errors.category && <p className="text-red-500 text-xs mt-2 font-medium">{errors.category}</p>}
      </CardWrapper>

      {/* Property Type */}
      <CardWrapper>
        <SectionLabel>Property Type</SectionLabel>
        <div ref={propertyTypeRef} className="flex flex-wrap gap-2">
          {(PROPERTY_TYPES[category] || []).map((type) => (
            <ChoiceChip
              key={type.value}
              label={type.label}
              selected={form.propertyType === type.value}
              onClick={() => setValue("propertyType", type.value)}
            />
          ))}
        </div>
        {errors.propertyType && <p className="text-red-500 text-xs mt-2 font-medium">{errors.propertyType}</p>}
      </CardWrapper>

      {/* Property Sub Type */}
      {showSubTypes && (
        <CardWrapper>
          <SectionLabel>Property Sub Type</SectionLabel>
          <div ref={subTypeRef} className="flex flex-wrap gap-2">
            {(PROPERTY_SUB_TYPES[category] || []).map((type) => (
              <ChoiceChip
                key={type.value}
                label={type.label}
                selected={form.propertySubType === type.value}
                onClick={() => setValue("propertySubType", type.value)}
              />
            ))}
          </div>
          {errors.propertySubType && <p className="text-red-500 text-xs mt-2 font-medium">{errors.propertySubType}</p>}
        </CardWrapper>
      )}
    </>
  );
}

// ─── Main Component ── //



export default function Step1BasicDetails({ next }) {
  const dispatch = useDispatch();
  const category = useSelector((state) => state.ui.activeCategory);
  const form = useSelector((state) => state[category]?.form || {});
  const [errors, setErrors] = useState({});

  const listingRef = useRef(null);
  const categoryRef = useRef(null);
  const propertyTypeRef = useRef(null);
  const subTypeRef = useRef(null);

  const setValue = (key, value) => {
    if (key === "__category__") {
      localStorage.removeItem("propertyId");
      dispatch(setActiveCategory(value));
      dispatch(actions[value].updateField({ key: "propertyType", value: "" }));
      dispatch(actions[value].updateField({ key: "propertySubType", value: "" }));
      setErrors((prev) => { const u = { ...prev }; delete u.category; return u; });
      return;
    }
    if (category && actions[category]) dispatch(actions[category].updateField({ key, value }));
    setErrors((prev) => { if (!prev[key]) return prev; const u = { ...prev }; delete u[key]; return u; });
  };

        
  const validateStep1 = () => {
    const e = {};

    if (!category) e.category = "Please select a category";
    if (!form.listingType) e.listingType = "Please select Sale / Rent";
    if (!form.propertyType) e.propertyType = "Please select property type";

    if (PROPERTY_SUB_TYPES[category] && !form.propertySubType)
      e.propertySubType = "Please select property sub type";

    if (category === "residential") {
      if (!form.carpetArea) e.carpetArea = "Carpet area required";
      if (!form.builtUpArea) e.builtUpArea = "Built-up area required";
      const carpet = Number(form.carpetArea);
      const builtUp = Number(form.builtUpArea);

      if (carpet && builtUp && carpet > builtUp) {
        e.carpetArea = "Carpet area cannot be greater than Built-up area";
        e.builtUpArea = "Built-up area must be greater than Carpet area";
      }
      if (!form.bedrooms) e.bedrooms = "Bedrooms required";
      if (!form.bathrooms) e.bathrooms = "Bathrooms required";
      if (!form.balconies) e.balconies = "Balconies required";
      if (!form.price) e.price = "Price required";
      if (!form.pricePerSqft) e.pricePerSqft = "Price per sqft required";
      if (!form.facing) e.facing = "Facing required";
      if (!form.furnishing) e.furnishing = "Furnishing required";
      if (!form.propertyAge) e.propertyAge = "Property age required";
      if (!form.constructionStatus)
        e.constructionStatus = "Construction status required";
      if (!form.transactionType)
        e.transactionType = "Transaction type required";
    }

    if (category === "commercial") {
      if (!form.cabins) e.cabins = "Cabins required";
      if (!form.seats) e.seats = "Seats required";
      if (!form.carpetArea) e.carpetArea = "Carpet area required";
      if (!form.builtUpArea) e.builtUpArea = "Built-up area required";
      const carpet = Number(form.carpetArea);
      const builtUp = Number(form.builtUpArea);

      if (carpet && builtUp && carpet > builtUp) {
        e.carpetArea = "Carpet area cannot be greater than Built-up area";
        e.builtUpArea = "Built-up area must be greater than Carpet area";
      }
      if (!form.price) e.price = "Price required";
      if (!form.pricePerSqft) e.pricePerSqft = "Price per sqft required";
      if (!form.furnishedStatus)
        e.furnishedStatus = "Furnished status required";
      if (!form.wallFinishStatus) e.wallFinishStatus = "Wall finish status required";
      if (!form.propertyAge) e.propertyAge = "Property age required";
      if (!form.constructionStatus)
        e.constructionStatus = "Construction status required";
      if (!form.transactionType)
        e.transactionType = "Transaction type required";
    }

    if (category === "land") {
      if (!form.price) e.price = "Price required";
      if (!form.pricePerSqft) e.pricePerSqft = "Price per sqft required";
      if (!form.plotArea) e.plotArea = "Plot area required";
      if (!form.roadWidthFt) e.roadWidthFt = "Road width required";
    }

    if (category === "agricultural") {
      if (!form.price) e.price = "Price required";
      if (!form.pricePerSqft) e.pricePerSqft = "Price per sqft required";
      if (!form.totalArea?.value) e.totalArea = "Total area required";
      if (!form.roadWidth?.value) e.roadWidth = "Road width required";
    }

    return e;
  };



 
const buildPayloadByCategory = (category, data) => {
  const base = {
    listingType: data.listingType,
    propertyCategory: data.propertyCategory,
    propertyType: data.propertyType,
    propertySubType: data.propertySubType,
    price: Number(data.price) || 0,
    pricePerSqft: Number(data.pricePerSqft),
    createdBy: data.createdBy,
  };

  switch (category) {
    case "agricultural":
      return {
        ...base,
        totalArea: data.totalArea,
        roadWidth: data.roadWidth,
      };

    case "land":
      return {
        ...base,
        plotArea: data.plotArea,
        roadWidthFt: data.roadWidthFt,
        dimensions: data.dimensions,
      };

    case "commercial":
      return {
        ...base,
        carpetArea: Number(data.carpetArea) || 0,
        builtUpArea: Number(data.builtUpArea) || 0,
        cabins: Number(data.cabins) || 0,
        seats: Number(data.seats) || 0,
        furnishedStatus: data.furnishedStatus,
        wallFinishStatus: data.wallFinishStatus,
        propertyAge: data.propertyAge,
        constructionStatus: data.constructionStatus,
        transactionType: data.transactionType,
      };

    case "residential":
      return {
        ...base,
        carpetArea: Number(data.carpetArea) || 0,
        builtUpArea: Number(data.builtUpArea) || 0,
        bedrooms: Number(data.bedrooms) || 0,
        bathrooms: Number(data.bathrooms) || 0,
        balconies: Number(data.balconies) || 0,
        furnishing: data.furnishing,
        facing: data.facing,
        propertyAge: data.propertyAge,
        constructionStatus: data.constructionStatus,
        transactionType: data.transactionType,
      };

    default:
      return base;
  }
};


  // const handleContinue = async () => {
  //   const validationErrors = validateStep1();
  //   if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
  //   const propertyId = localStorage.getItem("propertyId");
  //   if (!propertyId) { toast.error("Property draft not found. Please restart."); return; }

  //   const { meta, completion, _id, __v, createdAt, updatedAt, gallery, documents, ...cleanData } = form;
    

  //   const finalPayload = buildPayloadByCategory(category, cleanData);
  //   try {
  //     await dispatch(savePropertyData({ category, id: propertyId, step: "basic", data: finalPayload })).unwrap();
  //     toast.success("Basic details saved");
  //     next();
  //   } catch (err) {
  //     console.error("Save Error:", err);
  //     toast.error("Failed to save basic details");
  //   }
  // };


  const handleContinue = async () => {
    console.log("🔍 DEBUG: Starting Validation for Category:", category);
    const validationErrors = validateStep1();

    if (Object.keys(validationErrors).length > 0) {
      console.error("❌ Validation Failed. Errors:", validationErrors);
      setErrors(validationErrors);
      return;
    }

    const propertyId = localStorage.getItem("propertyId");
    console.log("🆔 Current Property ID from Storage:", propertyId);

    if (!propertyId) {
      toast.error("Property draft not found. Please restart.");
      return;
    }

    // Remove metadata before sending
    const {
      meta,
      completion,
      _id,
      __v,
      createdAt,
      updatedAt,
      gallery,
      documents,
      ...cleanData
    } = form;

    // LOG THE RAW DATA BEFORE CLEANING
    console.log("📦 Raw Form Data from Redux:", cleanData);

    const finalPayload = buildPayloadByCategory(category, cleanData);

    // THIS IS THE MOST IMPORTANT LOG
    console.log(
      "🚀 FINAL PAYLOAD TO API (Category: " + category + "):",
      finalPayload,
    );

    try {
      const response = await dispatch(
        savePropertyData({
          category,
          id: propertyId,
          step: "basic",
          data: finalPayload,
        }),
      ).unwrap();

      console.log("✅ API Response Success:", response);
      toast.success(`${category} details saved`);
      next(); // This moves you to Step 2 (Location)
    } catch (err) {
      console.error("🔥 API SAVE ERROR:", err);
      toast.error("Failed to save basic details");
    }
  };

  
  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        if (form[key]) {
          delete updated[key];
        }
      });

      return updated;
    });
  }, [form]);

  const sharedProps = { form, setValue, category, errors, listingRef, categoryRef, propertyTypeRef, subTypeRef };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#27AE60]">Basic Details</h2>
          <p className="text-xs text-[#000000] mt-0.5">
            Tell us about your property
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-4 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors"
        >
          <Phone size={13} />
          Get a callback
        </button>
      </div>

      {/* Common sections */}
      <CommonHeader {...sharedProps} />

      {/* Category-specific fields */}
      {category === "residential" && (
        <>
          <CardWrapper>
            <SectionLabel>Room Configuration</SectionLabel>
            <div className="grid grid-cols-3 gap-4">
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
          </CardWrapper>
          <CardWrapper>
            <SectionLabel>Area & Pricing</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <CarpetArea error={errors.carpetArea} />
              <BuiltUpArea error={errors.builtUpArea} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Price error={errors.price} />
              <PricePerSqft error={errors.pricePerSqft} />
              <Facing error={errors.facing} />
            </div>
          </CardWrapper>
          <CardWrapper>
            <SectionLabel>Property Details</SectionLabel>
            <div className="space-y-5">
              <Furnishing error={errors.furnishing} />
              <AgeOfProperty error={errors.propertyAge} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AvailabilityStatus error={errors.constructionStatus} />
                <CreatedBy error={errors.createdBy} />
              </div>
              <TransactionTypes error={errors.transactionType} />
            </div>
          </CardWrapper>
        </>
      )}

      {category === "commercial" && (
        <>
          <CardWrapper>
            <SectionLabel>Space Configuration</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Counter label="Cabins" reduxKey="cabins" error={errors.cabins} />
              <Counter label="Seats" reduxKey="seats" error={errors.seats} />
            </div>
          </CardWrapper>
          <CardWrapper>
            <SectionLabel>Furnished & Finish</SectionLabel>
            <div className="space-y-5">
              <FurnishedStatus error={errors.furnishedStatus} />
              <WallFinishStatus error={errors.wallFinishStatus} />
            </div>
          </CardWrapper>
          <CardWrapper>
            <SectionLabel>Area & Pricing</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CarpetArea error={errors.carpetArea} />
              <BuiltUpArea error={errors.builtUpArea} />
              <Price error={errors.price} />
              <PricePerSqft error={errors.pricePerSqft} />
            </div>
          </CardWrapper>
          <CardWrapper>
            <SectionLabel>Property Details</SectionLabel>
            <div className="space-y-5">
              <AgeOfProperty error={errors.propertyAge} />
              <AvailabilityStatus error={errors.constructionStatus} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TransactionTypes error={errors.transactionType} />
                <CreatedBy error={errors.createdBy} />
              </div>
            </div>
          </CardWrapper>
        </>
      )}

      {category === "land" && (
        <>
          <CardWrapper>
            <SectionLabel>Land Details</SectionLabel>
            <div className="space-y-5">
              <LandDimensions error={errors.dimensions} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Price error={errors.price} />
                <PricePerSqft error={errors.pricePerSqft} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoadWidthFt error={errors.roadWidthFt} />
                <PlotArea error={errors.plotArea} />
              </div>
              <CreatedBy error={errors.createdBy} />
            </div>
          </CardWrapper>
        </>
      )}

      {category === "agricultural" && (
        <>
          <CardWrapper>
            <SectionLabel>Agricultural Details</SectionLabel>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Price error={errors.price} />
                <PricePerSqft error={errors.pricePerSqft} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TotalArea error={errors.totalArea} />
                <RoadWidth error={errors.roadWidth} />
              </div>
              <CreatedBy error={errors.createdBy} />
            </div>
          </CardWrapper>
        </>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="w-full py-4 bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white font-bold rounded-2xl hover:from-[#219150] hover:to-[#27AE60] transition-all duration-200 shadow-lg shadow-green-200/60 active:scale-[0.99] text-sm tracking-wide"
      >
        Continue to Location →
      </button>
    </div>
  );
}
