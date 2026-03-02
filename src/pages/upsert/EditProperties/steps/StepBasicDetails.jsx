// frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/steps/StepBasicDetails.jsx
import React from "react";
import InputBox from "../components/editable/InputBox";

import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  FURNISHING_TYPES,
  AVAILABILITY_TYPES,
  TRANSACTION_TYPES,
  FACING_TYPES,
  PROPERTY_AGE_TYPES,
} from "../components/editable/residentialEnums";

export default function StepBasicDetails({ data, onChange, onSave }) {
  // If data hasn't loaded yet, show nothing
  if (!data) return null;

  /**
   * ✅ Helper to handle field updates
   * Passes the field name, value, and the step name ('basic') back to EditWizard
   */
  const handleUpdate = (field, value) => {
    onChange(field, value, "basic");
  };

  return (
    <div className="px-8 py-6 space-y-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
          🏠
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Basic Details</h2>
          <p className="text-gray-500 text-sm">
            Update property type, specifications, and pricing
          </p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
          Step 1 of 4
        </div>
      </div>

      {/* 1. Listing Type */}
      <Section title="Listing Type" required>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {LISTING_TYPES.map((item) => (
            <SelectCard
              key={item.value}
              active={data.listingType === item.value}
              icon={item.icon}
              title={item.label}
              onClick={() => handleUpdate("listingType", item.value)}
            />
          ))}
        </div>
      </Section>

      {/* 2. Property Type */}
      <Section title="Property Type">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {PROPERTY_TYPES.map((item) => (
            <IconCard
              key={item.value}
              active={data.propertyType === item.value}
              icon={item.icon}
              label={item.label}
              onClick={() => handleUpdate("propertyType", item.value)}
            />
          ))}
        </div>
      </Section>

      {/* 3. Core Specifications (Counters) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 bg-gray-50 rounded-2xl px-6 border border-dashed border-gray-200">
        <Counter
          icon="🛏️"
          label="Bedrooms"
          value={data.bedrooms || 0}
          onChange={(v) => handleUpdate("bedrooms", v)}
        />
        <Counter
          icon="🚿"
          label="Bathrooms"
          value={data.bathrooms || 0}
          onChange={(v) => handleUpdate("bathrooms", v)}
        />
        <Counter
          icon="🏖️"
          label="Balconies"
          value={data.balconies || 0}
          onChange={(v) => handleUpdate("balconies", v)}
        />
      </div>

      {/* 4. Furnishing & Construction Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section title="Furnishing Status">
          <div className="grid grid-cols-3 gap-3">
            {FURNISHING_TYPES.map((item) => (
              <SelectCard
                key={item.value}
                active={data.furnishing === item.value}
                icon={item.icon}
                title={item.label}
                onClick={() => handleUpdate("furnishing", item.value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Construction Status">
          <div className="grid grid-cols-2 gap-3">
            {AVAILABILITY_TYPES.map((item) => (
              <StatusCard
                key={item.value}
                active={data.constructionStatus === item.value}
                icon={item.icon}
                title={item.label}
                onClick={() => handleUpdate("constructionStatus", item.value)}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* 5. Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Section title="Property Age">
          <Dropdown
            value={data.propertyAge}
            options={PROPERTY_AGE_TYPES}
            onChange={(v) => handleUpdate("propertyAge", v)}
            placeholder="Select age"
          />
        </Section>
        <Section title="Transaction Type">
          <Dropdown
            value={data.transactionType}
            options={TRANSACTION_TYPES}
            onChange={(v) => handleUpdate("transactionType", v)}
            placeholder="Select type"
          />
        </Section>
        <Section title="Facing Type">
          <Dropdown
            value={data.facing}
            options={FACING_TYPES}
            onChange={(v) => handleUpdate("facing", v)}
            placeholder="Select direction"
          />
        </Section>
      </div>

      {/* 6. Pricing & Area Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold text-sm uppercase">
            <span>₹ Pricing Details</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputBox label="Total Price">
              <input
                type="number"
                value={data.price || ""}
                onChange={(e) => handleUpdate("price", e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </InputBox>
            <InputBox label="Price / sq ft">
              <input
                type="number"
                value={data.pricePerSqft || ""}
                onChange={(e) => handleUpdate("pricePerSqft", e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </InputBox>
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase">
            <span>📐 Area Details</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputBox label="Carpet Area">
              <input
                type="number"
                value={data.carpetArea || ""}
                onChange={(e) => handleUpdate("carpetArea", e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </InputBox>
            <InputBox label="Built-up Area">
              <input
                type="number"
                value={data.builtUpArea || ""}
                onChange={(e) => handleUpdate("builtUpArea", e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </InputBox>
          </div>
        </div>
      </div>

      {/* Save Button for Manual Sync */}
      <div className="pt-6 border-t flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-[#27AE60] hover:bg-[#219150] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-100 transition-all transform active:scale-95"
        >
          <span>💾</span>
          Save Basic Details
        </button>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---

function Section({ title, required, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">
          {title}
        </h3>
        {required && (
          <span className="text-[10px] text-red-500 font-bold border border-red-100 px-2 py-0.5 rounded bg-red-50">
            REQUIRED
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SelectCard({ active, icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
        active
          ? "border-[#27AE60] bg-green-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="text-xl">{icon}</div>
      <div
        className={`text-xs font-semibold ${active ? "text-[#27AE60]" : "text-gray-600"}`}
      >
        {title}
      </div>
    </button>
  );
}

function StatusCard({ active, icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all w-full ${
        active
          ? "border-[#27AE60] bg-green-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="text-xl">{icon}</div>
      <div
        className={`text-sm font-semibold ${active ? "text-[#27AE60]" : "text-gray-700"}`}
      >
        {title}
      </div>
    </button>
  );
}

function IconCard({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
        active
          ? "border-[#27AE60] bg-green-50"
          : "border-gray-50 bg-white hover:border-gray-200"
      }`}
    >
      <div className="text-lg">{icon}</div>
      <p
        className={`text-[10px] font-medium truncate w-full text-center ${active ? "text-[#27AE60]" : "text-gray-500"}`}
      >
        {label}
      </p>
    </button>
  );
}

function Counter({ icon, label, value, onChange }) {
  return (
    <div className="flex items-center justify-between md:flex-col md:items-start md:gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="flex h-10 w-32 items-center bg-white rounded-lg border border-[#27AE60] overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-full flex items-center justify-center text-xl text-gray-400 hover:bg-gray-50"
        >
          −
        </button>
        <div className="flex-1 text-center text-sm font-bold text-gray-900">
          {value}
        </div>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-full flex items-center justify-center text-xl text-gray-400 hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Dropdown({ value, options, onChange, placeholder }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-left text-sm flex items-center justify-between hover:border-[#27AE60] transition-all"
      >
        <div className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-lg">{selected.icon}</span>
              <span className="text-gray-900 font-medium">
                {selected.label}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left flex items-center gap-3 hover:bg-green-50 transition-colors ${value === option.value ? "bg-green-50 border-r-4 border-[#27AE60]" : ""}`}
              >
                <span className="text-lg">{option.icon}</span>
                <span
                  className={`text-sm ${value === option.value ? "font-bold text-[#27AE60]" : "text-gray-700"}`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
