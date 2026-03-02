// locations/components/LocationAccordion.jsx
import { ChevronDown, MapPin, Pencil, Plus, Trash2, MapPinned } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationAccordion({
  data,
  openState,
  setOpenState,
  selectedLoc,
  onSelectCity,
  onEditCity,
  onDeleteCity,
  onAddLocality,
  onEditLocality,
  onDeleteLocality,
}) {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([state, cities]) => (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          {/* STATE HEADER */}
          <button
            onClick={() => setOpenState(openState === state ? null : state)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <MapPin className="text-green-600 w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-gray-800">{state}</span>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                {cities.length} {cities.length === 1 ? "city" : "cities"}
              </span>
            </div>

            <ChevronDown
              className={`transition-transform duration-300 text-gray-400 ${
                openState === state ? "rotate-180 text-green-600" : ""
              }`}
              size={24}
            />
          </button>

          {/* CITY LIST */}
          <AnimatePresence>
            {openState === state && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-gradient-to-br from-gray-50 to-green-50/20 overflow-hidden"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cities.map((city) => (
                    <motion.div
                      key={city._id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`rounded-2xl border-2 transition-all ${
                        selectedLoc?._id === city._id
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 shadow-xl scale-105"
                          : "bg-white hover:border-green-300 hover:shadow-lg border-gray-200"
                      }`}
                    >
                      {/* CITY HEADER */}
                      <div
                        className="p-4 cursor-pointer space-y-3"
                        onClick={() => onSelectCity(city)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <MapPinned
                              className={
                                selectedLoc?._id === city._id
                                  ? "text-white"
                                  : "text-green-600"
                              }
                              size={20}
                            />
                            <h3 className="font-bold text-lg">{city.city}</h3>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              selectedLoc?._id === city._id
                                ? "bg-white/20 text-white"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {city.localities?.length || 0}
                          </span>
                        </div>

                        {/* LOCALITIES LIST */}
                        {city.localities && city.localities.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {city.localities.map((loc, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2 rounded-lg ${
                                  selectedLoc?._id === city._id
                                    ? "bg-white/10"
                                    : "bg-gray-50"
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-sm font-medium flex-1 truncate">
                                  {loc.name}
                                </span>

                                {/* LOCALITY ACTIONS */}
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditLocality(city, loc);
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      selectedLoc?._id === city._id
                                        ? "bg-white/20 hover:bg-white/30 text-white"
                                        : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                                    }`}
                                    title="Edit Locality"
                                  >
                                    <Pencil size={14} />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteLocality(city, loc);
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      selectedLoc?._id === city._id
                                        ? "bg-white/20 hover:bg-white/30 text-white"
                                        : "bg-red-50 hover:bg-red-100 text-red-600"
                                    }`}
                                    title="Delete Locality"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CITY ACTIONS */}
                      <div
                        className={`flex gap-2 p-3 border-t ${
                          selectedLoc?._id === city._id
                            ? "border-white/20 bg-white/10"
                            : "border-gray-100 bg-gray-50"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onEditCity(city)}
                          className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                            selectedLoc?._id === city._id
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                          }`}
                          title="Edit City"
                        >
                          <Pencil size={16} className="inline mr-1" />
                          Edit
                        </button>

                        <button
                          onClick={() => onAddLocality(city)}
                          className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                            selectedLoc?._id === city._id
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-green-50 hover:bg-green-100 text-green-600"
                          }`}
                          title="Add Locality"
                        >
                          <Plus size={16} className="inline mr-1" />
                          Add
                        </button>

                        <button
                          onClick={() => onDeleteCity(city)}
                          className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                            selectedLoc?._id === city._id
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-red-50 hover:bg-red-100 text-red-600"
                          }`}
                          title="Delete City"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}