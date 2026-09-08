//frontend/admin-dashboard/src/pages/Payments/AgentPayments/PricingSection.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PricingCard from "./PricingCard";
import ServiceDetailsCard from "./ServiceDetailsCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { fetchPaymentPlans } from "../../../store/payment/paymentThunks";
import Plash from "../../../assets/plash.svg?react";
import { useLivePermissions } from "../../../utils/useLivePermissions";

export default function PricingSection({ userType, category }) {
  const dispatch = useDispatch();
  const { plans = [], loading } = useSelector((state) => state.payment);
  const { loading: permsLoading, planAccess, uiFlags } = useLivePermissions();

  useEffect(() => {
    if (!planAccess.canView) return;
    dispatch(fetchPaymentPlans({ userType, category }));
  }, [dispatch, userType, category, planAccess.canView]);

  if (permsLoading) return <LoadingSpinner />;

  if (!planAccess.canView) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">Plans view is disabled</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            You don’t have access to this section yet. Please ask your higher official
            to enable <span className="font-semibold text-slate-700">Plans → View</span>{" "}
            on your role. To edit price, plan time, or features, they must also enable{" "}
            <span className="font-semibold text-slate-700">Plans → Update</span>.
          </p>
        </div>
      </div>
    );
  }

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

      {!planAccess.canUpdate && (
        <p className="mb-4 text-center text-[11px] text-slate-500">
          Read-only mode — ask your higher official to enable{" "}
          <span className="font-semibold text-slate-700">Plans → Update</span> so you can edit
          price, plan time (days), and features.
        </p>
      )}

      {/* Content */}
      <div className="flex gap-4 items-start  ">
        <ServiceDetailsCard userType={userType} category={category} />

        <div className="grid grid-cols-1  md:grid-cols-2 gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard
              key={plan._id}
              plan={plan}
              userType={userType}
              canUpdate={uiFlags.showPlanEditButton}
              canAssign={planAccess.canAssign}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
