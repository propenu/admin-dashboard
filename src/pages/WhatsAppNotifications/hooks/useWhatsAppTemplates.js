import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createWhatsAppNotification,
  deleteWhatsAppNotificationByName,
  getAllWhatsAppNotifications,
} from "../../../features/user/userService";


const getErrorMessage = (err) => {
  const data = err?.response?.data;

  if (!data) return err?.message || "Something went wrong";

  // ⭐ BEST MESSAGE (Meta user-friendly)
  if (data?.message?.error?.error_user_msg)
    return data.message.error.error_user_msg;

  if (data?.message?.error?.message) return data.message.error.message;

  if (data?.error?.message) return data.error.message;

  if (typeof data.message === "string") return data.message;

  return err?.message || "Something went wrong";
};

import { parseTemplateList } from "../utils/parser";

export const useWhatsAppNotificationsTemplate = () => {
  const queryClient = useQueryClient();

  // ✅ FETCH
  const { data: templates = [], isLoading: loading,  refetch, } = useQuery({
    queryKey: ["whatsappTemplates"],
    queryFn: async () => {
      const res = await getAllWhatsAppNotifications();
      return parseTemplateList(res);
    },
  });

  // ✅ CREATE
  const createMutation = useMutation({
    mutationFn: createWhatsAppNotification,
    onSuccess: () => {
      toast.success("Template created successfully");
      queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] });
    },
    
    
     


    onError: (err) => {
      const msg = getErrorMessage(err);

      toast.error(msg); // ✅ always safe string
    },
  });

  // ✅ DELETE
  const deleteMutation = useMutation({
    mutationFn: deleteWhatsAppNotificationByName,
    onSuccess: () => {
      toast.success("Template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["whatsappTemplates"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Delete failed");
    },
  });

  const handleCreate = async (payload) => {
    try {
      await createMutation.mutateAsync(payload);
      return true; // ✅ success
    } catch {
      return false; // ❌ fail
    }
  };

  const handleDelete = async (name) => {
    try {
      await deleteMutation.mutateAsync(name);
      return true; // ✅ success
    } catch {
      return false; // ❌ fail
    }
  };

  return {
    templates,
    loading,
    refetch,

    handleCreate,
    handleDelete,

    submitting: createMutation.isPending,
    deleting: deleteMutation.isPending,
  };
};
