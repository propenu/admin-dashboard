// // frontend/admin-dashboard/src/pages/Locations/components/LocationStats.jsx
// import { MapPin, Star, Pencil, Flame } from "lucide-react";

// import { motion } from "framer-motion";

// export default function LocationStats({
//   total,
//   popularCities = [],
//   onEditPopularCity,
//   onSelectPopularCity,
// }) {
//   return (
//     <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border mb-8 space-y-4">
//       {/* TOTAL */}
//       <div className="flex items-center gap-4">
//         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//           <MapPin className="text-green-600 w-6 h-6" />
//         </div>
//         <div>
//           <p className="text-sm text-gray-500 font-medium">Total Locations</p>
//           <h3 className="text-2xl font-bold">{total}</h3>
//         </div>
//       </div>

//       {/* POPULAR CITIES */}
//       {popularCities.length > 0 && (
//         <div>
//           <div className="flex items-center gap-2 mb-2">
//             <Star className="w-4 text-yellow-500" />
//             <p className="text-sm font-semibold text-gray-700">
//               Popular Cities
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {popularCities.map((c, idx) => (
//               <span
//                 key={idx}
//                 className="text-xs bg-gray-100 px-3 py-1 rounded-full border"
//               >
//                 {c.city}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// } 



// frontend/admin-dashboard/src/pages/Locations/components/LocationStats.jsx

import {
  MapPin,
  Star,
  Pencil,
  Flame,
} from "lucide-react";

import { motion } from "framer-motion";

export default function LocationStats({
  total,
  popularCities = [],

  // NEW
  onEditPopularCity,
  onSelectPopularCity,
}) {
  return (
    <div className="bg-white px-6 py-5 rounded-3xl shadow-sm border mb-8 space-y-6">
      {/* TOTAL */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
          <MapPin className="text-green-600 w-7 h-7" />
        </div>

        <div>
          <p className="text-sm text-gray-500 font-medium">
            Total Locations
          </p>

          <h3 className="text-3xl font-bold text-gray-800">
            {total}
          </h3>
        </div>
      </div>

      {/* POPULAR CITIES */}
      {popularCities.length > 0 && (
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />

            <p className="text-base font-bold text-gray-800">
              Popular Cities
            </p>
          </div>

          {/* CITY CARDS */}
          <div className="flex flex-wrap gap-3">
            {popularCities.map((c, idx) => (
              <motion.div
                key={idx}

                layout

                whileHover={{
                  scale: 1.05,
                  y: -4,
                }}

                whileTap={{
                  scale: 0.97,
                }}

                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}

                className="
                  group
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2
                  rounded-2xl
                  border
                  bg-gradient-to-br
                  from-white
                  to-gray-50
                  shadow-sm
                  hover:shadow-lg
                  border-gray-200
                  cursor-pointer
                  transition-all
                "
              >
                {/* LEFT */}
                <div
                  onClick={() => onSelectPopularCity?.(c)}
                  className="flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-[#27AE60] fill-[#27AE60]" />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {c.city}
                    </p>

                    <p className="text-xs text-gray-500">
                      {c.state}
                    </p>
                  </div>
                </div>

                {/* COUNT */}
                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {c.count}
                </div>

                {/* EDIT */}
                <button
                  onClick={() => onEditPopularCity?.(c)}
                  className="
                    opacity-0
                    group-hover:opacity-100
                    transition-all
                    p-2
                    rounded-xl
                    bg-blue-50
                    hover:bg-[#27AE60]
                  text-[#FFFFFF]
                  "
                >
                  <Pencil size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
