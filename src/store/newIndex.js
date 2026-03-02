

// frontend/admin-dashboard/src/store/newIndex.js
import { configureStore } from "@reduxjs/toolkit";
import { createPropertySlice } from "./properties/propertySlices";
import    uiReducer   from "./Ui/uiSlice";
import paymentReducer from "./payment/PaymentSlice";
import agentsReducer from "./agents/agentsSlice";
import propertyProgressReducer from "./PropertyProgress/propertyProgressSlice";
import residentialUiReducer from "./Residential/residentialUiSlice";
import residentialReducer from "./Residential/residentialSlice";


const getBaseState = (category, type) => ({
  propertyCategory: category,
  propertyType: type,
  propertySubType: "",
  listingType: "",
  // title: "",
  description: "",
  buildingName: "",
  address: "",
  city: "",
  state: "",
  createdBy: "",
  locality: "",
  pincode: "",
  location: { type: "Point", coordinates: [0, 0] },
  price: "",
  //mapEmbedUrl: "",
  maintenanceCharges: "",
  currency: "INR",
  pricePerSqft: "",
  constructionStatus: "",
  amenities: [],
  banksApproved: [],
  nearbyPlaces: [],
  specifications: [],
  galleryFiles: [],
  documentsFiles: [],
  parkingDetails: { visitorParking: true, twoWheeler: "", fourWheeler: "" },
  security: { gated: false, cctv: false, guard: false, details: "" },
  verificationDocumentType: "",
  
});

// 1. Setup Slices with Category-Specific Unique Fields
const residential = createPropertySlice("residential", {
  ...getBaseState("residential", "apartment"),
  bhk: "",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  furnishing: "",
  floorNumber: "",
  builtUpArea: "",
  totalFloors: "",
  isPriceNegotiable: false,
  carpetArea: "",
  transactionType: "",
  flooringType: "",
  kitchenType: "",
  propertyAge: "",
  constructionYear: "",
  isModularKitchen: false,
  parkingType: "",
  parkingCount: "",
  facing: "",
  possessionDate: "",
  smartHomeFeatures: [],
  parkingDetails: { visitorParking: true, twoWheeler: "", fourWheeler: "" },
});

const commercial = createPropertySlice("commercial", {
  ...getBaseState("commercial", "office"),
  isPriceNegotiable: false,
  seats: "",
  cabins: "",
  zoning: "",
  floorNumber: "",
  totalFloors: "",
  powerCapacityKw: "",
  tenantName: "",
  propertyAge: "",
  pantry: { type: "none", insidePremises: true, shared: false },
  buildingManagement: { security: true, managedBy: "", contact: "" },
  fireSafety: {
    fireExtinguisher: false,
    fireSprinklerSystem: false,
    fireHoseReel: false,
    fireHydrant: false,
    smokeDetector: false,
    fireAlarmSystem: false,
    fireControlPanel: false,
    emergencyExitSignage: false,
  },
  tenantInfo: [],
});

const land = createPropertySlice("land", {
    ...getBaseState("land", "land"),
    plotArea: "",
    plotAreaUnit: "sqft",
    roadWidthFt: "",
    readyToConstruct: true,
    waterConnection: true,
    electricityConnection: true,
    fencing: true,
    facing: "",
    cornerPlot: false,
    surveyNumber: "",
    landUseZone: "",
    layoutType: "",
    dimensions: { length: "", width: ""},
    landName: "",
    approvedByAuthority: []
});

const agricultural = createPropertySlice("agricultural", {
  ...getBaseState("agricultural", "agricultural-land"),
  boundaryWall: false,
  areaUnit: "",
  soilType: "",
  landShape: "",
  totalArea: { value: "", unit: "acre" },
  roadWidth: { value: "", unit: "ft" },
  currentCrop: "",
  irrigationType: "",
  landName: "",
  suitableFor: "",
  plantationAge: "",
  numberOfBorewells: "",
  borewellDetails: { depthMeters: "", yieldLpm: "", drilledYear: "" },
  waterSource: "",
  electricityConnection: true,
  accessRoadType: "",
  statePurchaseRestrictions: "No Restrictions",

  
});

// 2. Configure Store
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    payment: paymentReducer,
    agents: agentsReducer,
    residentialUi: residentialUiReducer,
    residentialData: residentialReducer,
    propertyProgress: propertyProgressReducer,
    residential: residential.reducer,
    commercial: commercial.reducer,
    land: land.reducer,
    agricultural: agricultural.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "residential/setGalleryFiles",
          "commercial/setGalleryFiles",
          "land/setGalleryFiles",
          "agricultural/setGalleryFiles",
          "residential/setDocumentsFiles",
          "commercial/setDocumentsFiles",
          "land/setDocumentsFiles",
          "agricultural/setDocumentsFiles",

          "residential/updateCurrentField",
        ],
        ignoredPaths: [
          "residential.form.galleryFiles",
          "commercial.form.galleryFiles",
          "land.form.galleryFiles",
          "agricultural.form.galleryFiles",
          "residential.form.documentsFiles",
          "commercial.form.documentsFiles",
          "land.form.documentsFiles",
          "agricultural.form.documentsFiles",

          "residentialData.current.galleryFiles",
          "residentialData.current.documentsFiles",
        ],
      },
    }),
});

// 3. Export unified actions
export const actions = {
  residential: residential.actions,
  commercial: commercial.actions,
  land: land.actions,
  agricultural: agricultural.actions,
};