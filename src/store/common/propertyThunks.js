// frontend/admin-dashboard/src/store/common/propertyThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createPropertyDraft,
  editPropertyBasic,
  editPropertyLocation,
  editPropertyDetails,
  editPropertyVerification,
} from "../../features/property/propertyService";

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
        .filter((item) => item?.source === "server")
        .map((item, index) => ({ url: item.preview, filename: item.name, order: index + 1 }));

      const newGalleryFiles = combinedGallery
        .filter((item) => item?.source === "local")
        .map((item) => item.file);

      fd.append("gallery", JSON.stringify(existingGallery));
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

        if (typeof value === "boolean") { fd.append(key, String(value)); return; }

        const numericFields = [
          "price", "pricePerSqft", "bhk", "bathrooms", "bedrooms",
          "balconies", "seats", "cabins", "rank", "floorNumber",
          "totalFloors", "builtUpArea", "carpetArea", "powerCapacityKw",
          "projectArea", "totalTowers", "totalUnits", "availableUnits",
        ];
        if (numericFields.includes(key)) { fd.append(key, String(Number(value || 0))); return; }

        if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
          if (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0) {
            fd.append(key, JSON.stringify(value));
          }
          return;
        }

        if (value !== "") { fd.append(key, value); }
      });

      // console.log("📤 PROPERTY PATCH:", fd);

      // console.log("STEP =", step);
      // console.log("CATEGORY =", category);
      // console.log("PROPERTY ID =", id);

      /* 3️⃣ STEP-BASED API ROUTING */
      let response;
      switch (step) {
        case "basic":
          response = await editPropertyBasic(category, id, stateForm);
          console.log("//////////////// details ///////////////////////////");
          console.log("DETAIL RESPONSE =", response.data);
          console.log("completion.step =", response?.data?.data.completion?.step);
          console.log("///////////////////////////////////////////");
          break;

        case "location": {
          const locationPayload = {
            address      : stateForm.address,
            locality     : stateForm.locality,
            city         : stateForm.city,
            state        : stateForm.state,
            buildingName : stateForm.buildingName,
            landName     : stateForm.landName,
            pincode      : stateForm.pincode,
            location     : stateForm.location,
            nearbyPlaces : stateForm.nearbyPlaces,
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
