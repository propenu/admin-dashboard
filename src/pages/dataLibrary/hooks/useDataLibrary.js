import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDataLibraryItem,
  deleteDataLibraryItem,
  getDataLibraryItem,
  getDataLibraryTable,
  listDataLibrary,
  listDataLibraryActivity,
  listDeletedDataLibrary,
  restoreDataLibraryItem,
  updateDataLibraryItem,
} from "../../../features/dataLibrary/dataLibraryService";

const KEY = ["data-library"];

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

export const useDataLibraryList = (filters) =>
  useQuery({
    queryKey: [...KEY, "list", filters],
    queryFn: () => listDataLibrary({ limit: 12, ...filters }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

export const useCreateDataLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, onProgress }) => createDataLibraryItem(payload, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Data saved to library");
    },
    onError: (err) => toast.error(errorMessage(err, "Upload failed")),
  });
};

export const useUpdateDataLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateDataLibraryItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Details updated");
    },
    onError: (err) => toast.error(errorMessage(err, "Update failed")),
  });
};

export const useDataLibraryItem = (id) =>
  useQuery({
    queryKey: [...KEY, "item", id],
    queryFn: () => getDataLibraryItem(id),
    enabled: Boolean(id),
    select: (res) => res?.data,
  });

export const useDataLibraryTable = (id, params, enabled) =>
  useQuery({
    queryKey: [...KEY, "table", id, params],
    queryFn: () => getDataLibraryTable(id, params),
    enabled: Boolean(id) && enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

export const useDeletedDataLibrary = (enabled) =>
  useQuery({
    queryKey: [...KEY, "deleted"],
    queryFn: listDeletedDataLibrary,
    enabled,
  });

export const useRestoreDataLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreDataLibraryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Restored");
    },
    onError: (err) => toast.error(errorMessage(err, "Restore failed")),
  });
};

export const useDataLibraryActivity = (params, enabled) =>
  useQuery({
    queryKey: [...KEY, "activity", params],
    queryFn: () => listDataLibraryActivity(params),
    enabled,
    staleTime: 30 * 1000,
  });

export const useDeleteDataLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDataLibraryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Deleted");
    },
    onError: (err) => toast.error(errorMessage(err, "Delete failed")),
  });
};
