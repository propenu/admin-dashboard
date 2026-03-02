

// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step3PropertyDetails/InputComponents.jsx
import { useState, useCallback, useEffect } from "react";

/**
 * 🟢 UNIVERSAL TEXT INPUT
 * Supports all categories (Residential, Commercial, Land, Agricultural)
 * Supports nested objects via 'parentKey' prop.
 */
export const LocalTextInput = ({
  reduxKey,
  parentKey = null, 
  label,
  updateFieldValue,
  type = "text",
  placeholder,
  initialValue,
  isNumber = false,
  error,
  isTextArea = false,
}) => {
  const [localValue, setLocalValue] = useState(initialValue ?? "");

  // Sync local state if Redux state changes (crucial for category switching)
  useEffect(() => {
    setLocalValue(initialValue ?? "");
  }, [initialValue]);

  const commitChange = useCallback(() => {
    let value = localValue;
    
    // 1. Convert to number if required
    if (isNumber) {
      value = value === "" ? null : Number(value);
    }
    
    // 2. Prevent unnecessary Redux dispatches
    if (value === initialValue) return;

    // 3. 🟢 NESTED LOGIC: If parentKey exists, update as an object
    if (parentKey && updateFieldValue) {
      const parentObj = { ...initialValue }; // This logic usually handled by updateNestedField action
      updateFieldValue(parentKey, { [reduxKey]: value }, true); // Pass a flag for nested
    } else if (updateFieldValue) {
      updateFieldValue(reduxKey, value);
    }
  }, [updateFieldValue, reduxKey, parentKey, isNumber, initialValue, localValue]);

  const InputTag = isTextArea ? "textarea" : "input";

  return (
    <div className="w-full ">
      <div className="flex justify-between items-center mb-1 px-1">
        <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${error ? "text-red-500" : "text-gray-400"}`}>
          {label}
        </p>
        {isNumber && <span className="text-[8px] text-gray-300 font-bold uppercase">Numeric</span>}
      </div>
      
      <InputTag
        type={isTextArea ? undefined : type}
        className={`w-full px-4 py-2.5 border text-xs font-medium transition-all focus:outline-none 
          ${isTextArea ? "min-h-[120px] resize-none rounded-2xl" : "rounded-xl"}
          ${error 
            ? "border-red-400 bg-red-50/50 text-red-900 shadow-[0_0_0_2px_rgba(248,113,113,0.1)]" 
            : "border-gray-200 bg-white text-gray-800 focus:border-black focus:ring-4 focus:ring-gray-50"
          }`}
        placeholder={placeholder || `Enter ${label}...`}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={commitChange}
      />
      {error && <p className="text-[9px] text-red-500 ml-2 mt-1.5 font-bold italic tracking-tight ">⚠ {error}</p>}
    </div>
  );
};

/**
 * 🟢 UNIVERSAL TOGGLE BUTTON (For Booleans)
 * Great for 'readyToConstruct', 'isFeatured', 'fencing' etc.
 */
export const LocalToggleInput = ({ reduxKey, label, initialValue, updateFieldValue }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/30">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <button
        type="button"
        onClick={() => updateFieldValue(reduxKey, !initialValue)}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
          initialValue ? "bg-green-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            initialValue ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

/**
 * 🟢 SPECIFICATION ADDER
 */
export const SpecificationInput = ({ onAdd, error }) => {
  const [specification, setSpecification] = useState({ category: "", title: "", description: "" });

  const handleAdd = () => {
    if (specification.category.trim() && specification.title.trim()) {
      onAdd(specification);
      setSpecification({ category: "", title: "", description: "" });
    }
  };

  return (
    <div className={`p-4 border-2 border-dashed rounded-2xl transition-all ${error ? "border-red-200 bg-red-50/30" : "border-gray-100 bg-white hover:border-gray-200"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input 
            className="px-4 py-2.5 rounded-xl border text-xs border-gray-200 focus:border-black outline-none bg-gray-50/50"
            placeholder="Spec Category (e.g. Flooring)" 
            value={specification.category} 
            onChange={(e) => setSpecification({...specification, category: e.target.value})} 
        />
        <input 
            className="px-4 py-2.5 rounded-xl border text-xs border-gray-200 focus:border-black outline-none bg-gray-50/50"
            placeholder="Details (e.g. Italian Marble)" 
            value={specification.title} 
            onChange={(e) => setSpecification({...specification, title: e.target.value})} 
        />
      </div>
      <button 
        type="button" 
        onClick={handleAdd} 
        className="w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-100"
      >
        + Add Specification
      </button>
    </div>
  );
};