//frontend/admin-dashboard/src/pages/Payments/AgentPayments/usePaymentPlans.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentPlans } from "../../../store/payment/paymentThunks";

import PricingCard from "./PricingCard";
import ServiceDetailsCard from "./ServiceDetailsCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

export default function PricingSection({ userType, category }) {
  const dispatch = useDispatch();
  const { plans = [], loading } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchPaymentPlans({ userType, category }));
  }, [dispatch, userType, category]);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="w-full rounded-md">
      <div className="flex gap-4">
        <ServiceDetailsCard userType={userType} />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <PricingCard key={plan._id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
