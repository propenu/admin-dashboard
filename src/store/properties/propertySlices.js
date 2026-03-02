// frontend/admin-dashboard/src/store/properties/propertySlices.js
import { createSlice } from "@reduxjs/toolkit";
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

        // Auto-extract ID if an object is passed to createdBy
        if (
          key === "createdBy" &&
          typeof value === "object" &&
          value !== null
        ) {
          state.form.createdBy = value._id || value.id || "";
        } else {
          state.form[key] = value;
        }
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

      
      // hydrateForm: (state, action) => {
      //   state.form = {
      //     ...initialState.form,
      //     ...action.payload,
      //     galleryFiles: [],
      //     documentsFiles: [],
      //   };
      // },

      hydrateForm: (state, action) => {
  const {
    approval,
    rank,
    listingSource,
    isPublished,
    __v,
    completion,
    meta,
    ...cleanPayload
  } = action.payload;

  state.form = {
    ...initialState.form,
    ...cleanPayload,
    galleryFiles: [],
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