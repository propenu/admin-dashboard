import React, { useState, useEffect } from "react";
import { getAccountsSummary } from "../../features/payment/paymentServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AccountsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getAccountsSummary();
      setAnalytics(res.data || {});
    } catch (err) {
      console.error("Accounts Dashboard Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalRevenue = analytics?.totalRevenue || 0;
  const todayRevenue = analytics?.todayRevenue || 0;
  const activeSubscriptions = analytics?.activeSubscriptions || 0;
  const failedPayments = analytics?.failedPayments || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#27AE60]">
            Accounts Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Revenue analytics & subscription overview
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow border hover:bg-slate-100"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPI
          icon={<IndianRupee />}
          label="Total Revenue"
          value={`₹ ${totalRevenue.toLocaleString()}`}
        />
        <KPI
          icon={<TrendingUp />}
          label="Today's Revenue"
          value={`₹ ${todayRevenue.toLocaleString()}`}
        />
        <KPI
          icon={<CreditCard />}
          label="Active Subscriptions"
          value={activeSubscriptions}
        />
        <KPI
          icon={<AlertCircle />}
          label="Failed Payments"
          value={failedPayments}
        />
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-6">
          Revenue Overview
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: "Total Revenue", value: totalRevenue },
              { name: "Today Revenue", value: todayRevenue },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KPI = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition">
    <div className="flex justify-between items-center mb-3 text-slate-600">
      {icon}
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-xs text-slate-500 uppercase mt-1">{label}</div>
  </div>
);

export default AccountsDashboard;
