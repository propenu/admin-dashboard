import {
  LayoutGrid,
  MoreVertical,
  MapPin,
  Eye,
  MessageSquare,
  MousePointer2,
} from "lucide-react";


const GridView = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item) => (
      <div
        key={item._id}
        className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        {/* MAIN CONTENT */}
        <div className="p-3">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-[#27AE60]/10 rounded-lg">
                <LayoutGrid size={16} className="text-[#27AE60]" />
              </div>
              <h3 className="text-gray-800 text-[13px] leading-snug line-clamp-2">
                {item.title}
              </h3>
            </div>
            <MoreVertical
              size={16}
              className="text-gray-400 cursor-pointer hover:text-[#27AE60]"
            />
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] uppercase rounded">
              {item.status}
            </span>

            <span className="px-2 py-0.5 bg-[#27AE60]/10 text-[#27AE60] text-[9px] uppercase rounded">
              {item.listingType}
            </span>

            {item.propertyType && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] uppercase rounded">
                {item.propertyType}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] text-gray-600 mb-1">
              <span>Progress</span>
              <span className="text-[#27AE60]">
                {item.completion?.percent}%
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#27AE60] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${item.completion?.percent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>Step {item.completion?.step}</span>
              <span className="capitalize">{item.completion?.lastSection}</span>
            </div>
          </div>

          {/* Location */}
          {item.locality && (
            <div className="flex items-start gap-2 text-[11px] text-gray-600 mb-2 bg-gray-50 p-2 rounded-md">
              <MapPin size={14} className="text-[#27AE60] mt-0.5 shrink-0" />
              <span className="leading-snug">
                {item.locality}, {item.city}
                <br />
                {item.state} - {item.pincode}
              </span>
            </div>
          )}

          {/* Area */}
          {item.carpetArea && (
            <div className="grid grid-cols-2 gap-2 mb-2 text-[11px]">
              <div className="bg-gray-50 p-2 rounded-md">
                <p className="text-gray-500 uppercase text-[9px] mb-0.5">
                  Carpet
                </p>
                <p className="text-gray-800">
                  {item.carpetArea}{" "}
                  <span className="text-gray-500 text-[10px]">sq.ft</span>
                </p>
              </div>

              <div className="bg-gray-50 p-2 rounded-md">
                <p className="text-gray-500 uppercase text-[9px] mb-0.5">
                  Built-up
                </p>
                <p className="text-gray-800">
                  {item.builtUpArea}{" "}
                  <span className="text-gray-500 text-[10px]">sq.ft</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <div className="px-3 py-2 flex justify-between items-center text-[11px] text-gray-500 bg-gray-50">
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

        {/* AUTHOR */}
        <div className="px-3 py-2 flex justify-between items-center text-[10px] text-gray-600 bg-gray-50">
          <span className="flex items-center gap-1.5 capitalize">
            {item.listingSource || "unknown agent"}
          </span>
          <span>{new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
        </div>
      </div>
    ))}
  </div>
);

export default GridView;
