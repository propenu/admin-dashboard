import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Pencil,
  CheckCircle,
  MapPin,
  Home,
  Info,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  FileText,
  Layers,
} from "lucide-react";
import {
  editResidential,
  fetchResidentialById,
} from "../../services/ResidentialServices/ResidentialServices";

const AdminPropertyEditor = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        const data = await fetchResidentialById(id);
        setProperty(data); // This data will flow into the value props
        setLoading(false);
      } catch (error) {
        console.error("Error loading property:", error);
        setLoading(false);
      }
    };
    loadPropertyData();
  }, [id]);

  const handleUpdate = async (fieldName, value) => {
    if (property[fieldName] === value) return;

    setSavingField(fieldName);
    try {
      const updatedData = { ...property, [fieldName]: value };
      await editResidential(id, updatedData);
      setProperty(updatedData); // Refresh local state to keep inputs synced
      setSavedSuccess(fieldName);
      setTimeout(() => setSavedSuccess(null), 2000);
    } catch (error) {
      alert("Failed to save changes.");
    } finally {
      setSavingField(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader2 className="animate-spin text-emerald-500 mb-2" size={40} />
        <p className="text-gray-500 font-medium">
          Fetching Property Details...
        </p>
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* STEP HEADER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              {currentStep === 1 && <Home size={24} />}
              {currentStep === 2 && <MapPin size={24} />}
              {currentStep === 3 && <Layers size={24} />}
              {currentStep === 4 && <CheckCircle size={24} />}
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              {currentStep === 1 && "Basic Details"}
              {currentStep === 2 && "Location Details"}
              {currentStep === 3 && "Property Specifics"}
              {currentStep === 4 && "Verify & Publish"}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              Ref ID
            </span>
            <code className="text-xs text-emerald-600 font-mono">{id}</code>
          </div>
        </div>

        {/* STEP CONTENT */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField
                label="Listing Type"
                value={property.listingType}
                onSave={(v) => handleUpdate("listingType", v)}
                isSaving={savingField === "listingType"}
                isSuccess={savedSuccess === "listingType"}
              />
              <EditableField
                label="Property Sub-Type"
                value={property.propertySubType}
                onSave={(v) => handleUpdate("propertySubType", v)}
                isSaving={savingField === "propertySubType"}
                isSuccess={savedSuccess === "propertySubType"}
              />
              <EditableField
                label="Price (₹)"
                value={property.totalPrice}
                onSave={(v) => handleUpdate("totalPrice", v)}
                isSaving={savingField === "totalPrice"}
                isSuccess={savedSuccess === "totalPrice"}
              />
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Carpet Area"
                  value={property.carpetArea}
                  onSave={(v) => handleUpdate("carpetArea", v)}
                  isSaving={savingField === "carpetArea"}
                  isSuccess={savedSuccess === "carpetArea"}
                />
                <EditableField
                  label="Built-up Area"
                  value={property.builtUpArea}
                  onSave={(v) => handleUpdate("builtUpArea", v)}
                  isSaving={savingField === "builtUpArea"}
                  isSuccess={savedSuccess === "builtUpArea"}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <EditableField
                label="Property Line"
                type="textarea"
                value={property.propertyLine}
                onSave={(v) => handleUpdate("propertyLine", v)}
                isSaving={savingField === "propertyLine"}
                isSuccess={savedSuccess === "propertyLine"}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                  label="Building / Society Name"
                  value={property.buildingName}
                  onSave={(v) => handleUpdate("buildingName", v)}
                  isSaving={savingField === "buildingName"}
                  isSuccess={savedSuccess === "buildingName"}
                />
                <EditableField
                  label="Pincode"
                  value={property.pincode}
                  onSave={(v) => handleUpdate("pincode", v)}
                  isSaving={savingField === "pincode"}
                  isSuccess={savedSuccess === "pincode"}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <EditableField
                  label="Locality"
                  value={property.locality}
                  onSave={(v) => handleUpdate("locality", v)}
                  isSaving={savingField === "locality"}
                  isSuccess={savedSuccess === "locality"}
                />
                <EditableField
                  label="City"
                  value={property.city}
                  onSave={(v) => handleUpdate("city", v)}
                  isSaving={savingField === "city"}
                  isSuccess={savedSuccess === "city"}
                />
                <EditableField
                  label="State"
                  value={property.state}
                  onSave={(v) => handleUpdate("state", v)}
                  isSaving={savingField === "state"}
                  isSuccess={savedSuccess === "state"}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EditableField
                  label="Bedrooms"
                  value={property.bedrooms}
                  onSave={(v) => handleUpdate("bedrooms", v)}
                  isSaving={savingField === "bedrooms"}
                  isSuccess={savedSuccess === "bedrooms"}
                />
                <EditableField
                  label="Bathrooms"
                  value={property.bathrooms}
                  onSave={(v) => handleUpdate("bathrooms", v)}
                  isSaving={savingField === "bathrooms"}
                  isSuccess={savedSuccess === "bathrooms"}
                />
                <EditableField
                  label="Balconies"
                  value={property.balconies}
                  onSave={(v) => handleUpdate("balconies", v)}
                  isSaving={savingField === "balconies"}
                  isSuccess={savedSuccess === "balconies"}
                />
              </div>
              <EditableField
                label="Property Description"
                type="textarea"
                value={property.description}
                onSave={(v) => handleUpdate("description", v)}
                isSaving={savingField === "description"}
                isSuccess={savedSuccess === "description"}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center max-w-sm">
                <FileText className="text-indigo-600 mx-auto mb-4" size={40} />
                <h3 className="font-bold text-slate-800">
                  Verification Pending
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Review document uploads and legal compliance before finalizing
                  the property listing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-2 flex items-center gap-2 font-bold text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={20} /> Back
          </button>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Step {currentStep} of 4
          </span>

          <button
            onClick={() =>
              currentStep < 4
                ? setCurrentStep(currentStep + 1)
                : alert("Submitted!")
            }
            className="px-8 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
          >
            {currentStep === 4 ? "Submit Property" : "Continue"}{" "}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- EDITABLE FIELD COMPONENT --- */

const EditableField = ({
  label,
  value,
  onSave,
  isSaving,
  isSuccess,
  type = "text",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState("");

  // CRITICAL: Sync local input state whenever the 'value' prop from API changes
  useEffect(() => {
    setVal(value || "");
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    onSave(val);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">
        {label}
      </label>
      <div
        className={`group relative flex items-center min-h-[52px] px-4 rounded-xl border-2 transition-all duration-200 ${isEditing ? "border-emerald-500 bg-white ring-4 ring-emerald-50" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"}`}
      >
        {isEditing ? (
          type === "textarea" ? (
            <textarea
              autoFocus
              className="w-full bg-transparent py-3 outline-none text-sm text-slate-700 leading-relaxed"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={handleBlur}
              rows={3}
            />
          ) : (
            <input
              autoFocus
              className="w-full bg-transparent outline-none text-sm text-slate-700 font-semibold"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleBlur()}
            />
          )
        ) : (
          <div
            className="flex justify-between items-center w-full cursor-text py-2"
            onClick={() => setIsEditing(true)}
          >
            <span
              className={`text-sm ${!value ? "text-slate-300 italic" : "text-slate-700 font-semibold"}`}
            >
              {value || `Enter ${label}`}
            </span>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <Loader2 size={14} className="animate-spin text-emerald-500" />
              ) : isSuccess ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Pencil
                  size={12}
                  className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyEditor;
