// frontend/admin-dashboard/src/services/LocationsServices/LocationServices.jsx

import {
  LOCATION_API_ENDPOINTS,
  LOCATION_API_CONFIG,
} from "../../config/locationApi";

import authAxios from "../../config/authApi";

/* ---------------------------------------
   GET ALL LOCATIONS
---------------------------------------- */
export const fetchLocationsService = async () => {
  const response = await authAxios.get(
    LOCATION_API_ENDPOINTS.ALL_LOCATIONS,
    LOCATION_API_CONFIG,
  );
  return response.data;
};

/* ---------------------------------------
   CREATE LOCATION
---------------------------------------- */
export const createLocationService = async (data) => {
  const response = await authAxios.post(
    LOCATION_API_ENDPOINTS.ALL_LOCATIONS,
    data,
    LOCATION_API_CONFIG,
  );
  return response.data;
};

/* ---------------------------------------
   EDIT LOCATION BY ID
---------------------------------------- */
export const editLocationService = async (id, data) => {
  const response = await authAxios.patch(
    LOCATION_API_ENDPOINTS.EDITLOCATION_BY_ID(id),
    data,
    LOCATION_API_CONFIG,
  );
  return response.data;
};

/* ---------------------------------------
   DELETE LOCATION BY ID
---------------------------------------- */
export const deleteLocationService = async (id) => {
  const response = await authAxios.delete(
    LOCATION_API_ENDPOINTS.DELETELOCATION_BY_ID(id),
    LOCATION_API_CONFIG,
  );
  return response.data;
};


/* ---------------------------------------
   DELETE LOCALITY (BY LOCATION ID + NAME)
---------------------------------------- */
export const deleteLocalityService = async ({ locationId, localityName }) => {
  const response = await authAxios.delete(
    LOCATION_API_ENDPOINTS.DELETELOCALITY_BY_ID(locationId, localityName),
    LOCATION_API_CONFIG,
  );

  return response.data;
};
