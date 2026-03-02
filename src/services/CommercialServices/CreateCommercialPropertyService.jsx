// src/services/CommercialServices/CreateCommercialPropertyService.jsx

import commercialPropertyAxios from "../../config/CommercialPropertyAxios";
import authAxios from "../../config/authApi";
import { API_ENDPOINTS } from "../../config/api";
import { USER_API_ENDPOINTS } from "../../config/UserDeatilsApi";

// Fetch logged-in user id (from /auth/me)
const getLoggedInUser = async () => {
  try {
    const res = await authAxios.get(USER_API_ENDPOINTS.USER_DETAILS);
    return res?.data?.user?.id || null;
  } catch (err) {
    console.error("Failed to fetch logged-in user:", err);
    return null;
  }
};

export const createCommercialPropertyService = async (payload) => {
  const fd = new FormData();

  // Logged-in user
  const loggedUserId = await getLoggedInUser();
  if (loggedUserId) {
    fd.append("createdBy", loggedUserId);
  }

  // REQUIRED listingSource
  fd.append("listingSource", payload.listingSource || "Sales Manager");

  // TEXT FIELDS
  const textFields = [
    "title",
    "slug",
    "listingType",
    "address",
    "description",
    "city",
    "state",
    "pincode",
    "currency",
    "transactionType",
    "flooringType",
    "kitchenType",
    "propertyAge",
    "furnishing",
    "parkingType",
    "facing",
    "constructionStatus",
    "propertyType",
    "propertySubType",
  ];

  textFields.forEach((key) => {
    if (payload[key]) fd.append(key, payload[key]);
  });

  // NUMERIC FIELDS — only append if not empty
  const numericFields = [
    "price",
    "pricePerSqft",
    "carpetArea",
    "builtUpArea",
    "superBuiltUpArea",
    "constructionYear",
    "parkingCount",
    "floorNumber",
    "totalFloors",
    "maintenanceCharges",
    "seats",
    "cabins",
    "meetingRooms",
    "conferenceRooms",
    "parkingCapacity",
    "powerCapacityKw",
    "washrooms",
  ];

  numericFields.forEach((key) => {
    if (payload[key] !== "" && payload[key] !== undefined) {
      fd.append(key, Number(payload[key]));
    }
  });

  // DATE
  if (payload.possessionDate) {
    fd.append("possessionDate", payload.possessionDate);
  }

  // BOOLEAN FIELDS — always send boolean
  fd.append("isModularKitchen", Boolean(payload.isModularKitchen));
  fd.append("fireSafety", Boolean(payload.fireSafety));
  fd.append("lift", Boolean(payload.lift));

  // LOCATION (GeoJSON)
  if (payload.location?.coordinates?.length === 2) {
    fd.append("location", JSON.stringify(payload.location));
  }

  // JSON FIELDS
  const jsonFields = [
    "amenities",
    "specifications",
    "nearbyPlaces",
    "tenantInfo",
    "documents",
    "smartHomeFeatures",
    "parkingDetails",
    "buildingManagement",
  ];

  jsonFields.forEach((key) => {
    fd.append(key, JSON.stringify(payload[key] || []));
  });

  // GALLERY FILES (actual uploaded files)
  if (Array.isArray(payload.galleryFiles)) {
    payload.galleryFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("galleryFiles", file);
      }
    });
  }

  // Gallery captions/order
  if (Array.isArray(payload.gallery)) {
    fd.append("gallery", JSON.stringify(payload.gallery));
  }

  // SEND REQUEST
  const res = await commercialPropertyAxios.post(API_ENDPOINTS.COMMERCIAL, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
