//frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/residentialCompletion.js

export const COMPLETION_STEPS = [
  {
    step: 1,
    percent: 25,
    section: "basic",
    requiredFields: ["title", "listingType", "propertyType", "price"],
  },
  {
    step: 2,
    percent: 50,
    section: "location",
    requiredFields: ["address", "city", "state", "pincode", "location"],
  },
  {
    step: 3,
    percent: 75,
    section: "property",
    requiredFields: ["amenities", "flooringType", "kitchenType"],
  },
  {
    step: 4,
    percent: 100,
    section: "verification",
    requiredFields: ["gallery", "verificationDocuments"],
  },
];

export function calculateCompletion(data) {
  if (!data) {
    return {
      percent: 0,
      step: 0,
      lastSection: "none",
    };
  }

  let percent = 0;
  let step = 0;
  let lastSection = "none";

  for (const s of COMPLETION_STEPS) {
    const isComplete = s.requiredFields.every((field) => {
      const value = data[field];

      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object")
        return value && Object.keys(value).length > 0;

      return Boolean(value);
    });

    if (isComplete) {
      percent = s.percent;
      step = s.step;
      lastSection = s.section;
    } else {
      break;
    }
  }

  return { percent, step, lastSection };
}
