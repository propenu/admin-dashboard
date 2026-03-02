// src/features/property/common/userService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

//UserSerach
export const getUserSearch = (query) => {
    return apiClient.get(`${SERVICES.USER}/auth/search?q=${query}`);
};

//Manage Team Members
export const getManagerAndTeamMembers = (id) => {
    return apiClient.get(
      `${SERVICES.USER}/auth/manager-team-details/${id}`,
    );
}



