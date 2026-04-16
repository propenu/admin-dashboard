//src/pages/users/users/constants/kycStatusMap.js

import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const KYC_STATUS_MAP = {
  verified: {
    label: "Verified",
    bg: "bg-[#27AE60]/10",
    text: "text-[#27AE60]",
    icon: CheckCircle2,
  },
  not_started: {
    label: "Not Started",
    bg: "bg-gray-100",
    text: "text-gray-500",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    icon: XCircle,
  },
};
