//frontend/admin-dashboard/src/services/PostAPropertyService.jsx
import authAxios from "../config/authApi";
import { API_ENDPOINTS, API_CONFIG } from "../config/api";
/* ---------------------------------------------------------
 * Generic Fetch Helper
 * --------------------------------------------------------- */
const apiPostPropertyRequest = async (url, options = {}) => {
  const finalOptions = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, finalOptions);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API Error: ${response.status} - ${message}`);
  }

  return response.json();
};

/* ---------------------------------------------------------
 * GET: Featured Property by ID
 * --------------------------------------------------------- */
export const fetchPostFeaturedPropertyById = async (id) => {
  return apiPostPropertyRequest(API_ENDPOINTS.PROPERTY_DETAILS(id), {
    method: "GET",
  });
};



/* ======= FULLY UPDATED updateFeaturedProperty ======= */
export const updateFeaturedProperty = async (id, payload) => {
  const fd = new FormData();
  /* ─────────────────────────────────────────────
     1️⃣ BHK Summary
  // ───────────────────────────────────────────── */
  

  if (Array.isArray(payload.projectSummary)) {
    const projectSummaryJson = payload.projectSummary.map((project) => {
      console.log("🔹 ORIGINAL PROJECT:", project);

      const units = (project.units || []).map((u) => {
        console.log("   🔸 ORIGINAL UNIT:", u);

        // ✅ NEW PLAN IMAGE
        if (u.planFile instanceof File) {
          fd.append("bhkPlanFiles", u.planFile);
        }

        const unitJson = {
          // ✅ SQFT
          minSqft: Number(u.minSqft || 0),

          maxSqft: Number(u.maxSqft || 0),

          // ✅ PRICE
          minPrice: Number(u.minPrice || 0),

          maxPrice: Number(u.maxPrice || 0),

          // ✅ AVAILABLE UNITS
          availableCount: Number(u.availableCount || 0),

          // ✅ AREA
          area: {
            value: Number(u.area?.value || 0),

            unit: u.area?.unit || "sqft",

            sqftValue: Number(u.area?.sqftValue || 0),
          },

          // ✅ EXISTING ID
          ...(u._id && { _id: u._id }),

          // ✅ FILE NAME
          ...(u.planFileName && {
            planFileName: u.planFileName,
          }),

          // ✅ EXISTING IMAGE URL
          ...(!(u.planFile instanceof File) &&
            u.plan?.url && {
              plan: u.plan,
            }),
        };

        console.log("   ✅ UNIT JSON:", unitJson);

        return unitJson;
      });

      // ✅ FINAL PROJECT OBJECT
      const projectObj = {
        bhk: Number(project.bhk || 0),

        // ✅ LABEL
        label: project.label || "",

        // ✅ EXISTING ID
        ...(project._id && { _id: project._id }),

        // ✅ UNITS
        units,
      };

      console.log("✅ FINAL PROJECT OBJECT:", projectObj);

      return projectObj;
    });

    console.log("🔥 FINAL PROJECT SUMMARY JSON:", projectSummaryJson);

    // ✅ APPEND FINAL JSON
    fd.append("projectSummary", JSON.stringify(projectSummaryJson));

    console.log("📦 FORM DATA:");

    for (let pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }
  }


  /* ─────────────────────────────────────────────
     2️⃣ Gallery (FINAL CORRECT VERSION)
  ───────────────────────────────────────────── */
  if (Array.isArray(payload.gallerySummary)) {
    const galleryJson = payload.gallerySummary
      .map((item) => {
        const isBlob = item.url?.startsWith("blob:");

        // Append new files
        if (item.file instanceof File) {
          fd.append("galleryFiles", item.file);
        }

        // Skip invalid entries
        if (!(item.file instanceof File) && (!item.url || isBlob)) {
          return null;
        }

        return {
          title: item.title || "",
          category: item.category || "",
          order: Number(item.order || 0),
          filename: item.file instanceof File ? item.file.name : item.filename,
          ...(item.url && !isBlob ? { url: item.url } : {}),
        };
      })
      .filter(Boolean); // remove null entries

    fd.append("gallerySummary", JSON.stringify(galleryJson));
  }

  /* ─────────────────────────────────────────────
     3️⃣ Other Files
  ───────────────────────────────────────────── */
  if (payload.aboutImage instanceof File) {
    fd.append("aboutImage", payload.aboutImage);
  }

  if (payload.heroImage instanceof File) {
    fd.append("heroImage", payload.heroImage);
  }

  if (payload.logo instanceof File) {
    fd.append("logo", payload.logo);
  }


  console.log("🔥 FINAL BROCHURE PAYLOAD:", payload.brochure);

  if (payload.brochure?.file instanceof File) {
    console.log("✅ Appending NEW brochure:", payload.brochure.file.name);
    fd.append("brochure", payload.brochure.file);
  } else {
    console.error("❌ brochure NOT appended:", payload.brochure);
  }

  /* ─────────────────────────────────────────────
     4️⃣ Simple Fields
  ───────────────────────────────────────────── */
  const simpleFields = [
    "title",
    "color",
    "priceFrom",
    "priceTo",
    "heroDescription",
    "heroTagline",
    "heroSubTagline",
    "amenities",
    "aboutSummary",
    "categoryType",
    "propertyType",
    "adreess",
    "state",
    "city",
    "locality",

    // ✅ ADD THESE
    "totalTowers",
    "totalFloors",
    "projectArea",
    "totalUnits",
    "availableUnits",
    "possessionDate",
    "reraNumber",
    "redirectUrl",
    "banksApproved",
    
  ];

  simpleFields.forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== null) {
      const val = payload[key];
      fd.append(
        key,
        typeof val === "object" ? JSON.stringify(val) : String(val),
      );
    }
  });

  /* ─────────────────────────────────────────────
   Specifications
───────────────────────────────────────────── */
  if (Array.isArray(payload.specifications)) {
    const specsJson = payload.specifications.map((group, index) => ({
      category: group.category,
      order: Number(group.order ?? index),
      items: (group.items || []).map((item) => ({
        title: item.title || "",
        description: item.description || "",
      })),
    }));

    fd.append("specifications", JSON.stringify(specsJson));
  }

  /* ─────────────────────────────────────────────
     5️⃣ Send PATCH
  ───────────────────────────────────────────── */

  /* ─────────────────────────────────────────────
   Location (SAFE NORMALIZATION)
───────────────────────────────────────────── */
  if (payload.location) {
    const safeLocation = {
      ...payload.location,
      coordinates: (payload.location.coordinates || []).map((c) =>
        typeof c === "string" ? Number(c) : c,
      ),
    };

    fd.append("location", JSON.stringify(safeLocation));
  }

  /* ─────────────────────────────────────────────
   Nearby Places (SAFE NORMALIZATION)
───────────────────────────────────────────── */
  if (Array.isArray(payload.nearbyPlaces)) {
    const safePlaces = payload.nearbyPlaces.map((p) => ({
      ...p,
      coordinates: (p.coordinates || []).map((c) =>
        typeof c === "string" ? Number(c) : c,
      ),
    }));

    fd.append("nearbyPlaces", JSON.stringify(safePlaces));
  }

  /* ─────────────────────────────────────────────
   6️⃣ YouTube Videos (🔥 MISSING FIX)
───────────────────────────────────────────── */
  if (Array.isArray(payload.youtubeVideos)) {
    const videosJson = payload.youtubeVideos.map((v, index) => ({
      title: v.title || "",
      url: v.url || "",
      order: Number(v.order ?? index),
    }));

    fd.append("youtubeVideos", JSON.stringify(videosJson));
  }

   
  

  try {
    const res = await authAxios.patch(API_ENDPOINTS.PROPERTY_DETAILS(id), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    
    return res.data;

  } catch (error) {
    console.error("❌ PATCH ERROR:", error.response?.data || error);
    throw error;
  }
};;



