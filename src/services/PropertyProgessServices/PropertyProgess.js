import authAxios from "../../config/authApi";

import { PROPERTY_PROFILE_PROGRESS_API_ENDPOINTS } from "../../config/PropertyProfileProgressApi";

export const fetchResidentialPropertyProgress = async () => {
    try {
        const res = await authAxios.get(PROPERTY_PROFILE_PROGRESS_API_ENDPOINTS.GET_PROPERTY_PROFILE_PROGRESS_RESIDENTIAL);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch residential property progress:", err);
        throw new Error(err.response?.data?.message || "Failed to load residential property progress");
    }
};

export const fetchCommercialPropertyProgress = async () => {
    try {
        const res = await authAxios.get(PROPERTY_PROFILE_PROGRESS_API_ENDPOINTS.GET_PROPERTY_PROFILE_PROGRESS_COMMERCIAL);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch commercial property progress:", err);
        throw new Error(err.response?.data?.message || "Failed to load commercial property progress");
    }
};


export const fetchAgriculturalPropertyProgress = async () => {
    try {
        const res = await authAxios.get(PROPERTY_PROFILE_PROGRESS_API_ENDPOINTS.GET_PROPERTY_PROFILE_PROGRESS_AGRICULTURAL);    
        return res.data;
    } catch (err) {
        console.error("Failed to fetch agricultural property progress:", err);
        throw new Error(err.response?.data?.message || "Failed to load agricultural property progress");
    }
};


export const fetchLandPropertyProgress = async () => {
    try {
        const res = await authAxios.get(PROPERTY_PROFILE_PROGRESS_API_ENDPOINTS.GET_PROPERTY_PROFILE_PROGRESS_LAND);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch land property progress:", err);
        throw new Error(err.response?.data?.message || "Failed to load land property progress");
    }
};