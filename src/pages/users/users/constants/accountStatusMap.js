export const ACCOUNT_STATUS_MAP = {
  active: {
    label: "Active",
    bg: "bg-[#12A150]/10",
    text: "text-[#12A150]",
    dot: "bg-[#12A150]",
  },
  location_pending: {
    label: "Location Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  kyc_pending: {
    label: "KYC Pending",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-400",
  },
  inactive: {
    label: "Inactive",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
  suspended: {
    label: "Suspended",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};
