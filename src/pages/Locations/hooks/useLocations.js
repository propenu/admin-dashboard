// frontend/admin-dashboard/src/pages/Locations/hooks/useLocations.jsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchLocationsService,
  createLocationService,
  editLocationService,
  deleteLocationService,
  deleteLocalityService,
} from "../../../services/LocationsServices/LocationServices";

function extractApiError(err, fallback = "Operation failed") {
  const data = err?.response?.data;

  if (data && typeof data === "object") {
    if (data.code === "PERMISSION_REQUIRED" || data.requiredPermission) {
      return {
        message: data.message || data.error || fallback,
        error: data.error || data.message || fallback,
        code: data.code || "PERMISSION_REQUIRED",
        requiredPermission: data.requiredPermission,
        yourRole: data.yourRole,
        yourRoleLabel: data.yourRoleLabel,
        allowedRoles: data.allowedRoles || [],
        howToGetAccess: data.howToGetAccess || "",
      };
    }

    const msg = data.error || data.message;
    if (msg) {
      return {
        message: msg,
        error: msg,
        code: data.code || "",
        requiredPermission: data.requiredPermission || "",
        yourRole: data.yourRole || "",
        yourRoleLabel: data.yourRoleLabel || "",
        allowedRoles: data.allowedRoles || [],
        howToGetAccess: data.howToGetAccess || "",
      };
    }
  }

  if (typeof data === "string" && data.trim()) {
    return { message: data, allowedRoles: [], howToGetAccess: "" };
  }

  // Avoid raw axios "Request failed with status code 403" when body is empty
  const status = err?.response?.status;
  if (status === 403) {
    return {
      message:
        "Access denied (403). Restart user-service, then log out and log in again. If it continues, ask Super Admin to confirm your role has location:view.",
      code: "PERMISSION_REQUIRED",
      requiredPermission: "location:view | location:update",
      allowedRoles: [],
      howToGetAccess:
        "Super Admin / Admin are always allowed after user-service restart. Other staff need location:view on their role (sidebar Locations).",
    };
  }

  return {
    message: fallback,
    allowedRoles: [],
    howToGetAccess: "",
  };
}

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
    } catch (err) {
      setErrorMsg(extractApiError(err, "Failed to fetch locations"));
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
        if (!id) {
          setErrorMsg({
            message: "Missing location id — close and open Edit again.",
            allowedRoles: [],
            howToGetAccess: "",
          });
          return;
        }
        await editLocationService(id, payload);
        setSuccessMsg("Location updated successfully");
      }

      fetchLocations();
    } catch (err) {
      console.error("saveLocation failed:", err?.response?.status, err?.response?.data || err);
      setErrorMsg(extractApiError(err, "Operation failed"));
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
    } catch (err) {
      setErrorMsg(extractApiError(err, "Failed to delete city"));
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
    } catch (err) {
      setErrorMsg(extractApiError(err, "Failed to delete locality"));
    } finally {
      setLoading(false);
    }
  };

  /** Toggle only locality Home — does not change city isHome */
  const toggleLocalityHome = async ({ city, locality }) => {
    if (!city?._id || !locality?.name) return false;
    setErrorMsg("");
    const nextHome = locality.isHome !== true;
    const successText = nextHome
      ? `Locality “${locality.name}” → Home Active`
      : `Locality “${locality.name}” → Home Hidden`;
    try {
      await editLocationService(city._id, {
        originalLocalityName: locality.name,
        locality: {
          name: locality.name,
          isHome: nextHome,
          ...(Array.isArray(locality.location?.coordinates)
            ? {
                location: {
                  coordinates: locality.location.coordinates,
                },
              }
            : {}),
        },
      });
      setSuccessMsg(successText);
      toast.success(successText);
      // Refresh without flipping global `loading` (keeps list interactive)
      const res = await fetchLocationsService();
      setData(res);
      return true;
    } catch (err) {
      const msg = extractApiError(err, "Failed to update locality Home");
      setErrorMsg(msg);
      toast.error(typeof msg === "string" ? msg : msg?.message || "Failed to update locality Home");
      return false;
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
    toggleLocalityHome,
  };
}
