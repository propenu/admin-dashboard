// D:\propenu\frontend\admin-dashboard\src\services\ResidentialServices\CreateResidentialPropertyService.jsx
import authAxios from "../../config/authApi";
import { API_ENDPOINTS } from "../../config/api";
/**
 * @param {FormData} formData
 */
export const postResidential = async (formData) => {
  const res = await authAxios.post(API_ENDPOINTS.RESIDENTIAL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

