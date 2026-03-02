// src/pages/post-property/featured-create/Stepper.jsx
import React from "react";
import { Check } from "lucide-react";

export default function Stepper({ steps, current, onClickStep }) {
  return (
    <nav className="w-full">
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <button
              key={s.id || i}
              onClick={() => onClickStep(i)}
              style={{ minWidth: 130 }}
              className={`
                relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2
                transition-all duration-200 text-left
                ${active
                  ? "bg-[#27AE60] border-[#27AE60] shadow-lg shadow-[#27AE60]/25"
                  : done
                  ? "bg-[#27AE60]/8 border-[#27AE60]/30 hover:border-[#27AE60]/50"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
              `}
            >
              <div className="shrink-0">
                {done ? (
                  <div className="w-6 h-6 rounded-full bg-[#27AE60] flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${active ? "border-white/60 bg-white/20" : "border-gray-200"}`}>
                    {active
                      ? <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      : <span className="text-[9px] font-black text-gray-400">{i + 1}</span>
                    }
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-none
                  ${active ? "text-white/70" : done ? "text-[#27AE60]" : "text-gray-400"}`}>
                  Step {i + 1}
                </span>
                <span className={`text-[11px] font-bold truncate leading-tight mt-0.5
                  ${active ? "text-white" : done ? "text-[#1a8a4a]" : "text-gray-600"}`}>
                  {s.label || s.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}