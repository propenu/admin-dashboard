// frontend/admin-dashboard/src/store/common/propertyThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createPropertyDraft,
  editPropertyBasic,
  editPropertyLocation,
  editPropertyDetails,
  editPropertyVerification,
} from "../../features/property/propertyService";

const BASIC_STEP_KEYS = [
  "listingType",
  "transactionType",
  "propertyCategory",
  "propertyType",
  "propertySubType",
  "title",
  "landName",
  "createdBy",
  "relationshipManagerId",
  "price",
  "pricePerSqft",
  "priceCalculationBasis",
  "currency",
  "isPriceNegotiable",
  "isAgentProject",
  "dimensions",
  "roadWidth",
  "roadWidthFt",
  "roadWidthUnit",
  "plotArea",
  "plotAreaUnit",
  "builtUpArea",
  "carpetArea",
  "totalArea",
  "bedrooms",
  "bathrooms",
  "balconies",
  "cabins",
  "seats",
  "facing",
  "furnishing",
  "furnishedStatus",
  "constructionStatus",
  "propertyAge",
  "possessionDate",
  "wallFinishStatus",
  "projectArea",
  "totalTowers",
  "totalUnits",
  "availableUnits",
];

const idFrom = (value) => {
  if (!value || typeof value !== "object") return value;
  return value._id || value.userId || value.id || undefined;
};

// Multer rejects a single text part over its field-size cap ("Field value too long").
const TEXT_FIELD_LIMIT = 900 * 1024;

const formText = (value) => {
  if (value == null) return null;
  if (typeof value === "string") {
    if (value.startsWith("data:") || value.length > TEXT_FIELD_LIMIT) return null;
    return value;
  }
  if (typeof File !== "undefined" && value instanceof File) return null;
  if (typeof Blob !== "undefined" && value instanceof Blob) return null;
  if (Array.isArray(value) || typeof value === "object") {
    const json = JSON.stringify(value, (_key, nested) => {
      if (typeof nested !== "string") return nested;
      if (
        nested.startsWith("data:") ||
        nested.startsWith("blob:") ||
        nested.length > TEXT_FIELD_LIMIT
      ) {
        return undefined;
      }
      return nested;
    });
    if (!json || json === "{}" || json === "[]" || json.length > TEXT_FIELD_LIMIT) {
      return null;
    }
    return json;
  }
  return String(value);
};

const httpUrl = (value) =>
  typeof value === "string" &&
  (value.startsWith("http://") || value.startsWith("https://")) &&
  value.length < 4000
    ? value
    : undefined;

/** Basic save matches the website: only the fields on that step, never photos or the full listing. */
const buildBasicStepPayload = (form) => {
  if (!form || typeof form !== "object") return {};

  const payload = {};
  BASIC_STEP_KEYS.forEach((key) => {
    const value = form[key];
    if (value == null || value === "") return;
    if (key === "createdBy" || key === "relationshipManagerId") {
      const id = idFrom(value);
      if (id) payload[key] = id;
      return;
    }
    payload[key] = value;
  });

  return payload;
};

