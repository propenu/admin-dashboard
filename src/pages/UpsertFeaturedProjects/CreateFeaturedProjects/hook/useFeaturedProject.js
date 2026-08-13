import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getAllFeaturedProjects,
  createFeaturedProjectDraft,
  sendBuilderInviteEmail,
  assignExistingBuilderToProject,
  submitProjectForApproval,
} from "../../../../features/property/propertyService";
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

      const draftRes = await createFeaturedProjectDraft(formData, config);
      const project =
        draftRes?.data?.data || draftRes?.data || draftRes?.project || draftRes;
      const projectId = project?._id || project?.id;

      if (!projectId) {
        throw new Error("Draft created but project id missing");
      }

      const assignMode =
        payload.builderAssignMode === "invite_link"
          ? "invite_link"
          : payload.builderAssignMode === "existing_builder"
            ? "existing_builder"
            : "";

      // No builder at create — draft only (attach later on edit)
      if (!assignMode) {
        return {
          mode: "draft_no_builder",
          projectId,
        };
      }

      // Existing builder → Created By; RM/higher may go live immediately
      if (assignMode === "existing_builder") {
        const builderId = String(payload.createdBy || "").trim();
        if (!builderId) {
          throw new Error("Select an existing builder");
        }

        const assignRes = await assignExistingBuilderToProject(
          projectId,
          builderId,
        );
        const assignData =
          assignRes?.data?.data || assignRes?.data || assignRes || {};

        let approval = null;
        if (
          !assignData?.wentLive &&
          String(assignData?.status || "draft").toLowerCase() === "draft"
        ) {
          try {
            const submitRes = await submitProjectForApproval(projectId);
            approval = submitRes?.data?.data || submitRes?.data || submitRes;
          } catch (submitErr) {
            console.warn("submit-for-approval:", submitErr);
          }
        }

        return {
          mode: "existing_builder",
          projectId,
          assign: assignData,
          approval,
        };
      }

      // Invite path — builder claims via email + OTP
      const emails = (payload.builderInviteEmails || [])
        .map((e) => String(e || "").trim().toLowerCase())
        .filter(Boolean);
      if (!emails.length) {
        throw new Error("Add at least one builder invite email");
      }

      const inviteRes = await sendBuilderInviteEmail(projectId, {
        emails,
        companyName:
          String(payload.builderInviteCompany || "").trim() || undefined,
      });

      return {
        mode: "invite_link",
        projectId,
        invite: inviteRes?.data?.data || inviteRes?.data || inviteRes,
      };
    },


    onSuccess: async (result) => {
      setProgress(0);

      if (result?.mode === "invite_link") {
        const sentCount =
          result?.invite?.sent?.length ||
          (result?.invite?.email ? 1 : 0) ||
          1;
        toast.success(
          `Draft saved & invite sent to ${sentCount} email(s).`,
        );
        navigate("/Projects");
        return;
      }

      if (result?.mode === "existing_builder") {
        if (result?.assign?.wentLive) {
          toast.success("Builder assigned — project is live ✅");
        } else if (result?.approval) {
          toast.success(
            "Builder assigned — submitted for team approval (RM / higher)",
          );
        } else {
          toast.success(
            "Builder assigned. Team can approve from pending projects to go live.",
          );
        }
        navigate("/Projects");
        return;
      }

      if (result?.mode === "draft_no_builder") {
        toast.success(
          "Project draft saved without builder. Attach builder when you edit.",
        );
        navigate("/Projects");
        return;
      }

      toast.success("Property created successfully ✅");
      navigate("/Projects");
    },

    onError: (err) => {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong ❌";
      toast.error(message);
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