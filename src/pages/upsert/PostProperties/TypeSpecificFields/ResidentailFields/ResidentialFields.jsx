


import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useActivePropertySlice } from "../UsePropertySlice/useActivePropertySlice";
import { savePropertyData } from "../../../../../store/common/propertyThunks";

// Components
import TopHeader from "../common/BasicCommonComponents/TopHeader";
import SubHeader from "../common/BasicCommonComponents/SubHeader";
import Amenities from "../common/BasicCommonComponents/Amenities";
import ParkingDetails from "../common/BasicCommonComponents/ParkingDetails";
import FloorDetails from "../common/BasicCommonComponents/FloorDetails";
import FlooringType from "../common/BasicCommonComponents/FlooringType";
import KitchenType from "../common/BasicCommonComponents/KitchenType";
import DescriptionMain from "../common/BasicCommonComponents/DescriptionMain";
import FeaturedPropertyComponent from "../common/BasicCommonComponents/FeaturedPropertyComponent";
import IsPriceNegotiable from "../common/BasicCommonComponents/IsPriceNegotiable";
import Status from "../common/BasicCommonComponents/Status";
import UploadGallery from "../common/BasicCommonComponents/UploadGallery"; // Added based on your request

export default function ResidentialFields({ back, next }) {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form } = useActivePropertySlice();

  // Refs for scrolling to errors
  const topRef = useRef(null);
  const amenitiesRef = useRef(null);
  const parkingTypeRef = useRef(null);
  const twoWheelerRef = useRef(null);
  const fourWheelerRef = useRef(null);
  const totalFloorsRef = useRef(null);
  const floorNumberRef = useRef(null);
  const flooringTypeRef = useRef(null);
  const kitchenTypeRef = useRef(null);
  const descriptionRef = useRef(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validateAll = () => {
    const e = {};

    // Section 1: Amenities & Parking
    if (!form.amenities || form.amenities.length === 0)
      e.amenities = "Select at least one Amenity";
    if (!form.parkingType) e.parkingType = "Select parking type";
    if (!form.twoWheeler) e.twoWheeler = "Enter two wheeler capacity";
    if (!form.fourWheeler) e.fourWheeler = "Enter four wheeler capacity";

    // Section 2: Floor & Construction
    if (!form.totalFloors) e.totalFloors = "Enter Total Floors";
    if (!form.floorNumber) e.floorNumber = "Enter Floor Number";
    if (!form.flooringType) e.flooringType = "Select flooring type";
    if (!form.kitchenType) e.kitchenType = "Select kitchen type";

    // Section 3: Finalize
    if (!form.description) e.description = "Enter description";
    if (!form.status) e.status = "Select property status";

    // Gallery Validation (Optional, remove if not mandatory)
    if (!form.galleryFiles || form.galleryFiles.length === 0)
      e.galleryFiles = "Please upload at least one image";

    return e;
  };

  // Real-time error clearing
  useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (form.amenities?.length > 0) delete updated.amenities;
      if (form.parkingType) delete updated.parkingType;
      if (form.twoWheeler) delete updated.twoWheeler;
      if (form.fourWheeler) delete updated.fourWheeler;
      if (form.totalFloors) delete updated.totalFloors;
      if (form.floorNumber) delete updated.floorNumber;
      if (form.flooringType) delete updated.flooringType;
      if (form.kitchenType) delete updated.kitchenType;
      if (form.description) delete updated.description;
      if (form.status) delete updated.status;
      if (form.galleryFiles?.length > 0) delete updated.galleryFiles;
      return updated;
    });
  }, [form]);

  const handleSubmit = async () => {
    const validationErrors = validateAll();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Smart Scroll to first error
      if (validationErrors.amenities)
        amenitiesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (validationErrors.parkingType)
        parkingTypeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (validationErrors.totalFloors)
        totalFloorsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else if (validationErrors.description)
        descriptionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      else scrollToTop();

      return;
    }

    const propertyId = localStorage.getItem("propertyId");
    if (!propertyId) {
      toast.error("Property ID missing.");
      return;
    }

    setIsSubmitting(true);
    dispatch(
      savePropertyData({
        category: "residential",
        id: propertyId,
        step: "details",
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("All details saved successfully");
        next();
      })
      .catch((err) => {
        console.error("Save error:", err);
        toast.error(err?.message || "Failed to save details");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div
      ref={topRef}
      className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-8 mx-auto shadow-sm"
    >
      <TopHeader />

      <div className="space-y-12 mt-6">
        {/* SUBHEADER & AMENITIES */}
        <section className="space-y-10 animate-fadeIn">
          <SubHeader />
          <div ref={amenitiesRef}>
            <Amenities error={errors.amenities} />
          </div>

          {/* PARKING */}
          <div className="grid grid-cols-1 gap-8 border-t pt-10">
            <ParkingDetails
              errors={errors}
              ref={[parkingTypeRef, twoWheelerRef, fourWheelerRef]}
            />
          </div>

          {/* FLOOR DETAILS */}
          <div className="grid grid-cols-1 gap-8 border-t pt-10">
            <FloorDetails
              errors={errors}
              ref={[totalFloorsRef, floorNumberRef]}
            />
          </div>

          {/* FLOORING & KITCHEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-10">
            <div ref={flooringTypeRef}>
              <FlooringType error={errors.flooringType} />
            </div>
            <div ref={kitchenTypeRef}>
              <KitchenType error={errors.kitchenType} />
            </div>
          </div>
        </section>

        {/* PRICING & FINALIZATION */}
        <section className="space-y-10 border-t pt-10 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeaturedPropertyComponent error={errors.isFeatured} />
            <IsPriceNegotiable error={errors.isPriceNegotiable} />
          </div>

          <div ref={descriptionRef}>
            <DescriptionMain error={errors.description} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Status error={errors.status} />
          </div>
          <UploadGallery error={errors.galleryFiles} />
        </section>

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between items-center pt-10 border-t">
          <button
            type="button"
            onClick={back}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`px-10 py-3 rounded-lg text-white font-semibold transition-all shadow-md ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#27AE60] hover:bg-[#219150] active:scale-95"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
