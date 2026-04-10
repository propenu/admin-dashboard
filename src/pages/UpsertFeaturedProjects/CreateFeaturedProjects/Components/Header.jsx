import { Building2 } from "lucide-react";
import { ALL_STEPS } from "../Constants/constants";

export const Header = ({ current }) => {
    const progressPct = Math.round((current / (ALL_STEPS.length - 1)) * 100);


    return (
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              <Building2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-[#27AE60] leading-none whitespace-nowrap">
                Create Featured Project
              </h1>
              {/* Mobile step indicator in topbar */}
              <p className="text-[10px] text-gray-400 mt-0.5 sm:hidden">
                Step {current + 1} of {ALL_STEPS.length} ·{" "}
                {ALL_STEPS[current].title}
              </p>
            </div>
          </div>

          {/* Progress bar — hidden on mobile, shown md+ */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs ml-auto">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#27AE60,#2ecc71)",
                }}
              />
            </div>
            <span className="text-xs font-black text-gray-500 shrink-0">
              {progressPct}%
            </span>
          </div>

          {/* Mobile progress pill */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: "#27AE60" }}
              />
            </div>
            <span className="text-[10px] font-black text-gray-400">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>
    );
};