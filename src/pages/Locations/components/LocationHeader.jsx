// locations/components/LocationHeader.jsx
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function LocationHeader({ onAdd }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-bold leading-tight text-[#27AE60] sm:text-xl">
          Location Management
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Manage states, cities & localities
        </p>
      </div>

      <motion.button
        type="button"
        onClick={onAdd}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-[#27AE60] px-3.5 text-sm font-bold text-white shadow-sm active:bg-green-700 sm:w-auto sm:self-center"
      >
        <Plus className="h-4 w-4" />
        Add New Location
      </motion.button>
    </div>
  );
}
