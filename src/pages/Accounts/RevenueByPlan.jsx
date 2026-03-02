import React, { useState, useEffect } from "react";
import { getRevenueByPlan } from "../../features/payment/paymentServices";

const RevenueByPlanPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueByPlan()
      .then((res) => {
        setRevenueData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPlatformRevenue = revenueData.reduce(
    (acc, curr) => acc + curr.totalRevenue,
    0,
  );
  const totalSalesCount = revenueData.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="font-bold text-gray-400 animate-pulse">
            Analyzing Revenue...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#27AE60] sm:text-4xl">
              Revenue Analytics
            </h1>
            <p className="text-sm font-medium text-[#27AE60]">
              Real-time performance breakdown by subscription tier.
            </p>
          </div>
          <button className="w-full rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm border border-gray-200 md:w-auto hover:bg-gray-50">
            Download Report
          </button>
        </header>

        {/* High-Level Stats - Stacked on mobile, 2 cols on tablet */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-8">
          <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-6 text-white shadow-xl shadow-blue-100">
            <p className="text-xs font-black uppercase tracking-widest text-blue-100 opacity-80">
              Platform Revenue
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              ₹{totalPlatformRevenue.toLocaleString()}
            </h2>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Subscriptions Sold
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">
              {totalSalesCount.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Plan Performance Grid - 1 col on mobile, 2 on desktop */}
        <h2 className="mb-6 text-lg font-black text-gray-800 uppercase tracking-tight">
          Plan Performance
        </h2>
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {revenueData.map((item) => (
            <RevenueCard
              key={item._id}
              item={item}
              total={totalPlatformRevenue}
            />
          ))}
        </div>

        {/* Detailed Audit - Hybrid Component */}
        <h2 className="mb-6 text-lg font-black text-gray-800 uppercase tracking-tight">
          Plan Configurations
        </h2>
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden md:block">
            {/* Desktop Table View */}
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Configuration</th>
                  <th className="px-6 py-4 text-right">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {revenueData.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-6 py-5 font-bold text-gray-900">
                      {item.plan.name}
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-medium">
                      {item.plan.durationDays} Days
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.plan.features).map(
                          ([key, val]) => (
                            <span
                              key={key}
                              className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600"
                            >
                              {key}: {val}
                            </span>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-xs font-bold text-orange-600 uppercase">
                      {item.plan.tier}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Alternative to table) */}
          <div className="divide-y divide-gray-100 md:hidden">
            {revenueData.map((item) => (
              <div key={item._id} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-black text-gray-900">
                    {item.plan.name}
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 uppercase">
                    {item.plan.tier}
                  </span>
                </div>
                <div className="mb-3 text-xs font-medium text-gray-500">
                  {item.plan.durationDays} Day Duration
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(item.plan.features).map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-[10px]"
                    >
                      <span className="font-bold text-gray-400 uppercase mr-1">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="font-bold text-gray-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RevenueCard = ({ item, total }) => {
  const percentage = ((item.totalRevenue / total) * 100).toFixed(1);

  return (
    <div className="group relative flex overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all hover:border-blue-200 hover:shadow-xl sm:flex-row">
      <div
        className={`w-2 shrink-0 sm:w-3 ${item.plan.userType === "agent" ? "bg-purple-500" : "bg-green-500"}`}
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <span className="inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter text-gray-500">
              {item.plan.code}
            </span>
            <h3 className="mt-2 text-xl font-extrabold text-gray-900 group-hover:text-blue-600">
              {item.plan.name}
            </h3>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              ₹{item.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {item.count} Conversions
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-gray-50 pt-6">
          <StatMini label="Price" value={`₹${item.plan.price}`} />
          <StatMini
            label="Category"
            value={item.plan.category.replace("_", " ")}
          />
          <StatMini
            label="Share"
            value={`${percentage}%`}
            color="text-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, color = "text-gray-700" }) => (
  <div className="flex-1 min-w-[80px]">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <p className={`mt-1 text-sm font-bold capitalize ${color}`}>{value}</p>
  </div>
);

export default RevenueByPlanPage;
