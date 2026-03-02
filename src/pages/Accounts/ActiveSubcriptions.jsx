// import React, { useState, useEffect } from "react";
// import { getActiveSubscriptions } from "../../features/payment/paymentServices";

// const ActiveSubscriptions = () => {
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getActiveSubscriptions()
//       .then((res) => {
//         setSubscriptions(res.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Failed to load subscriptions", err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading)
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-50">
//         <div className="flex flex-col items-center gap-4">
//           <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
//           <p className="animate-pulse font-medium text-gray-500">
//             Loading your plans...
//           </p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[#f8fafc] pb-12">
//       {/* Sticky Responsive Header */}
//       <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
//         <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-3xl">
//                 Active Subscriptions
//               </h1>
//               <p className="text-xs font-medium text-gray-500 sm:text-sm">
//                 Managing {subscriptions.length} live accounts
//               </p>
//             </div>
//             <div className="hidden rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700 sm:block">
//               Today: {new Date().toLocaleDateString("en-GB")}
//             </div>
//           </div>
//         </div>
//       </div>

//       <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
//         {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on large screens */}
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
//           {subscriptions.map((sub) => (
//             <SubscriptionCard key={sub._id} sub={sub} />
//           ))}
//         </div>

//         {subscriptions.length === 0 && (
//           <div className="mt-20 text-center">
//             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
//               <svg
//                 className="h-8 w-8"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8"
//                 />
//               </svg>
//             </div>
//             <h3 className="text-lg font-bold text-gray-900">
//               No active plans found
//             </h3>
//             <p className="text-gray-500">
//               New subscriptions will appear here automatically.
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// const SubscriptionCard = ({ sub }) => {
//   const daysRemaining = Math.ceil(
//     (new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24),
//   );
//   const isExpiringSoon = daysRemaining < 7;

//   // Progress bar calculation (capped between 0-100)
//   const progress = Math.max(0, Math.min(100, (daysRemaining / 30) * 100));

//   return (
//     <div className="group flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-6">
//       <div>
//         {/* Status & Badge Row */}
//         <div className="mb-4 flex items-center justify-between">
//           <div
//             className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
//               sub.userType === "agent"
//                 ? "bg-indigo-50 text-indigo-600"
//                 : "bg-orange-50 text-orange-600"
//             }`}
//           >
//             {sub.userType}
//           </div>
//           <div className="flex items-center gap-1.5">
//             <span className="relative flex h-2 w-2">
//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
//               <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
//             </span>
//             <span className="text-[10px] font-bold text-green-600">LIVE</span>
//           </div>
//         </div>

//         {/* Plan Title */}
//         <h3 className="mb-1 text-lg font-extrabold text-gray-900 group-hover:text-blue-600">
//           {sub.planCode.replace(/_/g, " ")}
//         </h3>
//         <p className="font-mono text-[10px] text-gray-400">
//           Ref: #{sub._id.slice(-8).toUpperCase()}
//         </p>

//         {/* Stats Row */}
//         <div className="mt-6 flex items-center justify-between border-y border-gray-50 py-4">
//           <div className="text-center">
//             <p className="text-[10px] font-bold uppercase text-gray-400">
//               Tier
//             </p>
//             <p className="text-sm font-bold text-gray-700 capitalize">
//               {sub.tier}
//             </p>
//           </div>
//           <div className="h-8 w-[1px] bg-gray-100"></div>
//           <div className="text-center">
//             <p className="text-[10px] font-bold uppercase text-gray-400">
//               Category
//             </p>
//             <p className="text-sm font-bold text-gray-700 capitalize">
//               {sub.category}
//             </p>
//           </div>
//         </div>

//         {/* Expiry / Progress Section */}
//         <div className="mt-6">
//           <div className="mb-2 flex items-end justify-between">
//             <span className="text-xs font-bold text-gray-500">
//               Time Remaining
//             </span>
//             <span
//               className={`text-sm font-black ${isExpiringSoon ? "text-red-500" : "text-blue-600"}`}
//             >
//               {daysRemaining} Days
//             </span>
//           </div>
//           <div className="h-2.5 w-full rounded-full bg-gray-100">
//             <div
//               className={`h-full rounded-full transition-all duration-1000 ${isExpiringSoon ? "bg-red-500" : "bg-blue-500"}`}
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//           <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-400">
//             <span>Started: {new Date(sub.startDate).toLocaleDateString()}</span>
//             <span>Ends: {new Date(sub.endDate).toLocaleDateString()}</span>
//           </div>
//         </div>

