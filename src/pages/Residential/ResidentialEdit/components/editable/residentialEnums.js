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

export const LAYOUT_TYPES = [
  { value: "approved layout", label: "Approved Layout", icon: "🧭" },
  { value: "un-approved layout", label: "Un-Approved Layout", icon: "🧭" },
  { value : "gated layout", label: "Gated Layout", icon: "🧭" },  
  { value : "indvidual layout", label: "Indvidual Layout", icon: "🧭" },
]

export const SOIL_TYPES = [
  { label: "Red Soil", value: "red" },
  { label: "Black Soil", value: "black" },
  { label: "Alluvial Soil", value: "alluvial" },
  { label: "Sandy Soil", value: "sandy" },
  { label: "Clay Soil", value: "clay" },
  { label: "Loamy Soil", value: "loamy" },
];

export const IRRIGATION_TYPES = [
 { label: "Rainfed", value: "rainfed" },
  { label: "Canal", value: "canal"},
  { label: "Borewell", value: "borewell"},
 {  label: "Drip", value: "drip"},
  { label: "Sprinkler", value: "sprinkler"},
  { label: "River", value: "river"},
  { label: "Tank", value: "tank"},
];

export const WATER_SOURCES = [
  { label: "Borewell", value: "borewell"},
  { label: "Canal", value: "canal"},
  { label: "River", value: "river"},
  { label: "Tank", value: "tank"},
  { label: "Rainwater", value: "rainwater"},
  { label: "Municipal", value: "municipal"},
  { label: "Multiple Sources", value: "multiple Sources"},
];

export const WALL_FINISH_STATUS = [
  { label: "No Partitions", value: "no-partitions" },
  { label: "Brick Walls", value: "brick-walls" },
  { label: "Plastered Walls", value: "plastered-walls" },
];

export const FLOORING_TYPES = [
  { value: "verified", label: "Verified", icon: "✨" },
  { value: "marble", label: "Marble", icon: "💎" },
  { value: "granite", label: "Granite", icon: "🪨" },
  { value: "wooden", label: "Wooden", icon: "🪵" },
  { value: "ceramic-tiles", label: "Ceramic Tiles", icon: "🔲" },
  { value: "cement", label: "Cement", icon: "🪨" },
  { value: "other", label: "Other", icon: "🎨" },
];

export const RESIDENTIAL_FLOORING = [
  { label: "Vitrified", value: "vitrified", icon: "✨" },
  { label: "Marble", value: "marble", icon: "💎" },
  { label: "Granite", value: "granite", icon: "🪨" },
  { label: "Wooden", value: "wooden" },
  { label: "Ceramic Tiles", value: "ceramic-tiles", icon: "🔲" },
  { label: "Cement", value: "cement", icon: "🪨" },
  { label: "Mosaic", value: "mosaic" },
  { label: "Normal Tiles", value: "normal-tiles", icon: "🔲" },
  { label: "Other", value: "other", icon: "🎨" },
];

export const COMMERCIAL_FLOORING = [
  { label: "Vitrified Tiles", value: "vitrified-tiles", icon: "✨" },
  { label: "Ceramic Tiles", value: "ceramic-tiles", icon: "🔲" },
  { label: "Bare Cement", value: "bare-cement", icon: "🪨" },
  { label: "Marble", value: "marble", icon: "💎" },
  { label: "Granite", value: "granite", icon: "🪨" },
  { label: "Carpet", value: "carpet", icon: "🪵" },
  { label: "Epoxy", value: "epoxy", icon: "🪵" },
  { label: "Wooden", value: "wooden", icon: "🪵" },
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
  { label: "Covered", value: "covered" },
  { label: "Open", value: "open" },
  { label: "Stilt", value: "stilt" },
  { label: "Basement", value: "basement" },
  { label: "Street", value: "street" },
  { label: "Dedicated", value: "dedicated" },
  { label: "Shared", value: "shared" },
];

