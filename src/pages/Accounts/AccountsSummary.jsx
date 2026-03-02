import React, { useEffect, useState } from "react";
import { getAccountsSummary } from "../../features/payment/paymentServices";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountsSummary()
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-lg font-medium text-gray-600">
       <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-1 sm:p-6 lg:p-2">
      <h2 className="text-2xl font-semibold text-[#27AE60] mb-6">
        Business Overview
      </h2>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          borderColor="border-blue-500"
        />

        <StatCard
          title="Today's Revenue"
          value={`₹${summary.todayRevenue}`}
          borderColor="border-green-500"
        />

        <StatCard
          title="Active Subscriptions"
          value={summary.activeSubscriptions}
          borderColor="border-cyan-500"
        />

        <StatCard
          title="Failed Payments"
          value={summary.failedPayments}
          borderColor={
            summary.failedPayments > 0 ? "border-red-500" : "border-gray-300"
          }
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, borderColor }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 p-6 border-l-4 ${borderColor}`}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
    </div>
  );
};

export default DashboardPage;
