import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileType,
  Image as ImageIcon,
  Video,
  XCircle,
} from "lucide-react";

export const CATEGORIES = ["UTILITY", "MARKETING", "AUTHENTICATION"];

export const CATEGORY_OPTIONS = [
  {
    value: "MARKETING",
    label: "Marketing",
    description:
      "Offers, promotions, property recommendations, and sales follow-ups.",
  },
  {
    value: "UTILITY",
    label: "Utility",
    description:
      "Appointments, invoices, confirmations, reminders, and service updates.",
  },
  {
    value: "AUTHENTICATION",
    label: "Authentication",
    description: "One-time passwords, login codes, and account verification.",
  },
];

export const HEADER_FORMATS = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "LOCATION"];

/** Meta-style button add options (Create template → Add button). */
export const BUTTON_TYPES = [
  "QUICK_REPLY",
  "URL",
  "VOICE_CALL",
  "PHONE_NUMBER",
  "FLOW",
  "COPY_CODE",
  "SHARE_CONTACT",
];

export const META_BUTTON_OPTIONS = [
  {
    type: "QUICK_REPLY",
    label: "Custom",
    description: "Send a quick reply",
  },
  {
    type: "URL",
    label: "Visit website",
    description: "Open a webpage",
  },
  {
    type: "VOICE_CALL",
    label: "Call on WhatsApp",
    description: "Start a WhatsApp voice call",
  },
  {
    type: "PHONE_NUMBER",
    label: "Call phone number",
    description: "Open the phone dialer",
  },
  {
    type: "FLOW",
    label: "Complete flow",
    description: "Open a WhatsApp Flow",
  },
  {
    type: "COPY_CODE",
    label: "Copy offer code",
    description: "Copy a promotional code",
  },
  {
    type: "SHARE_CONTACT",
    label: "Share contact info",
    description: "Request the customer's number",
  },
];

/** Media sample choices for header — includes Text, matching Meta composer. */
export const HEADER_MEDIA_OPTIONS = [
  {
    value: "NONE",
    label: "None",
    description: "Start with the message body.",
  },
  {
    value: "TEXT",
    label: "Text",
    description: "Add a short heading above the message.",
  },
  {
    value: "IMAGE",
    label: "Image",
    description: "Add a JPG or PNG above the message.",
  },
  {
    value: "DOCUMENT",
    label: "Document",
    description: "Attach a sample PDF document.",
  },
  {
    value: "VIDEO",
    label: "Video",
    description: "Add an MP4 video above the message.",
  },
  {
    value: "LOCATION",
    label: "Location",
    description: "Show a location header above the message.",
  },
];

export const LANGUAGES = [
  { code: "ar", label: "Arabic" },
  { code: "az", label: "Azerbaijani" },
  { code: "bn", label: "Bengali" },
  { code: "bg", label: "Bulgarian" },
  { code: "ca", label: "Catalan" },
  { code: "zh_CN", label: "Chinese Simplified" },
  { code: "zh_HK", label: "Chinese Hong Kong" },
  { code: "zh_TW", label: "Chinese Traditional" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "en_GB", label: "English (UK)" },
  { code: "en_US", label: "English (US)" },
  { code: "et", label: "Estonian" },
  { code: "fil", label: "Filipino" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "gu", label: "Gujarati" },
  { code: "he", label: "Hebrew" },
  { code: "hi", label: "Hindi" },
  { code: "hu", label: "Hungarian" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "kn", label: "Kannada" },
  { code: "ko", label: "Korean" },
  { code: "ms", label: "Malay" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "nb", label: "Norwegian" },
  { code: "fa", label: "Persian" },
  { code: "pl", label: "Polish" },
  { code: "pt_BR", label: "Portuguese (BR)" },
  { code: "pt_PT", label: "Portuguese (PT)" },
  { code: "pa", label: "Punjabi" },
  { code: "ro", label: "Romanian" },
  { code: "ru", label: "Russian" },
  { code: "sr", label: "Serbian" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "es", label: "Spanish" },
  { code: "es_AR", label: "Spanish (AR)" },
  { code: "es_ES", label: "Spanish (ES)" },
  { code: "es_MX", label: "Spanish (MX)" },
  { code: "sw", label: "Swahili" },
  { code: "sv", label: "Swedish" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "uk", label: "Ukrainian" },
  { code: "ur", label: "Urdu" },
  { code: "vi", label: "Vietnamese" },
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

export const MEDIA_LIMITS = {
  IMAGE: { maxMB: 5, hint: "JPG or PNG · Maximum 5 MB" },
  VIDEO: { maxMB: 16, hint: "MP4 · Maximum 16 MB" },
  DOCUMENT: { maxMB: 5, hint: "PDF · Maximum 5 MB" },
};

export const MEDIA_ICON = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileType,
};

export const getStatusMeta = (s) => STATUS_META[s] || STATUS_META.PENDING;
