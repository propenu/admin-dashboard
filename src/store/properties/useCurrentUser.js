import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../../features/user/userService";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const res = await getUserDetails();
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
