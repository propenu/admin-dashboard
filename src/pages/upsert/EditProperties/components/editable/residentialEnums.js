// frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/residentialEnums.jsx
export const LISTING_TYPES = [
  {
    value: "sale",
    label: "Sale",
    description: "List property for sale",
    icon: "🏠",
  },
  {
    value: "rent",
    label: "Rent / Lease",
    description: "List property for rent",
    icon: "🏢",
  },
];

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "independent-house", label: "Independent House", icon: "🏠" },
  { value: "villa", label: "Villa", icon: "🏠" },
  { value: "farmhouse", label: "Farmhouse", icon: "🏡" },
  { value: "penthouse", label: "Penthouse", icon: "🏢" },
  { value: "triplex", label: "Triplex", icon: "🏢" },
  { value: "duplex", label: "Duplex", icon: "🏢" },
  { value: "studio", label: "Studio", icon: "🏢" },
  { value: "independent-builder-floor", label: "Independent Builder Floor", icon: "🏢" },
];

export const FURNISHING_TYPES = [
  { value: "fully-furnished", label: "Fully Furnished", icon: "🛋️" },
  { value: "semi-furnished", label: "Semi Furnished", icon: "📦" },
  { value: "unfurnished", label: "Unfurnished", icon: "🏠" },
];


export const AVAILABILITY_TYPES = [
  {
    value: "ready-to-move",
    label: "Ready to Move",
    description: "Move in immediately",
    icon: "✅",
  },
  {
    value: "under-construction",
    label: "Under Construction",
    description: "Construction ongoing",
    icon: "🚧",
  },
];

export const PROPERTY_AGE_TYPES = [
  { value: "0-1-year", label: "0-1 Year (New)", icon: "🏗️" },
  { value: "1-5-years", label: "1-5 Years", icon: "🏠" },
  { value: "5-10-years", label: "5-10 Years", icon: "🏠" },
  { value: "10-20-years", label: "10-20 Years", icon: "🏘️" },
  { value: "20-plus-years", label: "20+ Years", icon: "🏛️" },
];

export const TRANSACTION_TYPES = [
  { value: "new-sale", label: "New Sale", icon: "✨" },
  { value: "resale", label: "Resale", icon: "🔄" },
];

export const FACING_TYPES = [
  { value: "north", label: "North", icon: "🧭" },
  { value: "south", label: "South", icon: "🧭" },
  { value: "east", label: "East", icon: "🧭" },
  { value: "west", label: "West", icon: "🧭" },
];

export const FLOORING_TYPES = [
  { value: "vitrified", label: "Vitrified", icon: "✨" },
  { value: "marble", label: "Marble", icon: "💎" },
  { value: "granite", label: "Granite", icon: "🪨" },
  { value: "wooden", label: "Wooden", icon: "🪵" },
  { value: "ceramic-tiles", label: "Ceramic Tiles", icon: "🔲" },
  { value: "cement", label: "Cement", icon: "🪨" },
  { value: "other", label: "Other", icon: "🎨" },
];

export const KITCHEN_TYPES = [
  { value: "open", label: "Open Kitchen", icon: "🍳" },
  { value: "closed", label: "Closed Kitchen", icon: "🚪" },
  { value: "semi-open", label: "Semi Open", icon: "✨" },
  { value: "l-shaped", label: "L-Shaped", icon: "🎨" },
  { value: "u-shaped", label: "U-Shaped", icon: "🎨" },
  { value: "parallel", label: "Parallel", icon: "🎨" },
  { value: "island", label: "Island Kitchen" , icon: "🎨"},
];

export const PARKING_TYPES = [
  { value: "open", label: "Open" },
  { value: "covered", label: "Covered" },
  { value: "basement", label: "Basement" },
  { value: "stilt", label: "Stilt" },
];

export const PROPERTY_STATUS_TYPES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];


export const POPULAR_LANDMARKS = [
  { name: "Metro Station", icon: "🚇", type: "metro" },
  { name: "City Center Mall", icon: "🏬", type: "mall" },
  { name: "Central Hospital", icon: "🏥", type: "hospital" },
  { name: "International Airport", icon: "✈️", type: "airport" },
  { name: "Business Park", icon: "🏢", type: "business" },
  { name: "Railway Station", icon: "🚉", type: "railway" },
  { name: "IT Hub", icon: "💼", type: "it-hub" },
  { name: "Shopping District", icon: "🛍️", type: "shopping" },
  { name: "International School", icon: "🏫", type: "school" },
  { name: "Central Park", icon: "🌳", type: "park" },
];