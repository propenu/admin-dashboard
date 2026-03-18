import React from "react";
import { Check } from "lucide-react";

export default function Stepper({ steps, current, onClickStep }) {
  return (
    <nav className="w-full" aria-label="Progress">
      <ol className="flex items-center w-full">
        {steps.map((s, i) => {
          const active = i === current;
          const done = i < current;
          const isLast = i === steps.length - 1;

          return (
            <li
              key={s.id || i}
              className={`flex items-center ${isLast ? "shrink-0" : "flex-1"}`}
            >
              {/* ── Node ── */}
              <button
                type="button"
                onClick={() => onClickStep(i)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.label || s.title}`}
                className="flex flex-col items-center gap-1 sm:gap-1.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27AE60] focus-visible:ring-offset-2 rounded-sm shrink-0"
              >
                {/* Circle */}
                <div
                  className={[
                    "flex items-center justify-center rounded-full transition-all duration-300",
                    // size
                    "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
                    // state
                    active
                      ? "bg-[#27AE60] ring-[3px] sm:ring-4 ring-[#27AE60]/25 shadow shadow-[#27AE60]/30"
                      : done
                        ? "bg-[#27AE60]"
                        : "bg-white border-2 border-gray-300 group-hover:border-[#27AE60]/50 group-hover:bg-[#27AE60]/5",
                  ].join(" ")}
                >
                  {done ? (
                    <Check
                      className="text-white"
                      strokeWidth={3}
                      style={{ width: "45%", height: "45%" }}
                    />
                  ) : active ? (
                    <span
                      className="block rounded-full bg-white"
                      style={{ width: "35%", height: "35%" }}
                    />
                  ) : (
                    <span
                      className="font-black text-gray-400 leading-none select-none"
                      style={{ fontSize: "clamp(7px, 1.5vw, 10px)" }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Labels */}
                <div className="flex flex-col items-center leading-none">
                  <span
                    className={[
                      "font-black uppercase tracking-widest leading-none",
                      "text-[6px] sm:text-[7px] md:text-[8px]",
                      active
                        ? "text-[#27AE60]"
                        : done
                          ? "text-[#27AE60]/60"
                          : "text-gray-400",
                    ].join(" ")}
                  >
                    <span className="hidden sm:inline">Step </span>
                    {i + 1}
                  </span>
                  <span
                    className={[
                      "font-semibold leading-tight mt-0.5 text-center truncate",
                      "text-[7px] sm:text-[9px] md:text-[10px]",
                      "max-w-[32px] sm:max-w-[48px] md:max-w-[60px]",
                      active
                        ? "text-gray-800"
                        : done
                          ? "text-[#27AE60]"
                          : "text-gray-400",
                    ].join(" ")}
                  >
                    {s.label || s.title}
                  </span>
                </div>
              </button>

              {/* ── Connector ── */}
              {!isLast && (
                <div
                  className="flex-1 mx-1 sm:mx-1.5 mb-5 sm:mb-6 rounded-full overflow-hidden bg-gray-200"
                  style={{ height: "2px" }}
                  role="presentation"
                >
                  <div
                    className="h-full bg-[#27AE60] rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
