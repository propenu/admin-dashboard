// src/pages/WhatsAppNotifications/WhatAppNotificationComponent/sections/FooterSection.jsx

import { Toggle } from "../../common/Toggle";
export const FooterSection = ({ footer, onChange }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          4
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Footer{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">
              · Optional
            </span>
          </p>
          <p className="text-xs text-gray-400">
            Short text at the bottom (max 60 chars)
          </p>
        </div>
      </div>
      <Toggle
        on={footer.enabled}
        onToggle={() => onChange({ ...footer, enabled: !footer.enabled })}
      />
    </div>
    {footer.enabled && (
      <div className="p-4">
        <input
          maxLength={60}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
          placeholder="e.g. Thank you for using Propenu."
          value={footer.text}
          onChange={(e) => onChange({ ...footer, text: e.target.value })}
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {footer.text.length}/60
        </p>
      </div>
    )}
  </div>
);