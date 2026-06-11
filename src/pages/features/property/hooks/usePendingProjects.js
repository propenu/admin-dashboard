// hooks/usePendingProjects.js
import { useQuery } from "@tanstack/react-query";
import { getSalesManagerPeddingProjects } from "../../../../features/property/propertyService";

export const usePendingProjects = (options = {}) => {
  return useQuery({
    queryKey: ["pending-projects"],
    queryFn: async () => {
      const res = await getSalesManagerPeddingProjects();
      return res.data;
    },
    enabled: options.enabled,
  });
};