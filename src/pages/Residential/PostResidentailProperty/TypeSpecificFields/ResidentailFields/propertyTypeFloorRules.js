export const getPropertyTypeFloorRules = (propertyType, totalFloors = 0) => {
  switch (propertyType) {
    case "apartment":
    case "penthouse":
      return {
        showTotalTowers: true,
        showTotalFloors: true,
        showPropertyFloor: true,
      };

    case "independent-house":
      return {
        showTotalTowers: false,
        showTotalFloors: true,
        // A floor number is only meaningful for a multi-floor house.
        showPropertyFloor: Number(totalFloors) > 1,
      };

    case "villa":
    case "farmhouse":
      return {
        showTotalTowers: false,
        showTotalFloors: true,
        showPropertyFloor: false,
      };

    default:
      return {
        showTotalTowers: false,
        showTotalFloors: true,
        showPropertyFloor: true,
      };
  }
};
