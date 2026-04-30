import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccountsSummary,
  getRevenueByPlan,
  getActiveSubscriptions,
  getPaymentsList
} from "../../features/payment/paymentServices";
import { getSuperAdimnAnalytics } from "../../features/property/propertyService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  Calendar,
  Package,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SuperAdminDashboard = () => {
  const [data, setData] = useState({
    summary: null,
    revenueByPlan: [],
    activeSubsCount: 0,
    paidCount: 0,
    failedCount: 0,
    superAdminPropertyAnalytics: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigateone = useNavigate();

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [
        summaryRes,
        revenueRes,
        subsRes,
        paidRes,
        failedRes,
        superAdminPropertyRes,
      ] = await Promise.all([
        getAccountsSummary(),
        getRevenueByPlan(),
        getActiveSubscriptions(),
        getPaymentsList("paid"),
        getPaymentsList("failed"),
        getSuperAdimnAnalytics(),
      ]);

      setData({
        summary: summaryRes.data || {},
        revenueByPlan: (revenueRes.data || []).map((item) => ({
  ...item,
  displayName: `${item.plan?.name} (${item.plan?.category})`,
  rawRevenue: item.totalRevenue || 0,
})),
        activeSubsCount: subsRes.data?.length || 0,
        paidCount: paidRes.data?.total || paidRes.data?.length || 0,
        failedCount: failedRes.data?.total || failedRes.data?.length || 0,
        superAdminPropertyAnalytics: superAdminPropertyRes.data || {},
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-green-50" size={48} />
          <span className="text-lg font-bold text-slate-600">
            <LoadingSpinner size="sm" />
          </span>
        </div>
      </div>
    );
  }

  const totalRev = data.summary?.totalRevenue || 0;
  const todayRev = data.summary?.todayRevenue || 0;
  const failedPayments = data.summary?.failedPayments || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-1 sm:p-1 md:p-1 lg:p-1">
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#27AE60] ">
              Business Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time performance metrics and subscription health
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRev.toLocaleString("en-IN")}`}
          sub="All time earnings"
          icon={<DollarSign size={20} />}
          color="white"
          trend={null}
          route={"/accounts-summary"}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${todayRev.toLocaleString("en-IN")}`}
          sub="Day by day earnings"
          icon={<TrendingUp size={20} />}
          color="white"
          // trend="+0%"
          route={"/Revenue-by-plan"}
        />
        <StatCard
          title="Active Subscriptions"
          value={data.activeSubsCount}
          sub={`Active users subscriptions`}
          icon={<Users size={20} />}
          color="white"
          trend={null}
          route={"/active-subscriptions"}
        />
        <StatCard
          title="Failed Payments"
          value={failedPayments}
          sub={failedPayments === 0 ? "Perfect rate!" : "Needs attention"}
          icon={<AlertCircle size={20} />}
          color={failedPayments === 0 ? "white" : "orange"}
          trend={failedPayments === 0 ? "0%" : null}
          route={"/payments-list"}
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1   lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
        {/* Paid vs Failed Payments Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <h3 className="text-xs sm:text-sm font-black text-[#27AE60] uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} className="text-[#27AE60]" />
              Payment Status
            </h3>
            <span className="text-xs text-[#000000] font-semibold">
              Paid vs Failed
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center outline-none focus:outline-none">
            <ResponsiveContainer
              style={{ outline: "none" }}
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  style={{ outline: "none" }}
                  data={[
                    { name: "Paid", value: data.paidCount },
                    { name: "Failed", value: data.failedCount },
                  ]}
                  innerRadius="55%"
                  outerRadius="75%"
                  dataKey="value"
                  paddingAngle={5}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  // onClick={(data) => {
                  //   navigateone("/payments-list");
                  // }}
                  onClick={(data, index, e) => {
                    e?.target?.blur(); // ✅ removes focus border
                    navigateone("/payments-list");
                  }}
                  // onClick={(entry) => {
                  //   if (entry.name === "Paid") {
                  //     navigateone("/payments-list?status=paid");
                  //   } else {
                  //     navigateone("/payments-list?status=failed");
                  //   }
                  // }}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase">
                Paid ({data.paidCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase">
                Failed ({data.failedCount})
              </span>
            </div>
          </div>
        </div>
        {/* Revenue by Plan Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <h3 className="text-xs sm:text-sm font-black text-[#27AE60] uppercase tracking-wider flex items-center gap-2">
              <Package size={16} className="text-[#27AE60]" />
              Revenue by Plan
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Performance
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.revenueByPlan}
                barCategoryGap="20%"
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="displayName"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#000000" }}
                  height={70}
                  tickMargin={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#000000" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar
                  dataKey="rawRevenue"
                  fill="#27AE60"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={60}
                  onClick={(data) => {
                    navigateone("/Revenue-by-plan");
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1   lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
        {/* Plan Performance Breakdown */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
          <h3 className="text-xs sm:text-sm font-black text-[#27AE60] mb-4 md:mb-8 uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={18} className="text-[#27AE60]" />
            Plan Performance Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {data.revenueByPlan.map((item) => {
              const share =
                totalRev > 0 ? (item.rawRevenue / totalRev) * 100 : 0;
              return (
                <div
                  key={item._id}
                  className="p-4 sm:p-5 rounded-xl md:rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px]  bg-white border border-green-600 px-2 py-1 rounded-md text-[#000000] uppercase mb-2 inline-block">
                        {item.plan?.code || "TIER_1"}
                      </span>
                      <h4 className="text-base sm:text-lg  text-[#000000] truncate">
                        {item.displayName}
                      </h4>
                      <p className="text-[12px] text-[#000000] uppercase tracking-tight">
                        {item.count} Conversions
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-lg sm:text-xl font-black text-[#27AE60]">
                        ₹{item.rawRevenue.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] font-bold text-blue-500 uppercase">
                        {share.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#27ae60] to-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PROPERTY STATUS DISTRIBUTION */}
      <div className="bg-white p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
        <h3 className="text-xs sm:text-sm font-black text-[#27AE60] uppercase tracking-wider mb-6">
          Property Status Distribution
        </h3>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart
            layout="vertical"
            data={[
              {
                name: "Properties",
                Active: data.superAdminPropertyAnalytics?.active || 0,
                Pending: data.superAdminPropertyAnalytics?.pending || 0,
                Draft: data.superAdminPropertyAnalytics?.draft || 0,
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip />

            <Bar dataKey="Active" stackId="a" fill="#10b981" />
            <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Draft" stackId="a" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <LegendItem
            color="bg-emerald-500"
            label="Active"
            value={data.superAdminPropertyAnalytics?.active}
          />
          <LegendItem
            color="bg-amber-500"
            label="Pending"
            value={data.superAdminPropertyAnalytics?.pending}
          />
          <LegendItem
            color="bg-blue-500"
            label="Draft"
            value={data.superAdminPropertyAnalytics?.draft}
          />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-xs font-bold text-slate-500 uppercase">
      {label} ({value || 0})
    </span>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, sub, icon, color, trend, route }) => {

  const navigate = useNavigate();

  const colors = {
    blue: "bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-200",
    emerald:
      "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200",
    purple: "bg-gradient-to-br from-purple-600 to-purple-700 shadow-purple-200",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200",
    green: "bg-gradient-to-br from-green-500 to-green-600 shadow-green-200",
    white: "bg-white shadow-slate-200",
  };

  return (
    <div
      onClick={() => route && navigate(route)}
      className={`${colors[color]} p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-3xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer`}
    >
      <div className="relative z-10">
        <p className="text-[10px] sm:text-xs text-[#000000] uppercase opacity-70 tracking-wider mb-1 sm:mb-2">
          {title}
        </p>
        <h2 className="text-2xl text-[#000000] sm:text-3xl md:text-4xl  tracking-tight">
          {value}
        </h2>
        <div className="flex items-center text-[#000000] gap-2 mt-2 sm:mt-3 opacity-80 text-[10px] sm:text-xs ">
          <span>{sub}</span>
          {trend && (
            <span className="bg-green-200 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4 bg-green-500 p-2 sm:p-2.5 rounded-xl md:rounded-2xl backdrop-blur-md border border-green-500">
        {icon}
      </div>
    </div>
  );
};

// Metric Box Component
const MetricBox = ({ icon, label, value, color }) => {
  const colors = {
    blue: "border-blue-200 bg-blue-50/50 text-blue-600",
    emerald: "border-emerald-200 bg-emerald-50/50 text-emerald-600",
    purple: "border-purple-200 bg-purple-50/50 text-purple-600",
    orange: "border-orange-200 bg-orange-50/50 text-orange-600",
  };

  return (
    <div
      className={`${colors[color]} p-4 rounded-xl md:rounded-2xl border-2 hover:shadow-md transition-all`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide opacity-70">
          {label}
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-black">{value}</div>
    </div>
  );
};





export default SuperAdminDashboard;