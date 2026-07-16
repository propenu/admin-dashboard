import { getFileFromKey } from "./indexedDB";
export async function buildFormData(payload) {
  const fd = new FormData();

  /* ─────────────────────────────────────────────
     1️⃣ Projec Summary
  // ───────────────────────────────────────────── */
  const bhkPlanFiles = [];
  const projectSummary = await Promise.all(
    (payload.projectSummary || []).map(async (b) => ({
      bhk: Number(b.bhk || 0),

      // ✅ LABEL
      label: b.label || "",

      units: await Promise.all(
        (b.units || []).map(async (u) => {
          let file = null;

          // ✅ BEFORE REFRESH
          if (u.planFile?.file instanceof File) {
            file = u.planFile.file;
          }

          // ✅ AFTER REFRESH
          else if (u.planFile?.key) {
            file = await getFileFromKey(u.planFile.key, "other");
          }

          // ✅ FILE EXISTS
          if (file) {
            const index = bhkPlanFiles.length;

            // ✅ STORE FILE
            bhkPlanFiles.push(file);

            return {
              // ✅ SQFT
              minSqft: Number(u.minSqft || 0),

              maxSqft: Number(u.maxSqft || 0),

              // ✅ PRICE
              minPrice: Number(u.minPrice || 0),

              //maxPrice: Number(u.maxPrice || 0),
              ...(payload.categoryType !== "land" && {
                maxPrice: Number(u.maxPrice || 0),
              }),

              // ✅ COUNT
              availableCount: Number(u.availableCount || 0),

              // ✅ AREA
              area: {
                value: Number(u.area?.value || 0),

                unit: u.area?.unit || "sqft",

                sqftValue: Number(u.area?.sqftValue || 0),
              },

              // ✅ BACKEND FILE INDEX
              planFileIndex: index,

              // ✅ FILE NAME
              planFileName: file.name,
            };
          }

          // ✅ WITHOUT FILE
          return {
            minSqft: Number(u.minSqft || 0),

            maxSqft: Number(u.maxSqft || 0),

            minPrice: Number(u.minPrice || 0),

            maxPrice: Number(u.maxPrice || 0),

            availableCount: Number(u.availableCount || 0),

            area: {
              value: Number(u.area?.value || 0),

              unit: u.area?.unit || "sqft",

              sqftValue: Number(u.area?.sqftValue || 0),
            },

            // ✅ EXISTING IMAGE
            planFileName: u.planFileName || "",
          };
        }),
      ),
    })),
  );

  if (!payload.title?.trim() || !payload.address?.trim()) {
    throw new Error("Title and Address are required");
  }
  fd.append("title", payload.title);
  fd.append("address", payload.address);

  [
    "heroTagline",
    "heroSubTagline",
    "heroDescription",
    "city",
    "state",
    "locality",
    "currency",
    "color",
    "metaTitle",
    "metaDescription",
    "metaKeywords",
    "possessionDate",
    "reraNumber",
    "createdBy",
    "relationshipManagerId",
    "status",
    "mapEmbedUrl",
    "redirectUrl",
  ].forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== null) {
      fd.append(key, payload[key]);
    }
  });


  
  // ✅ rank
  if (payload.rank !== undefined) {
    fd.append("rank", Number(payload.rank));
  }

  console.log("payload =>",  payload.rank);
  // ✅ categoryType
  if (payload.categoryType !== undefined) {
    fd.append("categoryType", payload.categoryType);
  }

  if (payload.propertyType !== undefined) {
    fd.append("propertyType", payload.propertyType);
  }

  // ✅ totalTowers
  if (payload.totalTowers !== undefined) {
    fd.append("totalTowers", Number(payload.totalTowers));
  }

  // ✅ totalFloors
  if (payload.totalFloors) {
    fd.append("totalFloors", payload.totalFloors);
  }

  // ✅ projectArea
  if (payload.projectArea !== undefined) {
    fd.append("projectArea", Number(payload.projectArea));
  }

  // ✅ totalUnits
  if (payload.totalUnits !== undefined) {
    fd.append("totalUnits", Number(payload.totalUnits));
  }

  // ✅ availableUnits
  if (payload.availableUnits !== undefined) {
    fd.append("availableUnits", Number(payload.availableUnits));
  }

  fd.append("isFeatured", payload.isFeatured ? "true" : "false");
  if (payload.sqftRange) {
    fd.append(
      "sqftRange",
      JSON.stringify({
        min: Number(payload.sqftRange.min || 0),
        max: Number(payload.sqftRange.max || 0),
      }),
    );
  }

  fd.append("projectSummary", JSON.stringify(projectSummary));
  if (payload.amenities?.length)
    fd.append("amenities", JSON.stringify(payload.amenities));
  if (payload.specifications?.length)
    fd.append("specifications", JSON.stringify(payload.specifications));
  if (payload.nearbyPlaces?.length) {
    const nearbyPlaces = payload.nearbyPlaces.map((place) => {
      const hasCoordinates =
        Array.isArray(place.coordinates) && place.coordinates.length >= 2;

      if (hasCoordinates) return place;

      return { ...place, coordinates: [0, 0] };
    });

    fd.append("nearbyPlaces", JSON.stringify(nearbyPlaces));
  }
  if (payload.banksApproved?.length)
    fd.append("banksApproved", JSON.stringify(payload.banksApproved));

  fd.append("gallerySummary", JSON.stringify(payload.gallerySummary || []));

  if (payload.aboutSummary?.length)
    fd.append("aboutSummary", JSON.stringify(payload.aboutSummary));
  if (payload.leads?.length) fd.append("leads", JSON.stringify(payload.leads));
  if (payload.relatedProjects?.length)
    fd.append("relatedProjects", JSON.stringify(payload.relatedProjects));

  if (payload.location?.coordinates) {
    fd.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [
          Number(payload.location.coordinates[0]),
          Number(payload.location.coordinates[1]),
        ],
      }),
    );
  }

  const appendFile = async (value, fieldName) => {
    if (!value) {
      console.error("❌ No value for:", fieldName);
      return;
    }

    let file = null;

    // ✅ CASE 1: Direct File (YOUR CURRENT CASE)
    if (value instanceof File) {
      file = value;
      
    }

    // ✅ CASE 2: Object with file
    else if (value.file instanceof File) {
      file = value.file;
      
    }

    // ✅ CASE 3: IndexedDB key
    else if (value.key) {
      file = await getFileFromKey(value.key, "other");
      conso
    }

    if (file instanceof File) {
      
      fd.append(fieldName, file);
    } else {
      console.error("❌ File NOT appended:", fieldName, value);
    }
  };

  await appendFile(payload.heroImage, "heroImage");
  await appendFile(payload.logo, "logo");
  await appendFile(payload.aboutImage, "aboutImage");

  if (payload.brochure instanceof File) fd.append("brochure", payload.brochure);

  if (Array.isArray(payload.galleryFiles)) {
    payload.galleryFiles.forEach((item) => {
      const file = item.file || item;

      if (file instanceof File) {
        fd.append("galleryFiles", file);
      }
    });
  }

  bhkPlanFiles.forEach((file) => fd.append("bhkPlanFiles", file));
  if (payload.youtubeVideos?.length) {
    fd.append("youtubeVideos", JSON.stringify(payload.youtubeVideos));
  }
  for (const pair of fd.entries());

  let totalBytes = 0;

  for (const [key, value] of fd.entries()) {
    if (value instanceof File) {
      totalBytes += value.size;

      console.table({
        field: key,
        file: value.name,
        sizeMB: (value.size / (1024 * 1024)).toFixed(2),
      });
    }
  }

  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log("================================");
  console.log(`TOTAL FILES SENT = ${totalMB} MB`);
  console.log("================================");

  return fd;
}
