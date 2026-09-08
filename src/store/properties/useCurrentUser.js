import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../../features/user/userService";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const res = await getUserDetails();
      return res.data;
    },
    // Permissions change often from Role Permissions — always prefer fresh /me.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};
