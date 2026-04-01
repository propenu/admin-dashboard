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

      const state = getState();
      const stateForm =  data || state[category]?.form 

      console.log("STATE FORM:", stateForm);

      if (!stateForm) throw new Error(`Slice "${category}" not found`);

      /* 1️⃣ CREATE DRAFT */
      if (!id && step === "draft") {
        const response = await createPropertyDraft(category);
        return response.data;
      }

      /* 2️⃣ BUILD FORM DATA */
      const fd = new FormData();

      console.log("📦 FINAL CLEAN PAYLOAD SENT TO API:", fd);

      /* ================= GALLERY ================= */
      if (
        Array.isArray(stateForm.galleryFiles) &&
        stateForm.galleryFiles.length
      ) {
        stateForm.galleryFiles.forEach((file, index) => {
          if (file instanceof File) {
            fd.append("galleryFiles", file);

            fd.append(`gallery[${index}][filename]`, file.name);
            fd.append(`gallery[${index}][caption]`, file.name);
            fd.append(`gallery[${index}][order]`, index);
          }
        });
      }

      if (
        stateForm.verificationDocumentType &&
        stateForm.documentsFiles?.length
      ) {
        fd.append(
          "verificationType",
          stateForm.verificationDocumentType.toUpperCase(),
        );
        fd.append(
          "fileName",
          stateForm.verificationDocumentType.replace("_", "-"),
        );
        stateForm.documentsFiles.forEach((file) => {
          if (file instanceof File) fd.append("verificationDocuments", file);
        });
      }

      // --- Loop through state and append to FormData ---
      Object.entries(stateForm).forEach(([key, value]) => {
        // Skip keys that shouldn't go to the DB or are handled separately
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

        if (skipKeys.includes(key) || value === null || value === undefined)
          return;

        // A. Handle Booleans (Convert to string because FormData only supports strings/blobs)
        if (typeof value === "boolean") {
          fd.append(key, String(value));
          return;
        }

        // B. Handle Numbers
        const numericFields = [
          "price",
          "pricePerSqft",
          "bhk",
          "bathrooms",
          "bedrooms",
          "balconies",
          "seats",
          "cabins",
          "rank",
          "floorNumber",
          "totalFloors",
          "builtUpArea",
          "carpetArea",
          "powerCapacityKw",
        ];
        if (numericFields.includes(key)) {
          fd.append(key, String(Number(value || 0)));
          return;
        }

        // C. Handle Arrays and Objects (location, nearbyPlaces, amenities)
        // This is crucial: Backend needs to JSON.parse() these strings
        if (
          Array.isArray(value) ||
          (typeof value === "object" && value !== null)
        ) {
          if (
            Array.isArray(value)
              ? value.length > 0
              : Object.keys(value).length > 0
          ) {
            fd.append(key, JSON.stringify(value));
          }
          return;
        }

        // D. Handle Standard Strings
        if (value !== "") {
          fd.append(key, value);
        }
      });

      /* ✅ NOW DEBUG */
      console.log("======= FORM DATA DEBUG START =======");

      for (let pair of fd.entries()) {
        console.log(pair[0], ":", pair[1]);
      }

      console.log("======= FORM DATA DEBUG END =======");

      /* 3️⃣ STEP-BASED API ROUTING */
      let response;
      switch (step) {
        case "basic":
          response = await editPropertyBasic(category, id, stateForm);
          break;
        case "location": {
          const locationPayload = {
            address: stateForm.address,
            locality: stateForm.locality,
            city: stateForm.city,
            state: stateForm.state,
            buildingName: stateForm.buildingName,
            pincode: stateForm.pincode,
            location: stateForm.location,
            nearbyPlaces: stateForm.nearbyPlaces,
          };

          response = await editPropertyLocation(
            category,
            id,
            locationPayload,
          );
          break;
        }

        case "details": {
          // Remove optional fields from FormData instead
          if (!stateForm.mapEmbedUrl) {
            fd.delete("mapEmbedUrl");
          }

          if (
            !stateForm.status ||
            !["active", "inactive", "archived"].includes(stateForm.status)
          ) {
            fd.delete("status");
          }

          response = await editPropertyDetails(category, id, fd); 
          break;
        }

        case "verification":
          response = await editPropertyVerification(category, id, fd);
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

