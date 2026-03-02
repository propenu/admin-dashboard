import { Eye, MoreVertical, MapPin } from "lucide-react";
import PropertyDetailsModal from "./PropertyDetailsModal";
import { useState } from "react";

const formatSlug = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const TableView = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gradient-to-r from-[#27AE60] to-[#229954] text-white uppercase tracking-wider">
              <tr>
                <th className="px-2 py-2">Property</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Location</th>
                <th className="px-2 py-2">Completion</th>
                <th className="px-2 py-2 text-nowrap">Created By</th>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`hover:bg-gradient-to-r hover:from-green-50/50 hover:to-transparent transition-all cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="pl-2 py-4 max-w-[100px]">
                    <div className="relative group">
                      <div className="text-nowrap text-[#000000] truncate cursor-default">
                        {formatSlug(item.slug)}
                      </div>
                      <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-[#27AE60] text-white text-[11px] px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        {formatSlug(item.slug)}
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 text-[10px] rounded-lg uppercase border border-yellow-200">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-2 py-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-[10px] rounded-lg uppercase border border-gray-200">
                      {item.propertyType || "N/A"}
                    </span>
                  </td>

                  <td className="px-2 py-2 text-gray-600 max-w-[180px]">
                    <div className="flex items-start gap-1.5">
                      <MapPin
                        size={12}
                        className="text-[#27AE60] mt-1 shrink-0"
                      />
                      <span className="truncate">
                        {item.locality
                          ? `${item.locality}, ${item.city}`
                          : "Not specified"}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-[#27AE60] min-w-[35px]">
                        {item.completion?.percent}%
                      </span>
                      <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-[#27AE60] to-[#229954] h-full transition-all duration-500"
                          style={{ width: `${item.completion?.percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-1 rounded">
                        Step {item.completion?.step}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="text-[#000000] capitalize">
                        {item.listingSource}
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2 text-gray-600 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex justify-center gap-3 text-gray-400">
                      <Eye
                        size={18}
                        className="cursor-pointer hover:text-[#27AE60] transition-colors"
                        title="View Details"
                      />
                      <MoreVertical
                        size={18}
                        className="cursor-pointer hover:text-blue-600 transition-colors"
                        title="More Options"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="block lg:hidden bg-white p-4 space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => setSelectedItem(item)}
            className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="font-semibold text-[#27AE60] truncate">
              {formatSlug(item.slug)}
            </div>

            <div className="flex gap-2 text-[10px]">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">
                {item.status}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                {item.propertyType || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={14} className="text-[#27AE60]" />
              {item.locality
                ? `${item.locality}, ${item.city}`
                : "Not specified"}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#27AE60] to-[#229954] h-full"
                  style={{ width: `${item.completion?.percent || 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {item.completion?.percent}%
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{item.listingSource}</span>
              <span>
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>

            <div className="flex justify-end gap-4 text-gray-400 pt-2">
              <Eye
                size={18}
                className="hover:text-[#27AE60] cursor-pointer"
                onClick={() => setSelectedItem(item)}
              />
              <MoreVertical size={18} className="hover:text-blue-600 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <PropertyDetailsModal
        open={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};

export default TableView;