export const savePropertyData = createAsyncThunk(
  "properties/save",
  async ({ category, id = null, step, data }, { getState, rejectWithValue }) => {
    try {
      if (!category) throw new Error("Category is required");

      const state     = getState();
      const stateForm = data || state[category]?.form;

      if (!stateForm) throw new Error(`Slice "${category}" not found`);

      /* 1️⃣ CREATE DRAFT */
      if (!id && step === "draft") {
        const response = await createPropertyDraft(category);
        return response.data;
      }

      /* 2️⃣ BUILD FORM DATA */
      const fd = new FormData();

      /* ── GALLERY ── */
      const combinedGallery = stateForm.galleryFiles || [];

      const existingGallery = combinedGallery
        .filter((item) => {
          if (!item) return false;
          if (item.source === "local") return false;
          // Treat tagged server images and legacy untagged url/preview rows as server.
          if (item.source === "server") return true;
          return Boolean(item.preview || item.url || item.secureUrl || item.location);
        })
        .map((item, index) => ({
          url: httpUrl(item.url || item.secureUrl || item.location || item.preview),
          filename: item.name || item.filename || item.key || `image-${index + 1}`,
          order: index + 1,
          key: item.key,
        }))
        .filter((item) => item.url);

      const newGalleryFiles = combinedGallery
        .filter((item) => item?.source === "local")
        .map((item) => item.file)
        .filter((file) => file instanceof File);

      const galleryJson = formText(existingGallery);
      if (galleryJson) fd.append("gallery", galleryJson);
      newGalleryFiles.forEach((file) => { fd.append("galleryFiles", file); });

      /* ── DOCUMENTS ── */
      const rawDocFiles = stateForm.documentsFiles || [];

      // Resolve the docType: prefer explicit field, fall back to file tag
      const resolvedDocType =
        stateForm.verificationDocumentType ||
        rawDocFiles[0]?.docType ||
        "";

      if (resolvedDocType && rawDocFiles.length) {
        fd.append("verificationType", resolvedDocType.toUpperCase());
        fd.append("fileName", resolvedDocType.replace("_", "-"));

        rawDocFiles.forEach((item) => {
          // ✅ Unwrap: support both plain File and wrapped { file: File, ... }
          const actualFile = item instanceof File ? item : item?.file;
          if (actualFile instanceof File) {
            fd.append("verificationDocuments", actualFile);
          }
        });
      }

      /* ── REST OF FORM FIELDS ── */
      Object.entries(stateForm).forEach(([key, value]) => {
        const skipKeys = [
          "galleryFiles",
          "gallery",
          "documentsFiles",
          "verificationDocuments",
          "__v",
          "_id",
          "createdAt",
          "updatedAt",
          "meta",
          "completion",
          "createdBy",
          "updateHistory",
          "approval",
          "postedBy",
          "lastUpdatedBy",
          "approvedBy",
          "relationshipManager",
        ];

        if (
          skipKeys.includes(key) ||
          (category === "land" && stateForm.isAgentProject && key === "propertySubType") ||
          (category === "land" &&
            stateForm.isAgentProject &&
            key === "totalTowers") ||
          value === null ||
          value === undefined
        ) return;

        if (key === "relationshipManagerId") {
          const managerId = idFrom(value);
          if (managerId) fd.append(key, String(managerId));
          return;
        }

        if (key === "description" && typeof value === "string") {
          const description = value.slice(0, 500);
          if (description) fd.append(key, description);
          return;
        }

        if (typeof value === "boolean") { fd.append(key, String(value)); return; }

        const numericFields = [
          "price", "pricePerSqft", "bhk", "bathrooms", "bedrooms",
          "balconies", "seats", "cabins", "rank", "floorNumber",
          "totalFloors", "builtUpArea", "carpetArea", "powerCapacityKw",
          "projectArea", "totalTowers", "totalUnits", "availableUnits",
        ];
        if (numericFields.includes(key)) { fd.append(key, String(Number(value || 0))); return; }

        if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
          const json = formText(value);
          if (json) fd.append(key, json);
          return;
        }

        if (value !== "") {
          const text = formText(value);
          if (text) fd.append(key, text);
        }
      });

      // console.log("📤 PROPERTY PATCH:", fd);

      // console.log("STEP =", step);
      // console.log("CATEGORY =", category);
      // console.log("PROPERTY ID =", id);

      /* 3️⃣ STEP-BASED API ROUTING */
      let response;
      switch (step) {
        case "basic":
          response = await editPropertyBasic(
            category,
            id,
            buildBasicStepPayload(stateForm),
          );
          console.log("//////////////// details ///////////////////////////");
          console.log("DETAIL RESPONSE =", response.data);
          console.log("completion.step =", response?.data?.data.completion?.step);
          console.log("///////////////////////////////////////////");
          break;

        case "location": {
          const nearbyPlaces = Array.isArray(stateForm.nearbyPlaces)
            ? stateForm.nearbyPlaces.map((place) => {
                const normalizedCoordinates = Array.isArray(place?.coordinates)
                  ? place.coordinates.map(Number)
                  : null;
                const hasValidCoordinates =
                  normalizedCoordinates?.length === 2 &&
                  normalizedCoordinates.every(Number.isFinite);

                if (hasValidCoordinates) {
                  return { ...place, coordinates: normalizedCoordinates };
                }

                // Manual places do not have map coordinates. Send the valid
                // GeoJSON placeholder expected by the API: [longitude, latitude].
                return { ...place, coordinates: [0, 0] };
              })
            : [];

          const locationPayload = {
            address      : stateForm.address,
            locality     : stateForm.locality,
            city         : stateForm.city,
            state        : stateForm.state,
            buildingName : stateForm.buildingName,
            landName     : stateForm.landName,
            pincode      : stateForm.pincode,
            location     : stateForm.location,
            nearbyPlaces,
          };
          response = await editPropertyLocation(category, id, locationPayload);
          console.log("//////////////// location ///////////////////////////");
          console.log("DETAIL RESPONSE =", response.data);
          console.log("completion.step =", response?.data?.data?.completion?.step);
          console.log("///////////////////////////////////////////");
          break;
        }

        case "details": {
          if (!stateForm.mapEmbedUrl) fd.delete("mapEmbedUrl");
          if (!stateForm.status || !["active", "inactive", "archived"].includes(stateForm.status)) {
            fd.delete("status");
          }
         // for (let pair of fd.entries()) { console.log("FD =>", pair[0], pair[1]); }
          response = await editPropertyDetails(category, id, fd);
          console.log("//////////////// details ///////////////////////////")
          console.log("DETAIL RESPONSE =", response.data);
          console.log("completion.step =", response?.data?.data?.completion?.step);
          console.log("///////////////////////////////////////////")
          break;
        }

        case "verification":
          // Debug — confirm what's being sent
         // console.log("📤 VERIFICATION PATCH:");
         // console.log("  verificationType →", resolvedDocType.toUpperCase());
          //for (let pair of fd.entries()) { console.log(" ", pair[0], "→", pair[1]); }

          response = await editPropertyVerification(category, id, fd);
          console.log("//////////////// verification ///////////////////////////");
          console.log("DETAIL RESPONSE =", response.data);
          console.log("completion.step =", response?.data?.data?.completion?.step);
          console.log("///////////////////////////////////////////");
          break;

        default:
          throw new Error(`Invalid step "${step}"`);
      }

      return response.data;
    } catch (err) {
      console.error("❌ THUNK ERROR:", err);
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);
