// src/pages/EmailNotifications/EmailNotificationComponents/StatCard.jsx
export const StatCard = ({ label, value, icon: Icon, bg, iconColor }) => (
  <div className="bg-white border border-[#27AE60] rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow min-w-0">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg ?? "bg-green-50"}`}
    >
      <Icon size={18} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-semibold text-black leading-none truncate">
        {value}
      </p>
      <p className="text-xs text-black font-semibold uppercase tracking-wide mt-1 truncate">
        {label}
      </p>
    </div>
  </div>
);
