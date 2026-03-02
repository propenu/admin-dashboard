import { useEffect } from "react";
import {
  X,
  MapPin,
  IndianRupee,
  Layers,
  User,
  Calendar,
  CheckCircle,
} from "lucide-react";

const formatSlug = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const PropertyDetailsModal = ({ open, onClose, item }) => {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-xs sm:max-w-2xl lg:max-w-4xl rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-[#27AE60] to-[#229954] text-white">
          <h2 className="text-sm sm:text-base font-semibold truncate pr-2">
            {formatSlug(item.slug)}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 text-xs sm:text-sm max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <Section title="Basic Information">
            <Info label="Status" value={item.status} />
            <Info label="Listing Type" value={item.listingType} />
            <Info label="Property Type" value={item.propertyType} />
            <Info label="Transaction Type" value={item.transactionType} />
            <Info label="Construction Status" value={item.constructionStatus} />
            <Info label="Property Age" value={item.propertyAge} />
            <Info label="Furnishing" value={item.furnishing} />
            <Info label="Facing" value={item.facing} />
          </Section>

          {/* LOCATION */}
          <Section title="Location Details">
            <Info
              label="Address"
              value={item.address || "Not specified"}
              icon={<MapPin size={14} />}
            />
            <Info label="Locality" value={item.locality} />
            <Info label="City" value={item.city} />
            <Info label="State" value={item.state} />
            <Info label="Pincode" value={item.pincode} />
            {item.location?.coordinates && (
              <Info
                label="Coordinates"
                value={`${item.location.coordinates[1]}, ${item.location.coordinates[0]}`}
              />
            )}
          </Section>

          {/* AREA & STRUCTURE */}
          <Section title="Area & Structure">
            <Info
              label="Built-up Area"
              value={`${item.builtUpArea || "-"} sqft`}
            />
            <Info
              label="Carpet Area"
              value={`${item.carpetArea || "-"} sqft`}
            />
            <Info label="Bedrooms" value={item.bedrooms} />
            <Info label="Balconies" value={item.balconies} />
            <Info label="Floor Number" value={item.floorNumber} />
            <Info label="Total Floors" value={item.totalFloors} />
            <Info label="Flooring Type" value={item.flooringType} />
            <Info label="Kitchen Type" value={item.kitchenType} />
          </Section>

          {/* PRICING */}
          <Section title="Pricing">
            <Info
              label="Price"
              value={`₹ ${item.price?.toLocaleString("en-IN")}`}
              icon={<IndianRupee size={14} />}
            />
            <Info label="Price per Sqft" value={`₹ ${item.pricePerSqft}`} />
            <Info
              label="Negotiable"
              value={item.isPriceNegotiable ? "Yes" : "No"}
            />
            <Info label="Currency" value={item.currency} />
          </Section>

          {/* PARKING */}
          {item.parkingDetails && (
            <Section title="Parking">
              <Info
                label="Two Wheeler"
                value={item.parkingDetails.twoWheeler}
              />
              <Info
                label="Four Wheeler"
                value={item.parkingDetails.fourWheeler}
              />
              <Info label="Parking Type" value={item.parkingType} />
            </Section>
          )}

          {/* AMENITIES */}
          {item.amenities?.length > 0 && (
            <Section title="Amenities">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 col-span-full">
                {item.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/30 rounded-md text-xs font-medium"
                  >
                    {a.title}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* COMPLETION */}
          <Section title="Progress">
            <Info
              label="Completion"
              value={`${item.completion?.percent}%`}
              icon={<CheckCircle size={14} />}
            />
            <Info label="Current Step" value={item.completion?.step} />
            <Info label="Last Section" value={item.completion?.lastSection} />
          </Section>

          {/* META */}
          <Section title="Statistics">
            <Info label="Views" value={item.meta?.views} />
            <Info label="Clicks" value={item.meta?.clicks} />
            <Info label="Inquiries" value={item.meta?.inquiries} />
          </Section>

          {/* CREATED */}
          <Section title="Created Information">
            <Info
              label="Created By"
              value={item.createdBy?.name}
              icon={<User size={14} />}
            />
            <Info label="Email" value={item.createdBy?.email} />
            <Info
              label="Created At"
              value={new Date(item.createdAt).toLocaleString("en-GB")}
              icon={<Calendar size={14} />}
            />
            <Info
              label="Updated At"
              value={new Date(item.updatedAt).toLocaleString("en-GB")}
            />
            <Info label="Listing Source" value={item.listingSource} />
          </Section>

          {/* DESCRIPTION */}
          {item.description && (
            <Section title="Description">
              <p className="text-gray-700 leading-relaxed text-xs col-span-full">
                {item.description}
              </p>
            </Section>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg bg-[#27AE60] text-white hover:bg-[#229954] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xs sm:text-sm font-semibold text-[#27AE60] mb-2 flex items-center gap-1.5">
      <Layers size={14} /> {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
  </div>
);

const Info = ({ label, value, icon }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
    <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase mb-0.5">
      {label}
    </div>
    <div className="flex items-center gap-1.5 text-gray-800 font-medium text-xs">
      {icon && <span className="text-[#27AE60] flex-shrink-0">{icon}</span>}
      <span className="truncate">{value ?? "—"}</span>
    </div>
  </div>
);

export default PropertyDetailsModal;
