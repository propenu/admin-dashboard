import React from "react";
export default function CompletionHeader({ completion }) {
  if (!completion) return null;

  const STEPS = [
    {
      key: "basic",
      label: "Basic Details",
      description: "Property type and specifications",
      icon: "🏠",
      iconBg: "bg-green-600",
    },
    {
      key: "property",
      label: "Property Details",
      description: "Features and amenities",
      icon: "📄",
      iconBg: "bg-purple-600",
    },
    {
      key: "location",
      label: "Location",
      description: "Address and landmarks",
      icon: "📍",
      iconBg: "bg-gray-400",
    },
    {
      key: "verify",
      label: "Verify & Publish",
      description: "Final review and verification",
      icon: "✓",
      iconBg: "bg-gray-400",
    },
  ];

  // Determine current step based on completion percent
  const getCurrentStep = () => {
    const percent = completion?.percent || 0;
    if (percent >= 75) return 3;
    if (percent >= 50) return 2;
    if (percent >= 25) return 1;
    return 0;
  };

  const currentStepIndex = getCurrentStep();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Green Header Bar */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-xl">🏠</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Property Listing</h2>
            <p className="text-green-100 text-xs">
              List your property in minutes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-white text-sm">📈</span>
            <span className="text-white text-xs font-medium">
              3x more enquiries
            </span>
            <span className="text-green-100 text-xs">if listed in 5:15</span>
          </div>
          <button className="flex items-center gap-1.5 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
            <span className="text-sm">📞</span>
            <span className="text-xs font-medium">Callback</span>
          </button>
          <button className="flex items-center gap-1.5 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
            <span className="text-sm">❓</span>
            <span className="text-xs font-medium">Help</span>
          </button>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STEPS.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isActive = isCurrent || isCompleted;

            return (
              <button
                key={step.key}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? "border-green-500 bg-green-50 shadow-md"
                    : isCompleted
                      ? "border-green-300 bg-green-50/50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    isActive ? step.iconBg : "bg-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-white text-xl">✓</span>
                  ) : (
                    <span className={isActive ? "text-white" : "text-gray-500"}>
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div
                  className={`text-sm font-semibold text-center mb-1 ${
                    isCurrent
                      ? "text-green-700"
                      : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                  }`}
                >
                  {step.label}
                </div>

                {/* Description */}
                <div className="text-xs text-gray-500 text-center leading-tight">
                  {step.description}
                </div>

                {/* Connection Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-10 left-full w-4 h-0.5 -ml-2 hidden lg:block ${
                      isCompleted ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Overall Progress
            </span>
            <span className="text-lg font-bold text-green-600">
              {completion?.percent}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${completion?.percent || 50}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}