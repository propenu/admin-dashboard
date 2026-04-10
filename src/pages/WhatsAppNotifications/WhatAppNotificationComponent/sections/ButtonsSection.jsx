
import {
  ChevronDown,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { BUTTON_TYPES } from "../../utils/constants";



export const ButtonsSection = ({ buttons, onChange }) => {
  const addBtn = () => {
    if (buttons.length >= 3) {
      toast.error("Max 3 buttons");
      return;
    }
    onChange([
      ...buttons,
      { type: "QUICK_REPLY", text: "", url: "", phone: "" },
    ]);
  };
  const removeBtn = (i) => onChange(buttons.filter((_, idx) => idx !== i));
  const updateBtn = (i, patch) =>
    onChange(buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          5
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Buttons{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">
              · Optional, max 3
            </span>
          </p>
          <p className="text-xs text-gray-400">
            Quick Reply, URL or Phone Number
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {buttons.map((btn, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  className="w-full appearance-none px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white cursor-pointer pr-7"
                  value={btn.type}
                  onChange={(e) => updateBtn(i, { type: e.target.value })}
                >
                  {BUTTON_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <input
                maxLength={25}
                className="flex-[2] h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300 bg-white"
                placeholder="Button label"
                value={btn.text}
                onChange={(e) => updateBtn(i, { text: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeBtn(i)}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <MinusCircle size={15} />
              </button>
            </div>
            {btn.type === "URL" && (
              <input
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300 bg-white"
                placeholder="https://example.com"
                value={btn.url}
                onChange={(e) => updateBtn(i, { url: e.target.value })}
              />
            )}
            {btn.type === "PHONE_NUMBER" && (
              <input
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300 bg-white"
                placeholder="+91XXXXXXXXXX"
                value={btn.phone}
                onChange={(e) => updateBtn(i, { phone: e.target.value })}
              />
            )}
          </div>
        ))}
        {buttons.length < 3 && (
          <button
            type="button"
            onClick={addBtn}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#27AE60] bg-[#E8F8EF] border border-dashed border-[#27AE60] rounded-xl hover:bg-[#C2EDD6] transition-colors w-full justify-center"
          >
            <PlusCircle size={15} /> Add Button
          </button>
        )}
      </div>
    </div>
  );
};