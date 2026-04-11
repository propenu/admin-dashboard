// // src/pages/EmailNotifications/EmailNotificationComponents/StatusBadge.jsx
// import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

// const STATUS_META = {
//   success: {
//     label: "Sent",
//     color: "bg-green-50 text-green-700 border-green-200",
//     dot: "bg-green-500",
//     icon: <CheckCircle2 size={11} />,
//   },
//   failed: {
//     label: "Failed",
//     color: "bg-red-50 text-red-600 border-red-200",
//     dot: "bg-red-500",
//     icon: <AlertCircle size={11} />,
//   },
//   pending: {
//     label: "Pending",
//     color: "bg-amber-50 text-amber-600 border-amber-200",
//     dot: "bg-amber-400 animate-pulse",
//     icon: <Clock size={11} />,
//   },
// };

// export const StatusBadge = ({ status }) => {
//   const m = STATUS_META[status] || STATUS_META.pending;
//   return (
//     <span
//       className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.color}`}
//     >
//       <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
//       {m.label}
//     </span>
//   );
// };


// src/pages/EmailNotifications/EmailNotificationComponents/StatusBadge.jsx
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_META = {
  success: {
    label: "Delivered",
    // Using your primary #27AE60
    color: "bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20",
    dot: "bg-[#27AE60]",
    icon: <CheckCircle2 size={12} />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-50 text-red-600 border-red-100",
    dot: "bg-red-500",
    icon: <AlertCircle size={12} />,
  },
  pending: {
    label: "Processing",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-400",
    icon: <Clock size={12} className="animate-spin-slow" />,
  },
};

export const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border tracking-tight shadow-sm ${m.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {m.icon}
      {m.label}
    </motion.span>
  );
};