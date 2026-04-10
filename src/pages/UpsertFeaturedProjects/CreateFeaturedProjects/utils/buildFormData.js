export function buildFormData(payload) {
  const fd = new FormData();
  
  const bhkPlanFiles = [];

  const bhkSummary = (payload.bhkSummary || []).map((b) => ({
    bhk: Number(b.bhk || 0),
    bhkLabel: b.bhkLabel,
    nits: (b.units || []).map((u) => {
      let file = null;

      // ✅ Case 1: normal flow (before refresh)
      if (u.planFile?.file instanceof File) {
        file = u.planFile.file;
      }

      // ✅ Case 2: direct File (rare case)
      else if (u.planFile instanceof File) {
        file = u.planFile;
      }

      // ✅ If file exists → push to FormData
      if (file) {
        bhkPlanFiles.push(file);

        return {
          minSqft: Number(u.minSqft || 0),
          maxPrice: Number(u.maxPrice || 0),
          availableCount: Number(u.availableCount || 0),
          planFileName: file.name,
        };
      }

      // ❗ Case 3: after refresh (no file, only key/name)
      return {
        minSqft: Number(u.minSqft || 0),
        maxPrice: Number(u.maxPrice || 0),
        availableCount: Number(u.availableCount || 0),
        planFileName: u.planFileName || "plan.jpg",
      };
    }),
  }));

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
    if (payload[key]) fd.append(key, payload[key]);
  });

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
  // if (payload.gallerySummary?.length)
  //   fd.append("gallerySummary", JSON.stringify(payload.gallerySummary));
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


  const appendFile = (key, fieldName) => {
    if (key) {
      const file = key.file || key;
      if (file instanceof File) {
        fd.append(fieldName, file);
      }
    }
  }; 

  appendFile(payload.heroImage, "heroImage");
  appendFile(payload.aboutImage, "aboutImage");
  appendFile(payload.logo, "logo");
  


  // if (payload.heroImage instanceof File)
  //   fd.append("heroImage", payload.heroImage );
  

  // if (payload.aboutImage instanceof File)
  //   fd.append("aboutImage", payload.aboutImage);
  


  if (payload.brochure instanceof File) fd.append("brochure", payload.brochure);
  // if (Array.isArray(payload.galleryFiles)) {
  //   payload.galleryFiles.forEach((f) => {
  //     if (f instanceof File) fd.append("galleryFiles", f);
  //   });
  // }  old
  if (Array.isArray(payload.galleryFiles)) {
    payload.galleryFiles.forEach((item) => {
      const file = item.file || item; 

      if (file instanceof File) {
        fd.append("galleryFiles", file);
      }
    });
  }
  
  bhkPlanFiles.forEach((file) => fd.append("bhkPlanFiles", file));

  
  // if (payload.logo instanceof File) fd.append("logo", payload.logo);

  if (payload.youtubeVideos?.length) {
    fd.append("youtubeVideos", JSON.stringify(payload.youtubeVideos));
  }
  
  

  
  for (const pair of fd.entries())
  return fd;
}