//         {/* Usage Pill */}
//         {sub.usage && (
//           <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
//             <span className="text-xs font-bold text-gray-500">
//               Contacts Used
//             </span>
//             <span className="text-sm font-black text-gray-900">
//               {sub.usage.contactUsed}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="mt-8 flex items-center gap-3">
//         <a
//           href={sub.invoiceUrl}
//           target="_blank"
//           rel="noreferrer"
//           className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
//         >
//           <svg
//             className="h-4 w-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//             />
//           </svg>
//           Invoice
//         </a>
//         <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
//           <svg
//             className="h-5 w-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
//             />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ActiveSubscriptions;


import React, { useState, useEffect } from "react";
import { getActiveSubscriptions } from "../../features/payment/paymentServices";

const ActiveSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await getActiveSubscriptions();
        setSubscriptions(res?.data || []);
      } catch (err) {
        console.error("Failed to load subscriptions", err);
        setError("Unable to fetch subscriptions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold">
        {error}
      </div>
    );

  if (!subscriptions.length)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No Active Subscriptions Found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50  px-4 sm:px-6 lg:px-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#27AE60]">
              Live Subscriptions
            </h1>
            <p className="text-sm text-gray-500">
              Monitor active user plans and usage limits.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
            Total Active: {subscriptions.length}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <TableHead>User / Plan</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead align="right">Invoice</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <DesktopRow key={sub._id} sub={sub} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {subscriptions.map((sub) => (
            <MobileCard key={sub._id} sub={sub} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* =======================
   Desktop Row Component
======================= */
const DesktopRow = ({ sub }) => {
  const now = new Date();
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);

  const totalDuration = end - start;
  const remaining = end - now;
  const daysLeft = Math.max(Math.ceil(remaining / 86400000), 0);
  const progress = Math.min(
    Math.max((remaining / totalDuration) * 100, 0),
    100,
  );

  const isExpired = daysLeft <= 0;

  return (
    <tr className="hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-gray-900">
          {sub.planCode?.replace(/_/g, " ")}
        </div>
        <div className="text-xs text-gray-400 font-mono">
          ID: {sub._id.slice(-6)}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm font-medium capitalize text-gray-700">
          {sub.category}
        </div>
        <div className="text-xs uppercase text-gray-400">{sub.tier}</div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm font-bold text-gray-900">
          {sub.usage?.contactUsed || 0}
        </div>
        <div className="text-xs text-gray-400">Contacts Used</div>
      </td>

      <td className="px-6 py-4 w-48">
        <div className="text-xs font-bold mb-1">
          {isExpired ? (
            <span className="text-red-500">Expired</span>
          ) : (
            <span className="text-blue-600">{daysLeft} days left</span>
          )}
        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full">
          <div
            className={`h-full rounded-full ${
              isExpired ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <a
          href={sub.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-bold"
        >
          View
        </a>
      </td>
    </tr>
  );
};

/* =======================
   Mobile Card Component
======================= */
const MobileCard = ({ sub }) => {
  const now = new Date();
  const end = new Date(sub.endDate);
  const daysLeft = Math.max(Math.ceil((end - now) / 86400000), 0);
  const isExpired = daysLeft <= 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {sub.planCode?.replace(/_/g, " ")}
          </h3>
          <p className="text-xs text-gray-400 capitalize">
            {sub.category} • {sub.tier}
          </p>
        </div>

        <div className="text-right">
          <div
            className={`text-xs font-black ${
              isExpired ? "text-red-500" : "text-blue-600"
            }`}
          >
            {isExpired ? "Expired" : `${daysLeft}d left`}
          </div>
        </div>
      </div>

      <div className="text-sm font-bold text-gray-700 mb-3">
        {sub.usage?.contactUsed || 0} Contacts Used
      </div>

      <a
        href={sub.invoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gray-900 text-white text-center py-2.5 rounded-xl text-xs font-bold active:scale-95 transition"
      >
        View Invoice
      </a>
    </div>
  );
};

/* =======================
   Table Head Component
======================= */
const TableHead = ({ children, align }) => (
  <th
    className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase ${
      align === "right" ? "text-right" : ""
    }`}
  >
    {children}
  </th>
);

/* =======================
   Skeleton Loader
======================= */
const SkeletonLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">
    Loading Subscriptions...
  </div>
);

export default ActiveSubscriptions;
