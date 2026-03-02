// locations/components/LocationDetailCard.jsx
import { Edit2, Trash2, X, Navigation, Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function LocationDetailCard({
  data,
  onClose,
  onEditCity,
  onEditLocality,
  onDeleteCity,
  onDeleteLocality,
}) {
  const hasLocalities = data.localities && data.localities.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border-2 border-green-200 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{data.city}</h2>
              <p className="text-green-100 text-sm font-medium">{data.state}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-bold rounded-full uppercase">
                {data.category}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-6 space-y-6">
        {/* CITY ACTIONS */}
        <div className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl p-4 border-2 border-gray-100">
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-green-600" />
            City Actions
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => onEditCity(data)}
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Edit2 size={18} />
              Edit City
            </button>
            <button
              onClick={onDeleteCity}
              className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Trash2 size={18} />
              Delete City
            </button>
          </div>
        </div>

        {/* LOCALITIES SECTION */}
        {hasLocalities && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2">
              <MapPin size={16} className="text-green-600" />
              Localities ({data.localities.length})
            </h3>
            
            <div className="space-y-3">
              {data.localities.map((locality, idx) => {
                const coordinates = locality.location?.coordinates || [];
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-100 hover:border-green-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-1">
                          {locality.name}
                        </h4>
                        <div className="flex gap-3 text-xs">
                          <div className="bg-green-100 px-3 py-1 rounded-full">
                            <span className="text-gray-600">Long:</span>
                            <span className="font-mono font-bold text-green-700 ml-1">
                              {coordinates[0]?.toFixed(6) ?? "0"}
                            </span>
                          </div>
                          <div className="bg-green-100 px-3 py-1 rounded-full">
                            <span className="text-gray-600">Lat:</span>
                            <span className="font-mono font-bold text-green-700 ml-1">
                              {coordinates[1]?.toFixed(6) ?? "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LOCALITY ACTIONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditLocality(locality)}
                        className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteLocality(locality)}
                        className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {!hasLocalities && (
          <div className="text-center py-8 text-gray-400">
            <MapPin size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No localities added yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}