
//frontend/admin-dashboard/src/pages/Payments/AgentPayments/ServiceDetailsCard.jsx
import { FEATURE_CONFIG } from "./featureConfig";
import  Illustration  from "../../../assets/illustration.svg"
const LABELS = {
  PROPERTY_LISTING_LIMIT: "No. of Property Listings",
  BUYER_REACH_PERCENT: "Buyer Reach",
  BUYER_ACCESS: "Buyer Access",
  LEAD_DASHBOARD: "Lead Dashboard",
  TEAM_MEMBERS: "Manage Account",
  ENQUIRY_LIMIT: "No. of Enquires",
  TOP_LISTING_DAYS: "Top Visibility",
  CONTACT_OWNER_LIMIT: "Contact Owner Limit",
  NEW_LEADS: "New Leads",
  ACTIVE_LEADS: "Active Leads",
  FOLLOW_UPS: "Follow Ups",
  PHOTOSHOOT: "Photoshoot",
  WALKTHROUGH_3D: "3D Walkthrough",
  BANNER: "Banner Promotion",
  PROPERTY_COMPARISON: "Property Comparison",
};

export default function ServiceDetailsCard({ userType, category }) {
  //const featureKeys = FEATURE_CONFIG[userType] || [];

  const featureKeys =
    userType === "owner"
      ? FEATURE_CONFIG.owner?.[category] || []
      : FEATURE_CONFIG[userType] || [];


      


  return (
    <div className="relative w-[230px] top-[40px] max-sm:w-[190px]">
      {/* Illustration */}
      <img
        // src="/src/assets/illustration.svg"
        src={Illustration}
        alt="illustration"
        className="absolute top-3 left-4 w-[50px]"
      />

      {/* Header */}
      <div className="pt-3 pl-8 mb-3 relative left-6 top-3">
        <p className="text-[12px] text-[#27AE60] mb-1">Get started</p>
        <h3 className="text-[16px] font-medium text-black">Service Details</h3>
      </div>

      {/* Feature list */}
      <div className="bg-[#27AE60] rounded-[8px] px-5  pt-[74px] pb-4 text-white   ">
        {featureKeys.map((key) => (
          <div
            key={key}
            className="border-b border-white/20 h-[53px] flex items-center text-sm"
          >
            {LABELS[key]}
          </div>
        ))}
      </div>
    </div>
  );
}
