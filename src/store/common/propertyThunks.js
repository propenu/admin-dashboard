// // frontend/admin-dashboard/src/store/common/propertyThunks.js
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import {
//   createPropertyDraft,
//   editPropertyBasic,
//   editPropertyLocation,
//   editPropertyDetails,
//   editPropertyVerification,
// } from "../../features/property/propertyService";

// export const savePropertyData = createAsyncThunk(
//   "properties/save",
//   async ({ category, id = null, step, data }, { getState, rejectWithValue }) => {
//     try {
//       if (!category) throw new Error("Category is required");

//       const state = getState();
//       const stateForm = data || state[category]?.form;

//       if (!stateForm) throw new Error(`Slice "${category}" not found`);

//       /* 1️⃣ CREATE DRAFT */
//       if (!id && step === "draft") {
//         const response = await createPropertyDraft(category);
//         return response.data;
//       }

//       /* 2️⃣ BUILD FORM DATA */
//       const fd = new FormData();
//       /* ================= GALLERY ================= */
//       // if (
//       //   Array.isArray(stateForm.galleryFiles) &&
//       //   stateForm.galleryFiles.length
//       // ) {
//       //   stateForm.galleryFiles.forEach((file, index) => {
//       //     if (file instanceof File) {
//       //       fd.append("galleryFiles", file);

//       //       fd.append(`gallery[${index}][filename]`, file.name);
//       //       fd.append(`gallery[${index}][caption]`, file.name);
//       //       fd.append(`gallery[${index}][order]`, index);
//       //     }
//       //   });
//       // }

//       /* ================= GALLERY ================= */

//       const combinedGallery = stateForm.galleryFiles || [];

//       // 1️⃣ Existing images (metadata only)
//       const existingGallery = combinedGallery
//         .filter((item) => item?.source === "server")
//         .map((item, index) => ({
//           url: item.preview,
//           filename: item.name,
//           order: index + 1,
//         }));

//       // 2️⃣ New files
//       const newFiles = combinedGallery
//         .filter((item) => item?.source === "local")
//         .map((item) => item.file);

//       // 🔥 DEBUG
//       console.log("🔥 EXISTING:", existingGallery);
//       console.log("🔥 NEW FILES:", newFiles);

//       // 3️⃣ Send metadata
//       fd.append("gallery", JSON.stringify(existingGallery));

//       // 4️⃣ Send only files
//       newFiles.forEach((file) => {
//         fd.append("galleryFiles", file);
//       });

//       if (
//         stateForm.verificationDocumentType &&
//         stateForm.documentsFiles?.length
//       ) {
//         fd.append(
//           "verificationType",
//           stateForm.verificationDocumentType.toUpperCase(),
//         );
//         fd.append(
//           "fileName",
//           stateForm.verificationDocumentType.replace("_", "-"),
//         );
//         stateForm.documentsFiles.forEach((file) => {
//           if (file instanceof File) fd.append("verificationDocuments", file);
//         });
//       }

//       // --- Loop through state and append to FormData ---
//       Object.entries(stateForm).forEach(([key, value]) => {
//         // Skip keys that shouldn't go to the DB or are handled separately
//         const skipKeys = [
//           "galleryFiles",
//           "gallery",
//           "documentsFiles",
//           "verificationDocuments",
//           "__v",
//           "_id",
//           "createdAt",
//           "updatedAt",
//           "meta",
//           "completion",
//         ];

//         if (skipKeys.includes(key) || value === null || value === undefined)
//           return;

//         // A. Handle Booleans (Convert to string because FormData only supports strings/blobs)
//         if (typeof value === "boolean") {
//           fd.append(key, String(value));
//           return;
//         }

//         // B. Handle Numbers
//         const numericFields = [
//           "price",
//           "pricePerSqft",
//           "bhk",
//           "bathrooms",
//           "bedrooms",
//           "balconies",
//           "seats",
//           "cabins",
//           "rank",
//           "floorNumber",
//           "totalFloors",
//           "builtUpArea",
//           "carpetArea",
//           "powerCapacityKw",
//         ];
//         if (numericFields.includes(key)) {
//           fd.append(key, String(Number(value || 0)));
//           return;
//         }

//         // C. Handle Arrays and Objects (location, nearbyPlaces, amenities)
//         // This is crucial: Backend needs to JSON.parse() these strings
//         if (
//           Array.isArray(value) ||
//           (typeof value === "object" && value !== null)
//         ) {
//           if (
//             Array.isArray(value)
//               ? value.length > 0
//               : Object.keys(value).length > 0
//           ) {
//             fd.append(key, JSON.stringify(value));
//           }
//           return;
//         }

//         // D. Handle Standard Strings
//         if (value !== "") {
//           fd.append(key, value);
//         }
//       });

//       // for (let pair of fd.entries()) {
//       // }
//       /* 3️⃣ STEP-BASED API ROUTING */
//       let response;
//       switch (step) {
//         case "basic":
//           response = await editPropertyBasic(category, id, stateForm);
//           break;
//         case "location": {
//           const locationPayload = {
//             address: stateForm.address,
//             locality: stateForm.locality,
//             city: stateForm.city,
//             state: stateForm.state,
//             buildingName: stateForm.buildingName,
//             landName: stateForm.landName,
//             pincode: stateForm.pincode,
//             location: stateForm.location,
//             nearbyPlaces: stateForm.nearbyPlaces,
//           };

//           response = await editPropertyLocation(category, id, locationPayload);
//           break;
//         }

//         case "details": {
//           // Remove optional fields from FormData instead
//           if (!stateForm.mapEmbedUrl) {
//             fd.delete("mapEmbedUrl");
//           }

//           if (
//             !stateForm.status ||
//             !["active", "inactive", "archived"].includes(stateForm.status)
//           ) {
//             fd.delete("status");
//           }

//           for (let pair of fd.entries()) {
//             console.log("FD =>", pair[0], pair[1]);
//           }

//           response = await editPropertyDetails(category, id, fd);
//           break;
//         }

//         case "verification":
//           response = await editPropertyVerification(category, id, fd);
//           break;
//         default:
//           throw new Error(`Invalid step "${step}"`);
//       }

//       return response.data;
//     } catch (err) {
//       console.error("❌ THUNK ERROR:", err);
//       return rejectWithValue(err.response?.data || { message: err.message });
//     }
//   },
// );




/// 



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

      /* ── VERIFICATION DOCUMENTS ── */
      // documentsFiles items can be:
      //   A) plain File objects (legacy)
      //   B) { file: File, docType, preview, source, status } (new wrapped format)
      //
      // verificationDocumentType can be:
      //   • stateForm.verificationDocumentType  (set explicitly in payload)
      //   • items[0].docType                    (fallback — read from first file's tag)

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

        if (skipKeys.includes(key) || value === null || value === undefined) return;

        if (typeof value === "boolean") { fd.append(key, String(value)); return; }

        const numericFields = [
          "price", "pricePerSqft", "bhk", "bathrooms", "bedrooms",
          "balconies", "seats", "cabins", "rank", "floorNumber",
          "totalFloors", "builtUpArea", "carpetArea", "powerCapacityKw",
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

      /* 3️⃣ STEP-BASED API ROUTING */
      let response;
      switch (step) {
        case "basic":
          response = await editPropertyBasic(category, id, stateForm);
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
          break;
        }

        case "details": {
          if (!stateForm.mapEmbedUrl) fd.delete("mapEmbedUrl");
          if (!stateForm.status || !["active", "inactive", "archived"].includes(stateForm.status)) {
            fd.delete("status");
          }
          for (let pair of fd.entries()) { console.log("FD =>", pair[0], pair[1]); }
          response = await editPropertyDetails(category, id, fd);
          break;
        }

        case "verification":
          // Debug — confirm what's being sent
          console.log("📤 VERIFICATION PATCH:");
          console.log("  verificationType →", resolvedDocType.toUpperCase());
          for (let pair of fd.entries()) { console.log(" ", pair[0], "→", pair[1]); }

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