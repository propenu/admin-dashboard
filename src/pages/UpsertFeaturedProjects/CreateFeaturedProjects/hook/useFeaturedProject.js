import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createFeaturedProperty } from "../../../../features/property/propertyService";
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
        localStorage.removeItem("featuredPayload");
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

  // ✅ SAVE ON CHANGE
  // useEffect(() => {
  //   localStorage.setItem("featuredPayload", JSON.stringify(payload));
  // }, [payload]);

  useEffect(() => {
    const safePayload = {
      ...payload,
      galleryFiles: [],

    };

    localStorage.setItem("featuredPayload", JSON.stringify(safePayload));
  }, [payload]);

  const updatePayload = (patch) => {
    setPayload((p) => ({ ...p, ...patch }));
  };

  const replacePayload = (key, value) => {
    setPayload((p) => ({ ...p, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
    const galleryFiles = await getAllGalleryImages();
    
    
    const otherImages = await getAllOtherImages();

    const getKey = (val) => (typeof val === "string" ? val : val?.key);

    const hero = getKey(payload.heroImage)
      ? otherImages[getKey(payload.heroImage)]
      : null;

    const logo = getKey(payload.logo)
      ? otherImages[getKey(payload.logo)]
      : null;

    const about = getKey(payload.aboutImage)
      ? otherImages[getKey(payload.aboutImage)]
      : null;

      const updatedBhkSummary = (payload.bhkSummary || []).map((b) => ({
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
      galleryFiles,
      heroImage: hero,
      logo,
      aboutImage: about,
      bhkSummary: updatedBhkSummary,
    };

     

    const formData = buildFormData(updatedPayload);
    const config = getUploadProgressConfig(setProgress);

    return createFeaturedProperty(formData, config);
  },


    onSuccess: async () => {
      toast.success("Property created successfully ✅");

      //await clearAllImages();

      //localStorage.removeItem("featuredPayload");
      setProgress(0);

      navigate("/featured-properties");
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
  };
};