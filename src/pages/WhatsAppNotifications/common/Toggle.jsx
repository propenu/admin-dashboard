//src/pages/WhatsAppNotifications/common/Toggle.jsx
export const Toggle = ({ on, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? "bg-[#27AE60]" : "bg-gray-300"}`}
  >
    <span
      className={`absolute right-6 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
    />
  </button>
);
