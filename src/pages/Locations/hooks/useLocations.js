// frontend/admin-dashboard/src/pages/Locations/hooks/useLocations.jsx
import { useEffect, useState } from "react";
import {
  fetchLocationsService,
  createLocationService,
  editLocationService,
  deleteLocationService,
  deleteLocalityService,
} from "../../../services/LocationsServices/LocationServices";

export default function useLocations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetchLocationsService();
      setData(res);
    } catch {
      setErrorMsg("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  /* ===============================
     ADD / EDIT LOCATION / LOCALITY
  ================================ */
  const saveLocation = async ({ payload, mode, id }) => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "ADD") {
        await createLocationService(payload);
        setSuccessMsg("Location added successfully");
      } else {
        await editLocationService(id, payload);
        setSuccessMsg("Location updated successfully");
      }

      fetchLocations();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     DELETE CITY
  ================================ */
  const deleteLocation = async (id) => {
    setLoading(true);
    try {
      await deleteLocationService(id);
      setSuccessMsg("City deleted successfully");
      fetchLocations();
    } catch {
      setErrorMsg("Failed to delete city");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     DELETE LOCALITY (NEW)
  ================================ */
  const deleteLocality = async ({ locationId, localityName }) => {
    setLoading(true);
    try {
      await deleteLocalityService({ locationId, localityName });
      setSuccessMsg(`Locality '${localityName}' deleted`);
      fetchLocations();
    } catch {
      setErrorMsg("Failed to delete locality");
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    errorMsg,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
    saveLocation,
    deleteLocation, 
    deleteLocality, 
  };
}
