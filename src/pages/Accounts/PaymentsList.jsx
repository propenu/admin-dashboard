import React, { useState, useEffect, useCallback } from "react";
import { getPaymentsList } from "../../features/payment/paymentServices";

/* ================================
   Main Component
================================ */
const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("paid");

  const fetchPayments = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentsList(status);
      setPayments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(currentStatus);
  }, [currentStatus, fetchPayments]);

  return (
    <div className="p-2 md:p-2  min-h-screen">
      <Header
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
        refresh={() => fetchPayments(currentStatus)}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && <Loader />}
        {error && <ErrorState message={error} />}
        {!loading && !error && payments.length === 0 && (
          <EmptyState status={currentStatus} />
        )}

        {!loading && !error && payments.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-[#27AE60]">
                  <tr>
                    <TH>Date</TH>
                    <TH>User</TH>
                    <TH>Amount</TH>
                    <TH className="hidden lg:table-cell">Gateway</TH>
                    <TH align="right">Status</TH>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((payment) => (
                    <DesktopRow key={payment._id} payment={payment} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden p-4">
              {payments.map((payment) => (
                <MobileCard key={payment._id} payment={payment} />
              ))}
            </div>

            <Footer count={payments.length} />
          </>
        )}
      </div>
    </div>
  );
};

/* ================================
   Header
================================ */
const Header = ({ currentStatus, setCurrentStatus, refresh }) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
    <div>
      <h1 className="text-2xl font-black text-[#27AE60]">Transactions</h1>
      <p className="text-gray-500 text-sm">
        Managing <span className="font-bold">{currentStatus}</span> records
      </p>
    </div>

    <div className="flex bg-gray-200 p-1 rounded-2xl shadow-inner w-full lg:w-auto">
      {["paid", "failed"].map((status) => (
        <button
          key={status}
          onClick={() => setCurrentStatus(status)}
          className={`flex-1 px-6 py-2 rounded-xl text-sm  transition ${
            currentStatus === status
              ? "bg-white shadow text-[#27AE60]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {status}
        </button>
      ))}
    </div>

    <div className="flex gap-2 w-full lg:w-auto">
      <button className="flex-1 lg:flex-none bg-white border px-4 py-2 rounded-xl text-sm  hover:bg-gray-50">
        Export
      </button>
      <button
        onClick={refresh}
        className="flex-1 lg:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl text-sm  hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  </div>
);

/* ================================
   Desktop Row
================================ */
const DesktopRow = ({ payment }) => (
  <tr className="hover:bg-blue-50/20 transition">
    <td className="px-6 py-5">
      <DateBlock date={payment.createdAt} />
    </td>

    <td className="px-6 py-5">
      <span className="text-xs font-mono text-gray-500">
        ID: {payment.userId?.slice(-6)}
      </span>
    </td>

    <td className="px-6 py-5">
      <span className="font-bold text-gray-900">
        {payment.currency} {payment.amount?.toLocaleString()}
      </span>
    </td>

    <td className="hidden lg:table-cell px-6 py-5 font-mono text-xs text-blue-500">
      {payment.razorpayPaymentId || "N/A"}
    </td>

    <td className="px-6 py-5 text-right">
      <StatusBadge status={payment.status} />
    </td>
  </tr>
);

/* ================================
   Mobile Card
================================ */
const MobileCard = ({ payment }) => (
  <div className="bg-white border rounded-2xl p-4 shadow-sm">
    <div className="flex justify-between mb-3">
      <DateBlock date={payment.createdAt} />
      <StatusBadge status={payment.status} />
    </div>

    <div className="text-sm font-bold text-gray-900">
      {payment.currency} {payment.amount?.toLocaleString()}
    </div>

    <div className="text-xs text-gray-400 mt-2 font-mono">
      User ID: {payment.userId?.slice(-6)}
    </div>

    <div className="text-xs text-blue-500 mt-1 font-mono">
      {payment.razorpayPaymentId || "N/A"}
    </div>
  </div>
);

/* ================================
   Reusable Components
================================ */
const StatusBadge = ({ status }) => {
  const isPaid = status === "paid";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
        isPaid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      }`}
    >
      {status}
    </span>
  );
};

const DateBlock = ({ date }) => {
  const d = new Date(date);
  return (
    <div>
      <div className="text-sm font-bold text-gray-900">
        {d.toLocaleDateString("en-GB")}
      </div>
      <div className="text-xs text-gray-400">
        {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
};

const TH = ({ children, align }) => (
  <th
    className={`px-6 py-5 text-[11px] font-black text-gray-400 uppercase ${
      align === "right" ? "text-right" : ""
    }`}
  >
    {children}
  </th>
);

const Loader = () => (
  <div className="p-20 flex flex-col items-center gap-4">
    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="text-gray-400 animate-pulse">Loading transactions...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="p-20 text-center text-red-500 font-semibold">{message}</div>
);

const EmptyState = ({ status }) => (
  <div className="p-20 text-center text-gray-400 italic">
    No {status} transactions found.
  </div>
);

const Footer = ({ count }) => (
  <div className="px-6 py-5 bg-gray-50 border-t text-sm font-bold text-gray-500 flex justify-between">
    <span>Showing {count} results</span>
    <button className="text-blue-600 hover:text-blue-800">Next Page →</button>
  </div>
);

export default PaymentsList;
