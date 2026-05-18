// src/features/property/hooks/useFeaturedProjects.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeaturedProjectsByType,
  deleteFeaturedProject,
  expireProject,
  resetProject,
  updateProjectRank,
  promoteProjectWithRank,
} from "../../../../features/property/propertyService";
import { toast } from "sonner";

/**
 * Central hook for any featured-project type.
 * @param {"prime"|"featured"|"normal"|"sponsored"} type
 */
export function useFeaturedProjects(type) {
  const queryClient = useQueryClient();
  const queryKey = ["featuredProjects", type];

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getFeaturedProjectsByType(type),
    select: (res) => res?.data?.items ?? [],
  });

  const properties = data ?? [];

  const sortedProperties = [...properties].sort((a, b) => {
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  const invalidate = () => queryClient.invalidateQueries(queryKey);

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFeaturedProject(id),
    onSuccess: () => {
      toast.success("Property deleted successfully");
      invalidate();

      // Refresh all property lists
      queryClient.invalidateQueries(["featuredProjects"]);
    },
    onError: () => toast.error("Failed to delete property"),
  });

  

  //  const promoteMutation = useMutation({
  //    mutationFn: async ({ id, newType }) => {
  //      const res = await getFeaturedProjectsByType(newType);

  //      const targetProjects = res?.data?.items || [];

  //      const maxRank = Math.max(
  //        0,
  //        ...targetProjects.map((p) => Number(p.rank) || 0),
  //      );

  //      const nextRank = maxRank + 1;

  //      return promoteProjectWithRank(id, {
  //        type: newType,
  //        rank: nextRank,
  //      });
  //    },

  //    onSuccess: () => {
  //      toast.success("Property promoted successfully");

  //      invalidate();

  //      queryClient.invalidateQueries({
  //        queryKey: ["featuredProjects"],
  //      });
  //    },

  //    onError: (error) => {
  //      toast.error(
  //        error?.response?.data?.message || "Failed to promote property",
  //      );
  //    },
  //  });

  // ── EXPIRE ─────────────────────────────────────────────────────────────────
  

  // const promoteMutation = useMutation({
  //   mutationFn: async ({ id, newType }) => {
  //     try {
  //       console.log("=================================");
  //       console.log("PROMOTION START");
  //       console.log("Project ID:", id);
  //       console.log("Target Type:", newType);

  //       // STEP 1 — Fetch target type projects
  //       const res = await getFeaturedProjectsByType(newType);

  //       console.log("Fetched Projects Response:", res);

  //       const targetProjects = res?.data?.items || [];

  //       console.log("Target Projects:", targetProjects);

  //       // STEP 2 — Debug ranks
  //       const rankList = targetProjects.map((p) => ({
  //         id: p._id,
  //         title: p.title,
  //         rank: p.rank,
  //         type: p?.promotion?.type,
  //       }));

  //       console.table(rankList);

  //       // STEP 3 — Calculate max rank
  //       const maxRank = Math.max(
  //         0,
  //         ...targetProjects.map((p) => Number(p.rank) || 0),
  //       );

  //       console.log("Calculated Max Rank:", maxRank);

  //       // STEP 4 — Next rank
  //       const nextRank = maxRank + 1;

  //       console.log("Calculated Next Rank:", nextRank);

  //       // STEP 5 — Final payload
  //       const payload = {
  //         type: newType,
  //         rank: nextRank,
  //       };

  //       console.log("Final Payload:", payload);

  //       // STEP 6 — Promote API call
  //       const promoteRes = await promoteProjectWithRank(id, payload);

  //       console.log("Promotion API Full Response:", promoteRes);

  //       console.log("Promotion API Response Data:", promoteRes?.data);

  //       console.log("Updated Project From Backend:", promoteRes?.data?.data);

  //       console.log("Updated Project Rank:", promoteRes?.data?.data?.rank);

  //       console.log(
  //         "Updated Project Promotion:",
  //         promoteRes?.data?.data?.promotion,
  //       );

  //       console.log("PROMOTION END");
  //       console.log("=================================");

  //       return promoteRes;
  //     } catch (error) {
  //       console.log("=================================");
  //       console.log("PROMOTION ERROR");

  //       console.error("Full Error:", error);

  //       console.error("Backend Error Data:", error?.response?.data);

  //       console.error("Backend Error Status:", error?.response?.status);

  //       console.error("Backend Error Message:", error?.response?.data?.message);

  //       console.log("=================================");

  //       throw error;
  //     }
  //   },

  //   onSuccess: (data) => {
  //     console.log("Mutation Success:", data);

  //     toast.success("Property promoted successfully");

  //     invalidate();

  //     queryClient.invalidateQueries({
  //       queryKey: ["featuredProjects"],
  //     });
  //   },

  //   onError: (error) => {
  //     console.log("Mutation Error:", error);

  //     toast.error(
  //       error?.response?.data?.message || "Failed to promote property",
  //     );
  //   },
  // });
  

  

  const promoteMutation = useMutation({
    mutationFn: async ({ id, newType }) => {
      // STEP 1 — fetch target type projects
      const res = await getFeaturedProjectsByType(newType);

      const targetProjects = res?.data?.items || [];

      // STEP 2 — calculate next rank
      const maxRank = Math.max(
        0,
        ...targetProjects.map((p) => Number(p.rank) || 0),
      );

      const nextRank = maxRank + 1;

      console.log("Next Rank:", nextRank);

      // STEP 3 — update promotion type
      await promoteProjectWithRank(id, {
        type: newType,
      });

      console.log("Promotion Updated");

      // STEP 4 — update rank separately
      await updateProjectRank(id, nextRank);

      console.log("Rank Updated");

      return {
        success: true,
        rank: nextRank,
      };
    },

    onSuccess: (data) => {
      console.log("FINAL SUCCESS:", data);

      toast.success("Property promoted successfully");

      invalidate();

      queryClient.invalidateQueries({
        queryKey: ["featuredProjects"],
      });
    },

    onError: (error) => {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to promote property",
      );
    },
  });
  
  const expireMutation = useMutation({
    mutationFn: (id) => expireProject(id),
    onSuccess: () => {
      toast.success("Property expired");
      invalidate();
    },
    onError: () => toast.error("Failed to expire property"),
  });

  // ── RESET ──────────────────────────────────────────────────────────────────
  const resetMutation = useMutation({
    mutationFn: (id) => resetProject(id),
    onSuccess: () => {
      toast.success("Property reset successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to reset property"),
  });

  // ── RANK UPDATE ────────────────────────────────────────────────────────────
  const rankMutation = useMutation({
    mutationFn: ({ id, rank }) => updateProjectRank(id, rank),
    onSuccess: () => {
      toast.success("Rank updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update rank"),
  });

  return {
    properties,
    sortedProperties,
    isLoading,
    isError,
    refetch,
    invalidate,
    deleteMutation,
    promoteMutation,
    expireMutation,
    resetMutation,
    rankMutation,
  };
}
