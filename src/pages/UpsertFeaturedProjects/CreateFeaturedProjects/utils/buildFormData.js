import { getFileFromKey } from "./indexedDB";
export async function buildFormData(payload) {
  const fd = new FormData();

  const bhkPlanFiles = [];

  const bhkSummary = await Promise.all(
    (payload.bhkSummary || []).map(async (b) => ({
      bhk: Number(b.bhk || 0),
      bhkLabel: b.bhkLabel,
      units: await Promise.all(
        (b.units || []).map(async (u) => {
          let file = null;

          // ✅ Case 1: before refresh
          if (u.planFile?.file instanceof File) {
            file = u.planFile.file;
          }

          // ✅ Case 2: after refresh (THIS IS YOUR FIX)
          else if (u.planFile?.key) {
            file = await getFileFromKey(u.planFile.key, "other");
          }

          if (file) {
            const index = bhkPlanFiles.length;
            bhkPlanFiles.push(file);

            return {
              minSqft: Number(u.minSqft || 0),
              maxPrice: Number(u.maxPrice || 0),
              availableCount: Number(u.availableCount || 0),

              // 🔥 IMPORTANT for backend
              planFileIndex: index,
              planFileName: file.name,
            };
          }

          return {
            minSqft: Number(u.minSqft || 0),
            maxPrice: Number(u.maxPrice || 0),
            availableCount: Number(u.availableCount || 0),
            planFileName: u.planFileName,
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
    "status",
    "mapEmbedUrl",
    "redirectUrl",
  ].forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== null) {
      fd.append(key, payload[key]);
    }
  });

  // ✅ categoryType
  if (payload.categoryType !== undefined) {
    fd.append("categoryType", payload.categoryType);
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

  fd.append("bhkSummary", JSON.stringify(bhkSummary));
  if (payload.amenities?.length)
    fd.append("amenities", JSON.stringify(payload.amenities));
  if (payload.specifications?.length)
    fd.append("specifications", JSON.stringify(payload.specifications));
  if (payload.nearbyPlaces?.length)
    fd.append("nearbyPlaces", JSON.stringify(payload.nearbyPlaces));
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
    if (!value) return;

    let file = null;

    if (value.file instanceof File) {
      file = value.file;
    } else if (value.key) {
      file = await getFileFromKey(value.key, "other");
    }

    if (file instanceof File) {
      fd.append(fieldName, file);
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
  for (const pair of fd.entries()) console.log(pair[0], pair[1]);
  return fd;
}
