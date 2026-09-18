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
      try {
        const res = await getAllUsers(params);
        const payload = res?.data;
        // API may return a bare array or { data: [...] }
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.users)) return payload.users;
        return [];
      } catch (err) {
        console.warn("team-directory users query failed", err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
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
