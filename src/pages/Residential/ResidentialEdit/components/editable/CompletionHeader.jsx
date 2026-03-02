// //frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/CompletionHeader.jsx
// export default function CompletionHeader({ completion }) {
//   if (!completion) return null;

//   const STEPS = ["Basic", "Location", "Property Details", "Verification"];

//   return (
//     <div className="bg-white  border rounded-xl p-2 space-y-4">
//       {/* TOP ROW */}
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-500">Property Completion</p>
//           <p className="text-xl font-semibold text-gray-900">
//             {completion.percent}% Completed
//           </p>
//         </div>

//         <span
//           className={`px-3 py-1 rounded-full text-sm font-medium ${
//             completion.percent === 100
//               ? "bg-green-100 text-green-700"
//               : "bg-yellow-100 text-yellow-700"
//           }`}
//         >
//           {completion.percent === 100 ? "Completed" : "In Progress"}
//         </span>
//       </div>

//       {/* PROGRESS BAR */}
//       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//         <div
//           className="h-full bg-green-500 transition-all"
//           style={{ width: `${completion.percent}%` }}
//         />
//       </div>

//       {/* STEPS */}
//       <div className="flex justify-between text-xs text-gray-500 mt-2">
//         {STEPS.map((step, index) => {
//           const active = index + 1 <= completion.step;

//           return (
//             <div
//               key={step}
//               className={`flex-1 text-center ${
//                 active ? "text-green-600 font-medium" : ""
//               }`}
//             >
//               {step.replace("-", " ").toUpperCase()}
//             </div>
//           );
//         })}
//       </div>

//       {/* CURRENT SECTION */}
//       <p className="text-xs text-gray-400 text-right">
//         Last completed section:{" "}
//         <span className="font-medium text-gray-600 capitalize">
//           {completion.lastSection}
//         </span>
//       </p>
//     </div>
//   );
// }

// // frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/CompletionHeader.jsx
// export default function CompletionHeader({ completion }) {
//   if (!completion) return null;

//   const STEPS = [
//     { key: "basic", label: "Basic", icon: "🏠" },
//     { key: "property", label: "Property", icon: "📄" },
//     { key: "location", label: "Location", icon: "📍" },
//     { key: "verify", label: "Verify", icon: "✓" },
//   ];

//   return (
//     <div className="bg-white rounded-xl shadow-sm">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl px-3 py-1 flex items-center gap-2">
//         <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
//           <span className="text-sm">🏠</span>
//         </div>
//         <div>
//           <h2 className="text-white font-semibold text-xs">
//             Property Editing
//           </h2>
//           <p className="text-green-100 text-[10px] leading-tight">
//             Quick edit mode
//           </p>
//         </div>
//       </div>

//       {/* Steps */}
//       <div className="px-2 py-2">
//         <div className="grid grid-cols-4 gap-2 mb-3">
//           {STEPS.map((step, index) => {
//             const isCurrent = index === 0;
//             const isCompleted = false;

//             return (
//               <button
//                 key={step.key}
//                 className={`relative py-1.5 rounded-lg border transition-all ${
//                   isCurrent
//                     ? "border-green-500 bg-green-50"
//                     : isCompleted
//                     ? "border-green-300 bg-green-50/50"
//                     : "border-gray-200 bg-gray-50"
//                 }`}
//               >
//                 {/* Icon */}
//                 <div
//                   className={`w-5 h-5 mx-auto rounded-md flex items-center justify-center text-[10px] ${
//                     isCurrent
//                       ? "bg-green-600 text-white"
//                       : isCompleted
//                       ? "bg-green-500 text-white"
//                       : "bg-gray-200"
//                   }`}
//                 >
//                   {isCompleted ? "✓" : step.icon}
//                 </div>

//                 {/* Label */}
//                 <div
//                   className={`text-[10px] font-medium text-center mt-0.5 ${
//                     isCurrent
//                       ? "text-green-700"
//                       : isCompleted
//                       ? "text-green-600"
//                       : "text-gray-500"
//                   }`}
//                 >
//                   {step.label}
//                 </div>

//                 {/* Description */}
//                 <div className="text-[9px] text-gray-400 text-center leading-tight">
//                   {index === 0 && "Type & specs"}
//                   {index === 1 && "Features"}
//                   {index === 2 && "Address"}
//                   {index === 3 && "Review"}
//                 </div>

//                 {/* Connector */}
//                 {index < STEPS.length - 1 && (
//                   <div className="absolute top-[32px] left-full w-3 h-[1px] bg-gray-300 -translate-x-1/2 hidden lg:block" />
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         {/* Progress */}
//         <div className="space-y-1">
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-medium text-gray-600">
//               Progress
//             </span>
//             <span className="text-xs font-bold text-green-600">
//               {completion?.percent || 25}%
//             </span>
//           </div>

//           <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 rounded-full"
//               style={{ width: `${completion?.percent || 25}%` }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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