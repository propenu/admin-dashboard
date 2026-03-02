
//frontend/admin-dashboard/src/pages/Payments/AgentPayments/PricingSection.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PricingCard from "./PricingCard";
import ServiceDetailsCard from "./ServiceDetailsCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { fetchPaymentPlans } from "../../../store/payment/paymentThunks";
import Plash from "../../../assets/plash.svg?react";

export default function PricingSection({ userType, category }) {
  const dispatch = useDispatch();
  const { plans = [], loading } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchPaymentPlans({ userType, category }));
  }, [dispatch, userType, category]);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="w-full   ">
      {/* Badge */}
      <div className="flex justify-center  mb-2  max-sm:text-center">
        <span
          className="inline-flex items-center gap-2 px-6 py-2
          rounded-full bg-[#F1FCF5] text-[#27AE60]
          shadow-md text-sm font-medium"
        >
          <img src={Plash} className="w-4  max-sm:w-8" />
          Upgrade today and close more deals with confidence
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-center text-[20px] mb-20">
        Scale Your real estate business with our flexible pricing.
      </h2>

      {/* Content */}
      <div className="flex gap-4 items-start  ">
        <ServiceDetailsCard userType={userType} category={category} />

        <div className="grid grid-cols-1  md:grid-cols-2 gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard key={plan._id} plan={plan} userType={userType} />
          ))}
        </div>
      </div>
    </section>
  );
}
