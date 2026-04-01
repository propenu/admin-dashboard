

//frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/ResidentailFields/ResidentialFields.jsx
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useActivePropertySlice } from "../UsePropertySlice/useActivePropertySlice";
import { savePropertyData } from "../../../../../store/common/propertyThunks";
import { Phone } from "lucide-react";

import Amenities from "../common/BasicCommonComponents/Amenities";
import ParkingDetails from "../common/BasicCommonComponents/ParkingDetails";
import FloorDetails from "../common/BasicCommonComponents/FloorDetails";
import FlooringType from "../common/BasicCommonComponents/FlooringType";
import KitchenType from "../common/BasicCommonComponents/KitchenType";
import DescriptionMain from "../common/BasicCommonComponents/DescriptionMain";
import IsPriceNegotiable from "../common/BasicCommonComponents/IsPriceNegotiable";
import UploadGallery from "../common/BasicCommonComponents/UploadGallery";

const CardWrapper = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-4">{children}</p>
);

export default function ResidentialFields({ back, next }) {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form } = useActivePropertySlice();

  const topRef = useRef(null);
  const amenitiesRef = useRef(null);
  const parkingTypeRef = useRef(null);
  const totalFloorsRef = useRef(null);
  const descriptionRef = useRef(null);

  const validateAll = () => {
    const e = {};
    if (!form.amenities || form.amenities.length === 0) e.amenities = "Select at least one amenity";
    if (!form.parkingType) e.parkingType = "Select parking type";
    if (!form.parkingDetails?.twoWheeler)
      e.twoWheeler = "Enter two wheeler capacity";
    if (!form.parkingDetails?.fourWheeler)
      e.fourWheeler = "Enter four wheeler capacity";
    if (!form.totalFloors) e.totalFloors = "Enter total floors";
    if (!form.floorNumber) e.floorNumber = "Enter floor number";
    if (!form.flooringType) e.flooringType = "Select flooring type";
    if (!form.kitchenType) e.kitchenType = "Select kitchen type";
    if (!form.description) e.description = "Enter property description";
    if (!form.galleryFiles || form.galleryFiles.length < 5) e.galleryFiles = "Upload at least Five image";
    return e;
  };

  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (form.amenities?.length > 0) delete updated.amenities;
      if (form.parkingType) delete updated.parkingType;
      if (form.parkingDetails?.twoWheeler) delete updated.twoWheeler;
      if (form.parkingDetails?.fourWheeler) delete updated.fourWheeler;
      if (form.totalFloors) delete updated.totalFloors;
      if (form.floorNumber) delete updated.floorNumber;
      if (form.flooringType) delete updated.flooringType;
      if (form.kitchenType) delete updated.kitchenType;
      if (form.description) delete updated.description;
      if (form.galleryFiles?.length > 0) delete updated.galleryFiles;
      return updated;
    });
  }, [form]);

  const handleSubmit = async () => {
    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.amenities) amenitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (validationErrors.parkingType) parkingTypeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (validationErrors.totalFloors) totalFloorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (validationErrors.description) descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

   const activeCategory = localStorage.getItem("activeCategory");
   const propertyId = localStorage.getItem(`${activeCategory}_propertyId`);
    if (!propertyId) { toast.error("Property ID missing."); return; }

    setIsSubmitting(true);
    dispatch(savePropertyData({ category: "residential", id: propertyId, step: "details" }))
      .unwrap()
      .then(() => { toast.success("Property details saved successfully"); next(); })
      .catch((err) => { console.error("Save error:", err); toast.error(err?.message || "Failed to save details"); })
      .finally(() => setIsSubmitting(false));
  };


  
  
  return (
    <div ref={topRef} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#27AE60]">Property Profile</h2>
          <p className="text-xs text-[#000000] mt-0.5">Add detailed information about your property</p>
        </div>
        <button type="button" className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-4 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors">
          <Phone size={13} />
          Get a callback
        </button>
      </div>

      {/* Amenities */}
      <CardWrapper>
        <SectionLabel>Amenities</SectionLabel>
        <div ref={amenitiesRef}>
          <Amenities error={errors.amenities} />
        </div>
      </CardWrapper>

      {/* Parking */}
      <CardWrapper>
        <SectionLabel>Parking Details</SectionLabel>
        <div ref={parkingTypeRef}>
          <ParkingDetails errors={errors} />
        </div>
      </CardWrapper>

      {/* Floor Details */}
      <CardWrapper>
        <SectionLabel>Floor Information</SectionLabel>
        <div ref={totalFloorsRef}>
          <FloorDetails errors={errors} />
        </div>
      </CardWrapper>

      {/* Flooring & Kitchen */}
      <CardWrapper>
        <SectionLabel>Interior Details</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FlooringType error={errors.flooringType} />
          <KitchenType error={errors.kitchenType} />
        </div>
      </CardWrapper>

      {/* Price & Description */}
      <CardWrapper>
        <SectionLabel>Pricing & Description</SectionLabel>
        <div className="space-y-6">
          <IsPriceNegotiable error={errors.isPriceNegotiable} />
          <div ref={descriptionRef}>
            <DescriptionMain error={errors.description} />
          </div>
        </div>
      </CardWrapper>

      {/* Gallery */}
      <CardWrapper>
        <SectionLabel>Property Photos</SectionLabel>
        <UploadGallery error={errors.galleryFiles} />
      </CardWrapper>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={back}
          className="flex-1 py-4 border-2 border-[#e5e7eb] text-[#6b7280] font-bold rounded-2xl hover:border-[#27AE60] hover:text-[#27AE60] transition-all duration-200 text-sm"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={`flex-1 py-4 font-bold rounded-2xl text-sm transition-all duration-200 ${
            isSubmitting
              ? "bg-[#9ca3af] text-white cursor-not-allowed"
              : "bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white hover:from-[#219150] hover:to-[#27AE60] shadow-lg shadow-green-200/60"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}