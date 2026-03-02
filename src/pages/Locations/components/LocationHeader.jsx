// locations/components/LocationHeader.jsx
import { Plus } from "lucide-react";

export default function LocationHeader({ onAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#27AE60]">
          Location Management
        </h1>
        <p className="text-[#000000]">Manage states, cities & localities</p>
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[#27AE60] text-white rounded-xl font-bold  shadow"
      >
        <Plus className="w-5 h-5" />
        Add New Location
      </button>
    </div>
  );
}
