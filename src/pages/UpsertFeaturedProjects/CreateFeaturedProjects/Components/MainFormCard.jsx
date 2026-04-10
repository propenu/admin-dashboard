import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { ALL_STEPS } from "../Constants/constants";

export const MainFormCard = ({
  StepComponent,
  current,
  setCurrent,
  isLastStep,
  handleNext,
  handleSubmit,
  isLoading,
  progress,
  
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Green accent line */}
      <div
        className="h-1"
        style={{
          background: "linear-gradient(90deg,#27AE60,#2ecc71,transparent)",
        }}
      />

      {/* Form content */}
      <div className="p-4 sm:p-6 md:p-8">{StepComponent}</div>

      {/* ── Footer Navigation ── */}
      <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
        {/* Mobile: stack nav buttons full width, dots in between */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setCurrent((i) => i - 1)}
            disabled={current === 0}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-gray-200
                          text-gray-600 text-xs sm:text-sm font-bold hover:border-gray-300 hover:bg-white
                          transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <ArrowLeft size={14} />
            <span className="hidden xs:inline">Back</span>
          </button>

          {/* Dot indicators — hidden on very small, shown sm+ */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
            {ALL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? 18 : 7,
                  height: 7,
                  background:
                    i < current
                      ? "#27AE60"
                      : i === current
                        ? "#27AE60"
                        : "#e5e7eb",
                  opacity: i < current ? 0.5 : 1,
                }}
              />
            ))}
          </div>

          {/* Mobile: compact step counter instead of dots */}
          <span className="sm:hidden text-[11px] font-black text-gray-400">
            {current + 1} / {ALL_STEPS.length}
          </span>

          {/* Next / Publish button */}
          {isLastStep ? (
            <button
              type="button"
              // onClick={handleSubmit}
              //disabled={saving}
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl
                            text-white text-xs sm:text-sm font-black transition-all disabled:opacity-60 shadow-lg shrink-0"
              style={{
                background: "linear-gradient(135deg,#27AE60,#1e8449)",
                boxShadow: "0 4px 14px rgba(39,174,96,0.35)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden xs:inline">Saving… {progress}%</span>
                  <span className="xs:hidden">{progress}%</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span className="hidden xs:inline">Publish Property</span>
                  <span className="xs:hidden">Publish</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl
                            text-white text-xs sm:text-sm font-black transition-all hover:opacity-90 shadow-lg shrink-0"
              style={{
                background: "linear-gradient(135deg,#27AE60,#1e8449)",
                boxShadow: "0 4px 14px rgba(39,174,96,0.3)",
              }}
            >
              Next
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};