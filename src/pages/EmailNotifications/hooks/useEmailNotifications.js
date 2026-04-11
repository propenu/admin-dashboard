// //src/pages/EmailNotifications/hooks/useEmailNotifications.jsx
// import {  useState } from "react";
// import { toast } from "sonner";
// import {
//   createEmailNotification,
//   deleteEmailNotification,
//   getAllEmailNotifications,
//   sentEmailNotification,
//   updateEmailNotification,
// } from "../../../features/user/userService";


// export const useEmailNotifications = () => {
//     const [notifications,  setNotifications]  = useState([]);
//     const [loading,        setLoading]        = useState(true);
//     const [submitting,     setSubmitting]     = useState(false);
//       const [deleting,       setDeleting]       = useState(false);

// const fetchAll = async () => {
    
//   try {
//     setLoading(true);
//     const res = await getAllEmailNotifications();
//     const list = Array.isArray(res?.data?.data)
//       ? res.data.data
//       : Array.isArray(res?.data)
//         ? res.data
//         : [];
//     setNotifications(list);
//   } catch {
//     toast.error("Failed to fetch email notifications");
//     setNotifications([]);
//   } finally {
//     setLoading(false);
//   }
// };

 

// const handleCreate = async (payload, onSuccess) => {
//   try {
//     setSubmitting(true);
//     await createEmailNotification(payload);
//     toast.success("Template created!");
//     fetchAll();
//     onSuccess?.();
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Failed to create");
//   } finally {
//     setSubmitting(false);
//   }
// };


// const handleUpdate = async (id, payload) => {
//   try {
//     setSubmitting(true);

//     await updateEmailNotification(id, payload);

//     toast.success("Template updated!");
//     fetchAll();
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Failed to update");
//   } finally {
//     setSubmitting(false);
//   }
// };

// const handleDelete = async (id, onSuccess) => {
//   try {
//     setDeleting(true);

//     const res = await deleteEmailNotification(id);

//     if (res?.data?.success) {
//       toast.success(res.data.message || "Deleted!");
//       fetchAll();
//       onSuccess?.();
//     } else {
//       throw new Error(res?.data?.message || "Delete failed");
//     }
//   } catch (err) {
//     toast.error(
//       err?.response?.data?.message || err?.message || "Failed to delete",
//     );
//   } finally {
//     setDeleting(false);
//   }
// };



// const handleSendCampaign = async (payload) => {
//   try {
//     setSubmitting(true);

//     const res = await sentEmailNotification(payload);

//     // 🔥 validate response
//     if (res?.data?.success) {
//       toast.success(res.data.message || "Email campaign sent 🚀");
//     } else {
//       throw new Error(res?.data?.message || "Failed");
//     }
//   } catch (err) {
//     toast.error(
//       err?.response?.data?.message || err?.message || "Failed to send",
//     );
//   } finally {
//     setSubmitting(false);
//   }
// };

// return {
//   fetchAll,
//   handleCreate,
//   handleUpdate,
//   handleDelete,
//   handleSendCampaign,
//   notifications,
//   loading,
//   submitting,
//   deleting,
// };
// }




//ci 


// src/pages/EmailNotifications/hooks/useEmailNotifications.js
import { useState } from "react";
import { toast } from "sonner";
import {
  createEmailNotification,
  deleteEmailNotification,
  getAllEmailNotifications,
  sentEmailNotification,
  updateEmailNotification,
} from "../../../features/user/userService";

export const useEmailNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res  = await getAllEmailNotifications();
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setNotifications(list);
    } catch {
      toast.error("Failed to fetch email notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload, onSuccess) => {
    try {
      setSubmitting(true);
      await createEmailNotification(payload);
      toast.success("Template created!");
      fetchAll();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      setSubmitting(true);
      await updateEmailNotification(id, payload);
      toast.success("Template updated!");
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, onSuccess) => {
    try {
      setDeleting(true);
      const res = await deleteEmailNotification(id);
      if (res?.data?.success) {
        toast.success(res.data.message || "Deleted!");
        fetchAll();
        onSuccess?.();
      } else {
        throw new Error(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleSendCampaign = async (payload) => {
    try {
      setSubmitting(true);
      const res = await sentEmailNotification(payload);
      if (res?.data?.success) {
        toast.success(res.data.message || "Email campaign sent 🚀");
      } else {
        throw new Error(res?.data?.message || "Failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    notifications,
    loading,
    submitting,
    deleting,
    fetchAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSendCampaign,
  };
};