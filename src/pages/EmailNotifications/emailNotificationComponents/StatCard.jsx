// src/pages/EmailNotifications/EmailNotificationComponents/StatCard.jsx
export const StatCard = ({ label, value, icon: Icon, bg }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xl font-extrabold text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
        {label}
      </p>
    </div>
  </div>
);
