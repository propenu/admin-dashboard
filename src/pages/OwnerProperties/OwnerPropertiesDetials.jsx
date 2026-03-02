// frontend/admin-dashboard/src/pages/OwnerPropertyDetails.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  DoorOpen,
  User,
  ShieldCheck,
  ShieldAlert,
  Save,
  Edit2,
  X as XIcon,
  RefreshCw,
  Home,
} from "lucide-react";

import { ownersProperties } from "../../services/propertyservice";
import { formatPrice } from "../../utils/formatters";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import FloatingColorPicker from "../../components/ThemeEditor/FloatingColorPicker";
import OptimizedEditableElement from "../../components/ThemeEditor/OptimizedEditableElement";
import {
  generateColorPalette,
  getContrastTextColor,
} from "../../utils/colorUtils";

export default function OwnerPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);

  const [colors, setColors] = useState({
    primary: "#ff6600",
    title: "#ff6600",
    icon: "#3b82f6",
    priceCard: "#10b981",
    specCard: "#8b5cf6",
    button: "#ef4444",
    amenity: "#f59e0b",
  });

  // Fetch Owner Properties from backend
  const { data, isLoading } = useQuery({
    queryKey: ["ownersProperties"],
    queryFn: ownersProperties,
  });

  const property = data?.items?.find((p) => p._id === id);

  // Generate palette
  const palettes = useMemo(() => {
    const output = {};
    Object.entries(colors).forEach(([key, color]) => {
      output[key] = generateColorPalette(color);
    });
    return output;
  }, [colors]);

  // Load color theme from DB if saved
  useEffect(() => {
    if (property?.color) {
      setColors((prev) => ({
        ...prev,
        primary: property.color,
        title: property.color,
      }));
    }
  }, [property]);

  // Save theme mutation PATCH
  const saveTheme = useMutation({
    mutationFn: async (themeColors) => {
      const res = await fetch(
        `http://192.168.1.14:4003/api/owner-properties/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            color: themeColors.primary,
            themeColors,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update theme");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ownersProperties"]);
      setIsEditMode(false);
    },
  });

  const handleEditClick = useCallback(
    (info) => {
      setActiveEditor({
        type: info.elementId,
        color: colors[info.elementId],
        name: info.elementName,
        position: { x: info.x, y: info.y },
      });
    },
    [colors]
  );

  const handleColorSave = useCallback(
    (newColor) => {
      setColors((prev) => ({ ...prev, [activeEditor.type]: newColor }));
      setActiveEditor(null);
    },
    [activeEditor]
  );

  const handleSaveAll = () => {
    saveTheme.mutate(colors);
  };

  const handleReset = () => {
    setColors({
      primary: property?.color || "#ff6600",
      title: property?.color || "#ff6600",
      icon: "#3b82f6",
      priceCard: "#10b981",
      specCard: "#8b5cf6",
      button: "#ef4444",
      amenity: "#f59e0b",
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (!property)
    return (
      <div className="text-center flex flex-col items-center py-20">
        <Home className="w-16 h-16 text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">
          Property not found
        </h2>
        <button
          onClick={() => navigate("/owner-properties")}
          className="text-blue-600 underline mt-2"
        >
          Go back
        </button>
      </div>
    );

  const firstImage =
    property.media?.[0]?.url ||
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4";

  const isVerified = property.ownerProperties?.isVerified;

  return (
    <>
      {/* Floating Color Picker */}
      {activeEditor && (
        <FloatingColorPicker
          position={activeEditor.position}
          initialColor={activeEditor.color}
          elementName={activeEditor.name}
          onSave={handleColorSave}
          onCancel={() => setActiveEditor(null)}
        />
      )}

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Edit2 className="w-5 h-5" />
            <div>
              <p className="font-bold">Theme Editor Active</p>
              <p className="text-xs opacity-90">
                Click on elements to edit their colors
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-2"
            >
              <XIcon className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className={`space-y-6 ${isEditMode ? "mt-16" : ""}`}>
        {/* Back Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
            >
              <Edit2 className="w-4 h-4" /> Edit Theme
            </button>
          )}
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-72 sm:h-96 overflow-hidden">
            <img
              src={firstImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}35 0%, ${colors.primary}00 100%)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-10">
            {/* Title + Location */}
            <div>
              <OptimizedEditableElement
                isEditMode={isEditMode}
                elementId="title"
                elementName="Title"
                hoverColor={colors.title}
                onEditClick={handleEditClick}
              >
                <h1
                  className="text-3xl font-bold"
                  style={{ color: colors.title }}
                >
                  {property.title}
                </h1>
              </OptimizedEditableElement>

              <div className="flex items-center gap-2 mt-3 text-slate-600">
                <MapPin className="w-5 h-5" style={{ color: colors.icon }} />
                <span>
                  {property.location.address}, {property.location.city}
                </span>
              </div>
            </div>

            {/* SPEC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Price */}
              <OptimizedEditableElement
                isEditMode={isEditMode}
                elementId="priceCard"
                elementName="Price Card"
                hoverColor={colors.priceCard}
                onEditClick={handleEditClick}
              >
                <div
                  className="rounded-xl p-6 border-2 shadow-md"
                  style={{
                    backgroundColor: `${colors.priceCard}15`,
                    borderColor: palettes.priceCard.light,
                  }}
                >
                  <p className="text-slate-600 text-sm">Price</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: colors.priceCard }}
                  >
                    ₹ {formatPrice(property.price)}
                  </p>
                </div>
              </OptimizedEditableElement>

              {/* Bedrooms */}
              <div className="rounded-xl p-6 border border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" style={{ color: colors.icon }} />
                  <p className="font-medium">Bedrooms</p>
                </div>
                <p className="text-xl font-bold mt-2">
                  {property.bedrooms} Bedrooms
                </p>
              </div>

              {/* Bathrooms */}
              <div className="rounded-xl p-6 border border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" style={{ color: colors.icon }} />
                  <p className="font-medium">Bathrooms</p>
                </div>
                <p className="text-xl font-bold mt-2">
                  {property.bathrooms} Bathrooms
                </p>
              </div>
            </div>

            {/* Furnishing + Verification + Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Furnishing */}
              <div className="rounded-xl p-6 border border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <DoorOpen
                    className="w-5 h-5"
                    style={{ color: colors.icon }}
                  />
                  <p className="font-medium">Furnishing</p>
                </div>
                <p className="text-xl font-semibold mt-2">
                  {property.furnishing}
                </p>
              </div>

              {/* Owner */}
              <div className="rounded-xl p-6 border border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: colors.icon }} />
                  <p className="font-medium">Owner</p>
                </div>
                <p className="text-lg font-semibold mt-2">
                  {property.ownerDetails?.ownerName}
                </p>
                <p className="text-sm text-slate-600">
                  {property.ownerDetails?.ownerContact}
                </p>
              </div>

              {/* Verification */}
              <div className="rounded-xl p-6 border border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <ShieldCheck
                      className="w-5 h-5 text-green-600"
                      style={{ color: colors.icon }}
                    />
                  ) : (
                    <ShieldAlert
                      className="w-5 h-5 text-red-600"
                      style={{ color: colors.icon }}
                    />
                  )}

                  <p className="font-medium">Verification</p>
                </div>

                <p
                  className={`mt-2 font-semibold ${
                    isVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>

            {/* AMENITIES */}
            <div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: colors.title }}
              >
                Amenities
              </h2>

              <OptimizedEditableElement
                isEditMode={isEditMode}
                elementId="amenity"
                elementName="Amenity Card"
                hoverColor={colors.amenity}
                onEditClick={handleEditClick}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities?.[0]
                    ?.replace(/\[|\]|"/g, "")
                    .split(",")
                    .map((am, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 rounded-xl text-center font-medium shadow-sm"
                        style={{
                          backgroundColor: `${colors.amenity}20`,
                          color: colors.amenity,
                          border: `2px solid ${colors.amenity}40`,
                        }}
                      >
                        {am}
                      </div>
                    ))}
                </div>
              </OptimizedEditableElement>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <OptimizedEditableElement
                isEditMode={isEditMode}
                elementId="button"
                elementName="Primary Button"
                hoverColor={colors.button}
                onEditClick={handleEditClick}
              >
                <button
                  className="flex-1 py-4 rounded-xl shadow-lg font-semibold"
                  style={{
                    backgroundColor: colors.button,
                    color: getContrastTextColor(colors.button),
                  }}
                >
                  Schedule Visit
                </button>
              </OptimizedEditableElement>

              <button
                className="flex-1 py-4 rounded-xl border-2 font-semibold bg-white"
                style={{
                  borderColor: colors.button,
                  color: colors.button,
                }}
              >
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
