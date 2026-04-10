
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Video,
  FileType,
} from "lucide-react";


export const CATEGORIES = ["UTILITY", "MARKETING", "AUTHENTICATION"];

export const HEADER_FORMATS = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"];

export const BUTTON_TYPES = ["QUICK_REPLY", "URL", "PHONE_NUMBER"];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "en_US", label: "English (US)" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "ur", label: "Urdu" },
];

export const STATUS_META = {
  APPROVED: {
    label: "Approved",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  PAUSED: {
    label: "Paused",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: AlertCircle,
  },
};

export const CAT_COLOR = {
  UTILITY: "bg-blue-50 text-blue-700 border-blue-200",
  MARKETING: "bg-purple-50 text-purple-700 border-purple-200",
  AUTHENTICATION: "bg-amber-50 text-amber-700 border-amber-200",
};

export const MEDIA_ACCEPT = {
  IMAGE: "image/jpeg,image/png,image/webp",
  VIDEO: "video/mp4,video/3gpp",
  DOCUMENT: "application/pdf",
};

export const MEDIA_ICON = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileType,
};

export const getStatusMeta = (s) => STATUS_META[s] || STATUS_META["PENDING"];