export const PANTRY_TYPES = [
  { label: "None", value: "none" },
  { label: "Shared Pantry", value: "shared" },
  { label: "Private Pantry", value: "private" },
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

export const COMMERCIAL_TYPES = [
  { value: "office", label: "Office", icon: "🏢" },
  { value: "retail", label: "Retail", icon: "🛍️" },
  { value: "shop", label: "Shop", icon: "🏪" },
  { value: "showroom", label: "Showroom", icon: "✨" },
  { value: "warehouse", label: "Warehouse", icon: "📦" },
  { value: "industrial", label: "Industrial", icon: "🏭" },
  { value: "coworking", label: "Co-working",icon: "💻" },
  { value: "restaurant", label: "Restaurant", icon: "🍴" },
  { value: "clinic", label:"Clinic", icon: "🏥"  },
];

export const LAND_TYPES = [
  { value: "plot", label: "Plot", icon: "🌿" },
  { value: "residential-plot", label: "Residential Plot", icon: "🏠" },
  { value: "industrial-plot", label: "Industrial Plot", icon: "🏭" },
  { value: "investment-plot", label: "Investment Plot", icon: "🌾" },
  { value: "commercial-plot", label: "Commercial Plot", icon: "🏢" },
  { value: "corner-plot", label: "Corner Plot", icon: "🌾" },
  { value: "na-plot", label: "Not Applicable Plot", icon: "🌾" },
];

export const AGRI_TYPES = [
  { value: "dry-land", label: "Dry Land", icon: "🏜️" },
  { value: "wet-land", label: "Wet Land", icon: "💧" },
  { value: "farm-land", label: "Farm Land", icon: "🚜" },
  { value: "plantation", label: "Plantation", icon: "🌳" },
  { value: "orchard-land", label: "Orchard Land", icon: "🌲" },
  { value: "agricultural-land", label: "Agricultural Land", icon: "🌾" },
  { value: "dairy-farm", label: "Dairy Farm", icon: "🥛" },
  { value: "ranch", label: "Ranch", icon: "🐄" },
];

export const FURNISHED_STATUS_COMMERCIAL = [
  { value: "unfurnished", label: "Unfurnished", icon: "🛋️" },
  { value: "semi-furnished", label: "Semi-Furnished", icon: "📦" },
  { value: "fully-furnished", label: "Fully-Furnished", icon: "🏢" },
];


  export const COMMERCIAL_SUB_TYPES = [
    { label: "Bare Shell", value: "bare-shell", icon: "🧱" },
    { label: "Warm Shell", value: "warm-shell", icon: "🔥" },
    { label: "Business Center", value: "business-center", icon: "🏢" },
    { label: "High Street Shop", value: "high-street-shop", icon: "🛍️" },
    { label: "Mall Shop", value: "mall-shop", icon: "🏬" },
    { label: "Kiosk", value: "kiosk", icon: "🎨" },
    { label: "Food Court Unit", value: "food-court-unit", icon: "🍴" },
    { label: "Shutter Shop", value: "shutter-shop", icon: "🎨" },
    { label: "Showroom Space", value: "showroom-space", icon: "✨" },
    { label: "Warehouse / Godown", value: "warehouse-godown", icon: "📦" },
    { label: "Logistics Hub", value: "logistics-hub", icon: "🚚" },
    { label: "Cold Storage", value: "cold-storage", icon: "❄️" },
    { label: "Industrial Shed", value: "industrial-shed", icon: "🏭" },
  ]

  export const LAND_SUB_TYPES = [
    { label: "Gated Community", value: "gated-community", icon: "🚪" },
    { label: "Non Gated", value: "non-gated", icon: "🏜️" },
    { label: "Road Facing", value: "road-facing", icon: "🛣️" },
    { label: "Two Side Open", value: "two-side-open", icon: "🌳" },
    { label: "Three Side Open", value: "three-side-open", icon: "🌳" },
    { label: "Resale", value: "resale", icon: "📦" },
    { label: "New Plot", value: "new-plot", icon: "🌳" },
    { label: "Corner", value: "corner", icon: "🌳" },
  ]

 export const AGRI_SUB_TYPES = [
    { label: "Irrigated", value: "irrigated", icon: "💧" },
    { label: "Non Irrigated", value: "non-irrigated", icon: "🌾" },
    { label: "Fenced", value: "fenced", icon: "🚪" },
    { label: "Unfenced", value: "unfenced", icon: "🌳" },
    { label: "With Well", value: "with-well", icon: "💧" },
    { label: "With Borewell", value: "with-borewell", icon: "💧" },
    { label: "With Electricity", value: "with-electricity", icon: "🔌" },
    { label: "Near Road", value: "near-road", icon: "🛣️" },
    { label: "Inside Village", value: "inside-village", icon: "🌳" },
    { label: "Farmhouse Permission", value: "farmhouse-permission", icon: "🌳" },
  ]
