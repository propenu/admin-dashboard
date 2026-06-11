import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {getAllFeaturedProjects,  createFeaturedProject } from "../../../../features/property/propertyService";
import { getUploadProgressConfig } from "../utils/uploadWithProgress";
import { INITIAL_PAYLOAD } from "../Constants/constants";
import { buildFormData } from "../utils/buildFormData";
import { 
  clearAllImages,
  getAllGalleryImages,
  getAllOtherImages,
} from "../utils/indexedDB";        

export const useFeaturedProject = (projectType) => {
  const navigate = useNavigate();

  const [payload, setPayload] = useState(() => {
    const saved = localStorage.getItem("featuredPayload");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return {
          ...parsed,
          galleryFiles: [], // reset files after refresh
        };
      } catch {
        //localStorage.removeItem("featuredPayload");
      }
    }

    return {
      ...INITIAL_PAYLOAD,
      heroImagePreview: "",
      logoPreview: "",
      aboutImagePreview: "",
      isFeatured: projectType === "featured",
    };
  });

  const [progress, setProgress] = useState(0);

  const clearDraft = async () => {
    try {
      console.log("🧹 Clearing draft...");

      // ✅ Clear localStorage
      //localStorage.removeItem("featuredPayload");
     // localStorage.removeItem("featured_step");
     // localStorage.removeItem("featured_max_completed");

      // ✅ Clear IndexedDB
      await clearAllImages();

      // ✅ Reset payload
      setPayload({
        ...INITIAL_PAYLOAD,
        heroImagePreview: "",
        logoPreview: "",
        aboutImagePreview: "",
        isFeatured: projectType === "featured",
      });

      // ✅ Reset progress
      setProgress(0);

      toast.success("Draft cleared successfully ✅");

      console.log("✅ Draft cleared");
    } catch (err) {
      console.error("❌ Clear draft failed", err);

      toast.error("Failed to clear draft ❌");
    }
  };

  useEffect(() => {
    // ✅ REMOVE HEAVY DATA
    const cleanedProjectSummary = (payload.projectSummary || []).map((b) => ({
      ...b,

      units: (b.units || []).map((u) => ({
        ...u,

        // ❌ REMOVE BASE64 PREVIEW
        planPreview: "",

        // ✅ STORE ONLY KEY
        planFile:
          typeof u.planFile === "object"
            ? { key: u.planFile?.key }
            : u.planFile,
      })),
    }));

    const safePayload = {
      ...payload,

      // ✅ CLEANED SUMMARY
      projectSummary: cleanedProjectSummary,

      // ❌ DO NOT STORE FILE ARRAY
      galleryFiles: [],

      // ❌ REMOVE BASE64 IMAGES
      heroImagePreview: "",
      logoPreview: "",
      aboutImagePreview: "",

      // ✅ STORE ONLY IMAGE KEYS
      heroImage:
        typeof payload.heroImage === "object"
          ? { key: payload.heroImage?.key }
          : payload.heroImage,

      logo:
        typeof payload.logo === "object"
          ? { key: payload.logo?.key }
          : payload.logo,

      aboutImage:
        typeof payload.aboutImage === "object"
          ? { key: payload.aboutImage?.key }
          : payload.aboutImage,

      brochure:
        typeof payload.brochure === "object"
          ? { key: payload.brochure?.key }
          : payload.brochure,
    };

    try {
      localStorage.setItem("featuredPayload", JSON.stringify(safePayload));
    } catch (err) {
      console.error("❌ LocalStorage Full:", err);

      toast.error("Storage limit exceeded. Large previews removed.");
    }
  }, [payload]);

  const updatePayload = (patch) => {
    setPayload((p) => ({ ...p, ...patch }));
  };

  const replacePayload = (key, value) => {
    setPayload((p) => ({ ...p, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      // ✅ GET ALL PROJECTS
      const projectsRes = await getAllFeaturedProjects();

      console.log("PROJECTS =>", projectsRes);

      // ✅ TOTAL PROJECT COUNT
      const totalProjects =
        projectsRes?.data?.items?.filter(
          (item) => item?.promotion?.type === "normal",
        )?.length || 0;

      // ✅ NEXT RANK
      const nextRank = totalProjects + 1;

      console.log("NEXT RANK =>", nextRank);

      // ---------------------------------------------- //
      const galleryFiles = await getAllGalleryImages();

      const otherImages = await getAllOtherImages();

      const getKey = (val) => (typeof val === "string" ? val : val?.key);

      const brochureKey = getKey(payload.brochure);

      const brochureFile =
        brochureKey && otherImages[brochureKey]
          ? otherImages[brochureKey]
          : null;

      const hero = getKey(payload.heroImage)
        ? otherImages[getKey(payload.heroImage)]
        : null;

      const logo = getKey(payload.logo)
        ? otherImages[getKey(payload.logo)]
        : null;

      const about = getKey(payload.aboutImage)
        ? otherImages[getKey(payload.aboutImage)]
        : null;

      const updatedProjectSummary = (payload.projectSummary || []).map((b) => ({
        ...b,

        units: (b.units || []).map((u) => {
          const key =
            typeof u.planFile === "string" ? u.planFile : u.planFile?.key;

          return {
            ...u,

            planFile: key
              ? {
                  key,
                  file: otherImages[key],
                }
              : null,
          };
        }),
      }));

      const updatedPayload = {
        ...payload,

        rank: nextRank,

        galleryFiles,

        heroImage: hero,

        logo,

        aboutImage: about,

        projectSummary: updatedProjectSummary,

        brochure: brochureFile,
      };

      const formData = await buildFormData(updatedPayload);
      const config = getUploadProgressConfig(setProgress);

      return createFeaturedProject(formData, config);
    },


    onSuccess: async () => {
      toast.success("Property created successfully ✅");

   //  await clearAllImages();

      //localStorage.removeItem("featuredPayload");
     // localStorage.removeItem("featured_step");
     // localStorage.removeItem("featured_max_completed");
      setProgress(0);

      navigate("/Projects");
    },

    onError: (err) => {
      toast.error(err?.message || "Something went wrong ❌");
    },
  });

   

  return {
    payload,
    setPayload,
    updatePayload,
    replacePayload,
    submit: mutation.mutate,
    isLoading: mutation.isPending,
    progress,
    clearDraft,
  };
};