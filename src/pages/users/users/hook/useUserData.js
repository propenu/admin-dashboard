import { useQuery } from "@tanstack/react-query";
import {
  getAllUsers,
  getUserSearch,
} from "../../../../features/user/userService";

/* ===============================
   🔹 GET ALL USERS
================================ */
export const useUsers = (params) => {
  return useQuery({
    queryKey: ["users", params || null],
    queryFn: async () => {
      const res = await getAllUsers(params);
      return res.data; // ✅ IMPORTANT
    },
  });
};

/* ===============================
   🔹 SEARCH USERS
================================ */
export const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const res = await getUserSearch(query);
      return res.data; // ✅ IMPORTANT
    },
    enabled: !!query, // run only if query exists
  });
};
