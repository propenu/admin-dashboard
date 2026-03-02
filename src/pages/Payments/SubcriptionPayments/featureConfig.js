// //frontend/admin-dashboard/src/pages/Payments/AgentPayments/featureConfig.js
// export const FEATURE_CONFIG = {
//   agent: [
//     "PROPERTY_LISTING_LIMIT",
//     "BUYER_REACH_PERCENT",
//     "ENQUIRY_LIMIT",
//     "TOP_LISTING_DAYS",
//     "TEAM_MEMBERS",
//   ],
//   owner: ["PROPERTY_LISTING_LIMIT", "ENQUIRY_LIMIT", "TOP_LISTING_DAYS"],
//   buyer: ["CONTACT_OWNER_LIMIT"],
//   builder: [
//     "TOP_LISTING_DAYS",
//     "LEAD_DASHBOARD",
//     "NEW_LEADS",
//     "ACTIVE_LEADS",
//     "FOLLOW_UPS",
//     "TEAM_MEMBERS",
//     "PHOTOSHOOT",
//     "WALKTHROUGH_3D",
//     "BANNER",
//     "BUYER_ACCESS",
//   ],
// };


// frontend/admin-dashboard/src/pages/Payments/AgentPayments/featureConfig.js

export const FEATURE_CONFIG = {
  agent: [
    "PROPERTY_LISTING_LIMIT",
    "BUYER_REACH_PERCENT",
    "ENQUIRY_LIMIT",
    "TOP_LISTING_DAYS",
    "TEAM_MEMBERS",
  ],

  owner: {
    buy: ["CONTACT_OWNER_LIMIT"],

    rent_view: [
      "CONTACT_OWNER_LIMIT",
      "PROPERTY_COMPARISON",
      "LEAD_DASHBOARD",
    ],

    rent: [
      "PROPERTY_LISTING_LIMIT",
      "ENQUIRY_LIMIT",
      "TOP_LISTING_DAYS",
    ],

    sell: [
      "PROPERTY_LISTING_LIMIT",
      "ENQUIRY_LIMIT",
      "TOP_LISTING_DAYS",
    ],
  },
};
