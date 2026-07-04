// frontend/admin-dashboard/src/store/properties/propertySlices.js
import { createSlice } from "@reduxjs/toolkit";
import { savePropertyData } from "../common/propertyThunks";

export const createPropertySlice = (name, uniqueInitialFields) => {
  const initialState = {
    form: {
      propertyCategory: name, 
      //title: "",
      address: "",
      description: "",
      status:"",
      location: { type: "Point", coordinates: [0, 0] },
      gallery: [],
      galleryFiles: [],
      documents: [],
      // documentsFiles: [],
      createdBy: "",
      propertySubType: "",
      ...uniqueInitialFields,
    },
    loading: false,
    error: null,
  };

  return createSlice({
    name,
    initialState,
    reducers: {
      // 🟢 Update standard top-level fields
      updateField: (state, action) => {
        const { key, value } = action.payload;

        state.form[key] = value;
      },

      updateNestedField: (state, action) => {
        const { parent, child, value } = action.payload;
        if (state.form[parent]) {
          state.form[parent][child] = value;
        }
      },

      // Specialized setters for Binary Files
      setGalleryFiles: (state, action) => {
        state.form.galleryFiles = action.payload;
      },
      setDocumentsFiles: (state, action) => {
        state.form.documentsFiles = action.payload;
      },

      
      

      hydrateForm: (state, action) => {
  const cleanPayload = { ...action.payload };
  delete cleanPayload.approval;
  delete cleanPayload.rank;
  delete cleanPayload.listingSource;
  delete cleanPayload.isPublished;
  delete cleanPayload.meta;

  state.form = {
    ...initialState.form,
    ...cleanPayload,

    // 🔑 keep uploaded files if they exist
    galleryFiles:
      state.form.galleryFiles?.length > 0
        ? state.form.galleryFiles
        : cleanPayload.gallery || [],
    documentsFiles: [],
  };
},
      // 🟢 Reset: Clear form after successful post
      resetForm: (state) => {
        state.form = initialState.form;
        state.error = null;
        state.loading = false;
      },
    },

    // 🟢 Universal Async State Handling
    extraReducers: (builder) => {
      builder
        .addCase(savePropertyData.fulfilled, (state, action) => {
          if (action.payload?.data) {
            const payload = action.payload.data;
            const previousCreatedBy = state.form.createdBy;
            const previousPriceCalculationBasis =
              state.form.priceCalculationBasis || "carpetArea";
            const responseCreatedBy = payload.createdBy;
            const shouldKeepPopulatedCreatedBy =
              previousCreatedBy &&
              typeof previousCreatedBy === "object" &&
              (!responseCreatedBy ||
                typeof responseCreatedBy === "string");
            const shouldMergeCreatedBy =
              previousCreatedBy &&
              typeof previousCreatedBy === "object" &&
              responseCreatedBy &&
              typeof responseCreatedBy === "object";
            const mergedCreatedBy = shouldMergeCreatedBy
              ? {
                  ...previousCreatedBy,
                  ...responseCreatedBy,
                  roleName:
                    responseCreatedBy.roleName ||
                    responseCreatedBy.role ||
                    previousCreatedBy.roleName ||
                    previousCreatedBy.role,
                }
              : responseCreatedBy;

            state.form = {
              ...initialState.form,
              ...payload,
              // The basic-details API currently does not return this UI
              // preference. Preserve the selected basis instead of resetting
              // to initialState.form.carpetArea after every autosave.
              priceCalculationBasis:
                payload.priceCalculationBasis === "builtUpArea" ||
                payload.priceCalculationBasis === "carpetArea"
                  ? payload.priceCalculationBasis
                  : previousPriceCalculationBasis,
              createdBy: shouldKeepPopulatedCreatedBy
                ? previousCreatedBy
                : mergedCreatedBy,

              // 🔥 IMPORTANT FIX
              galleryFiles:
                payload.gallery?.map((img) => ({
                  preview: img.url,
                  name: img.filename,
                  key: img.key,
                  source: "server",
                })) || [],
            };
          }
        })
        .addMatcher(
          (a) => a.type.endsWith("/pending"),
          (state) => {
            state.loading = true;
            state.error = null;
          },
        )
        .addMatcher(
          (a) => a.type.endsWith("/fulfilled"),
          (state) => {
            state.loading = false;
          },
        )
        .addMatcher(
          (a) => a.type.endsWith("/rejected"),
          (state, action) => {
            state.loading = false;
            state.error = action.payload;
          },
        );
    },
  });
};
