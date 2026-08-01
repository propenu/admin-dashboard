import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const KYC_STATUS_MAP = {
  verified: {
    label: "Verified",
    bg: "bg-[#12A150]/10",
    text: "text-[#12A150]",
    border: "border-[#12A150]/25",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    icon: Clock,
  },
  not_started: {
    label: "Pending",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    icon: XCircle,
  },
};
