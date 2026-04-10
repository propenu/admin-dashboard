import { ALL_STEPS, STEP_META } from "../Constants/constants"

export const StepHeaderCard = ({current}) => {
    return (
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
                      border: "1.5px solid #bbf7d0",
                    }}
                  >
                    {STEP_META[current].icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
                      Step {current + 1} of {ALL_STEPS.length}
                    </p>
                    <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                      {ALL_STEPS[current].title}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {STEP_META[current].desc}
                    </p>
                  </div>
                </div>
    )
}