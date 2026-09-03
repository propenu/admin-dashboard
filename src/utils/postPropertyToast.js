import { toast } from "sonner";

/**
 * Extract a readable message from API / thunk reject payloads
 * (axios errors, rejectWithValue, Zod arrays, Mongoose validation).
 */
export function extractApiErrorMessage(err, fallback = "Something went wrong") {
  if (err == null) return fallback;
  if (typeof err === "string" && err.trim()) return err.trim();

  const data = err?.response?.data ?? err?.data ?? err;
  if (typeof data === "string" && data.trim()) return data.trim();

  const fromList = (list) => {
    if (!Array.isArray(list) || !list.length) return null;
    const first = list[0];
    if (typeof first === "string") return first;
    return first?.message || first?.msg || first?.error || null;
  };

  const listMsg =
    fromList(data?.errors) ||
    fromList(data?.details) ||
    fromList(data?.issues) ||
    fromList(err?.errors);

  if (listMsg) return listMsg;

  // Mongoose-style { errors: { field: { message } } }
  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    for (const value of Object.values(data.errors)) {
      const msg =
        typeof value === "string"
          ? value
          : value?.message || value?.msg || null;
      if (msg) return msg;
    }
  }

  return (
    data?.message ||
    data?.error ||
    err?.message ||
    err?.error ||
    fallback
  );
}

export function toastApiError(err, fallback = "Something went wrong", toastOpts) {
  toast.error(extractApiErrorMessage(err, fallback), toastOpts);
}

/** Show required / validation errors as toasts (field errors stay inline). */
export function toastValidationErrors(errors) {
  const messages = Object.values(errors || {}).filter(
    (m) => typeof m === "string" && m.trim(),
  );
  if (!messages.length) return;

  if (messages.length === 1) {
    toast.error(messages[0]);
    return;
  }

  toast.error(`${messages[0]} (+${messages.length - 1} more required)`);
}
