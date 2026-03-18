//frontend/admin-dashboard/src/pages/TopProjectDetails.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  MapPin,
  Bed,
  Save,
  Edit2,
  X as XIcon,
  RefreshCw,
  Home,
} from "lucide-react";

import {  topProject } from "../../services/PaymentServices";
import { formatPrice } from "../../utils/formatters";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import FloatingColorPicker from "../../components/ThemeEditor/FloatingColorPicker";
import OptimizedEditableElement from "../../components/ThemeEditor/OptimizedEditableElement";

import {
  generateColorPalette,
  getContrastTextColor,
} from "../../utils/colorUtils";

export default function TopProjectDetails() {
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

  // Fetch Owner Properties
  const { data, isLoading } = useQuery({
    queryKey: ["topProject"],
    queryFn: topProject,
  });

  const property = data?.items?.find((p) => p._id === id);

  // Generate palettes
  const palettes = useMemo(() => {
    const output = {};
    Object.entries(colors).forEach(([key, color]) => {
      output[key] = generateColorPalette(color);
    });
    return output;
  }, [colors]);

  // Load saved color theme from DB
  useEffect(() => {
    if (property?.color) {
      setColors((prev) => ({
        ...prev,
        primary: property.color,
        title: property.color,
      }));
    }
  }, [property]);

  // Save theme
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

  // Handle color edit click
  const handleEditClick = useCallback(
    (info) => {
      setActiveEditor({
        type: info.elementId,
        name: info.elementName,
        color: colors[info.elementId],
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
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (!property)
    return (
      <div className="text-center py-20">
        <Home className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Property Not Found</h2>
        <button
          onClick={() => navigate("/owner-properties")}
          className="text-blue-600 underline mt-3"
        >
          Go Back
        </button>
      </div>
    );

  const image =
    property.heroImage ||
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4";

  const priceFrom = property.priceFrom || null;
  const priceTo = property.priceTo || null;

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
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg z-50">
          <div className="flex items-center gap-3">
            <Edit2 className="w-5 h-5" />
            <p className="font-bold">Theme Editor Active</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/20 rounded-md"
            >
              <RefreshCw className="w-4 h-4 inline-block mr-1" />
              Reset
            </button>

            <button
              onClick={() => saveTheme.mutate(colors)}
              className="px-4 py-2 bg-white text-blue-700 rounded-md"
            >
              <Save className="w-4 h-4 inline-block mr-1" />
              Save
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              className="px-4 py-2 bg-white/20 rounded-md"
            >
              <XIcon className="w-4 h-4 inline-block mr-1" />
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`space-y-8 ${isEditMode ? "mt-20" : ""}`}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        {/* Property Container */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-72 sm:h-96 overflow-hidden">
            <img src={image} className="w-full h-full object-cover" />

            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}40, transparent)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-10">
            {/* Title */}
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

            {/* Location */}
            <div className="flex items-center gap-2 text-slate-600 mt-2">
              <MapPin className="w-5 h-5" style={{ color: colors.icon }} />
              <span>
                {property.address}, {property.city}
              </span>
            </div>

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
                <p className="text-sm text-slate-600">Price Range</p>
                <p
                  className="text-2xl font-bold mt-2"
                  style={{ color: colors.priceCard }}
                >
                  {priceFrom && priceTo
                    ? `₹${formatPrice(priceFrom)} - ₹${formatPrice(priceTo)}`
                    : "Price Not Available"}
                </p>
              </div>
            </OptimizedEditableElement>

            {/* BHK Details */}
            <div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: colors.title }}
              >
                BHK Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.bhkSummary?.map((bhk, index) => (
                  <div
                    key={index}
                    className="p-5 border rounded-xl bg-slate-50 shadow-sm"
                  >
                    <p className="text-lg font-semibold text-slate-800">
                      {bhk.bhkLabel}
                    </p>
                    {bhk.units?.length > 0 && (
                      <p className="text-sm text-slate-600 mt-2">
                        {bhk.units.length} unit options available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: colors.title }}
              >
                Amenities
              </h2>

              {property.amenities?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities.map((a, idx) => (
                    <div
                      key={idx}
                      className="p-3 text-center rounded-xl shadow-sm border"
                      style={{
                        borderColor: `${colors.amenity}40`,
                        backgroundColor: `${colors.amenity}10`,
                        color: colors.amenity,
                      }}
                    >
                      {a.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No amenities listed.</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <OptimizedEditableElement
                isEditMode={isEditMode}
                elementId="button"
                elementName="Button"
                hoverColor={colors.button}
                onEditClick={handleEditClick}
              >
                <button
                  className="flex-1 p-4 rounded-xl shadow font-semibold"
                  style={{
                    backgroundColor: colors.button,
                    color: getContrastTextColor(colors.button),
                  }}
                >
                  Schedule Visit
                </button>
              </OptimizedEditableElement>

              <button
                className="flex-1 p-4 rounded-xl border-2 font-semibold"
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
