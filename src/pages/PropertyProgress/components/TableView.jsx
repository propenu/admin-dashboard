import { Eye, MoreVertical, MapPin } from "lucide-react";
import PropertyDetailsModal from "./PropertyDetailsModal";
import { useState } from "react";
import {
  saSurface,
  saSurfaceHover,
} from "../../Dashboards/superAdminDashboard/dashboardSurface";

const formatSlug = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const TableView = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className={`hidden overflow-hidden rounded-2xl lg:block ${saSurface}`}>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-[13px]">
            <thead className="bg-[#27AE60] text-[11px] font-semibold uppercase tracking-wide text-white">
              <tr>
                <th className="px-3 py-2.5">Property</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Completion</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Created By</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e6f4eb]">
              {items.map((item, index) => (
                <tr
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer transition hover:bg-[#f7fbf8] ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f7fbf8]/70"
                  }`}
                >
                  <td className="max-w-[100px] py-3.5 pl-3">
                    <div className="group relative">
                      <div className="cursor-default truncate whitespace-nowrap font-semibold text-[#0f3d2e]">
                        {formatSlug(item.slug)}
                      </div>
                      <div className="absolute left-0 top-full z-20 mt-1 hidden whitespace-nowrap rounded-full bg-[#27AE60] px-3 py-1.5 text-[11px] text-white shadow-lg group-hover:block">
                        {formatSlug(item.slug)}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <span className="rounded-full border border-[#f3e0a8] bg-[#fff8e1] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#8a6d12]">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <span className="rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#0f3d2e]">
                      {item.propertyType || "N/A"}
                    </span>
                  </td>

                  <td className="max-w-[180px] px-3 py-2 text-[#5c7d6d]">
                    <div className="flex items-start gap-1.5">
                      <MapPin
                        size={12}
                        className="mt-1 shrink-0 text-[#27AE60]"
                      />
                      <span className="truncate">
                        {item.locality
                          ? `${item.locality}, ${item.city}`
                          : "Not specified"}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="min-w-[35px] text-base font-bold text-[#27AE60]">
                        {item.completion?.percent}%
                      </span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e6f4eb]">
                        <div
                          className="h-full bg-[#27AE60] transition-all duration-500"
                          style={{ width: `${item.completion?.percent}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-2 py-0.5 text-[10px] font-semibold text-[#5c7d6d]">
                        Step {item.completion?.step}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <div className="capitalize text-[#0f3d2e]">
                      {item.listingSource}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-2 text-[#5c7d6d]">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-3 text-[#5c7d6d]">
                      <Eye
                        size={18}
                        className="cursor-pointer transition-colors hover:text-[#27AE60]"
                        title="View Details"
                      />
                      <MoreVertical
                        size={18}
                        className="cursor-pointer transition-colors hover:text-[#27AE60]"
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
      <div className="block space-y-3 lg:hidden">
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => setSelectedItem(item)}
            className={`space-y-3 rounded-2xl p-4 ${saSurface} ${saSurfaceHover}`}
          >
            <div className="truncate font-semibold text-[#0f3d2e]">
              {formatSlug(item.slug)}
            </div>

            <div className="flex gap-2 text-[10px]">
              <span className="rounded-full border border-[#f3e0a8] bg-[#fff8e1] px-2.5 py-1 font-semibold uppercase text-[#8a6d12]">
                {item.status}
              </span>
              <span className="rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-2.5 py-1 font-semibold uppercase text-[#0f3d2e]">
                {item.propertyType || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-[#5c7d6d]">
              <MapPin size={14} className="text-[#27AE60]" />
              {item.locality
                ? `${item.locality}, ${item.city}`
                : "Not specified"}
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6f4eb]">
                <div
                  className="h-full bg-[#27AE60]"
                  style={{ width: `${item.completion?.percent || 0}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-xs font-bold text-[#27AE60]">
                {item.completion?.percent}%
              </span>
            </div>

            <div className="flex justify-between text-xs text-[#5c7d6d]">
              <span className="capitalize">{item.listingSource}</span>
              <span>
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>

            <div className="flex justify-end gap-4 pt-1 text-[#5c7d6d]">
              <Eye
                size={18}
                className="cursor-pointer hover:text-[#27AE60]"
                onClick={() => setSelectedItem(item)}
              />
              <MoreVertical size={18} className="cursor-pointer hover:text-[#27AE60]" />
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
