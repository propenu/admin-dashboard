import {
  LayoutGrid,
  MoreVertical,
  MapPin,
  Eye,
  MessageSquare,
  MousePointer2,
} from "lucide-react";
import {
  saSurface,
  saSurfaceHover,
} from "../../Dashboards/superAdminDashboard/dashboardSurface";

const GridView = ({ items }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
    {items.map((item) => (
      <div
        key={item._id}
        className={`overflow-hidden rounded-2xl ${saSurface} ${saSurfaceHover}`}
      >
        <div className="p-3">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="rounded-xl bg-[#e8f8ee] p-2">
                <LayoutGrid size={16} className="text-[#27AE60]" />
              </div>
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#0f3d2e]">
                {item.title}
              </h3>
            </div>
            <MoreVertical
              size={16}
              className="cursor-pointer text-[#5c7d6d] hover:text-[#27AE60]"
            />
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-[#f3e0a8] bg-[#fff8e1] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#8a6d12]">
              {item.status}
            </span>

            <span className="rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#27AE60]">
              {item.listingType}
            </span>

            {item.propertyType && (
              <span className="rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#0f3d2e]">
                {item.propertyType}
              </span>
            )}
          </div>

          <div className="mb-3">
            <div className="mb-1 flex justify-between text-[11px] text-[#5c7d6d]">
              <span>Progress</span>
              <span className="font-bold text-[#27AE60]">
                {item.completion?.percent}%
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6f4eb]">
              <div
                className="h-1.5 rounded-full bg-[#27AE60] transition-all duration-500"
                style={{ width: `${item.completion?.percent}%` }}
              />
            </div>

            <div className="mt-1 flex justify-between text-[10px] text-[#5c7d6d]">
              <span>Step {item.completion?.step}</span>
              <span className="capitalize">{item.completion?.lastSection}</span>
            </div>
          </div>

          {item.locality && (
            <div className="mb-2 flex items-start gap-2 rounded-xl border border-[#b7e4c7] bg-[#f7fbf8] p-2 text-[11px] text-[#5c7d6d]">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#27AE60]" />
              <span className="leading-snug">
                {item.locality}, {item.city}
                <br />
                {item.state} - {item.pincode}
              </span>
            </div>
          )}

          {item.carpetArea && (
            <div className="mb-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl border border-[#b7e4c7] bg-[#f7fbf8] p-2">
                <p className="mb-0.5 text-[9px] uppercase text-[#5c7d6d]">
                  Carpet
                </p>
                <p className="text-[#0f3d2e]">
                  {item.carpetArea}{" "}
                  <span className="text-[10px] text-[#5c7d6d]">sq.ft</span>
                </p>
              </div>

              <div className="rounded-xl border border-[#b7e4c7] bg-[#f7fbf8] p-2">
                <p className="mb-0.5 text-[9px] uppercase text-[#5c7d6d]">
                  Built-up
                </p>
                <p className="text-[#0f3d2e]">
                  {item.builtUpArea}{" "}
                  <span className="text-[10px] text-[#5c7d6d]">sq.ft</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#e6f4eb] bg-[#f7fbf8] px-3 py-2 text-[11px] text-[#5c7d6d]">
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <Eye size={12} /> {item.meta?.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {item.meta?.inquiries || 0}
            </span>
            <span className="flex items-center gap-1">
              <MousePointer2 size={12} /> {item.meta?.clicks || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#e6f4eb] bg-white px-3 py-2 text-[10px] text-[#5c7d6d]">
          <span className="flex items-center gap-1.5 capitalize text-[#0f3d2e]">
            {item.listingSource || "unknown agent"}
          </span>
          <span>{new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
        </div>
      </div>
    ))}
  </div>
);

export default GridView;
