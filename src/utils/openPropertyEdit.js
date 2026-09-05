import { actions } from "../store/newIndex";
import { setActiveCategory } from "../store/Ui/uiSlice";

export const PROPERTY_EDIT_CATEGORIES = [
  "residential",
  "commercial",
  "land",
  "agricultural",
];

/** Normalize any category alias to the edit-wizard slice key. */
export const resolvePropertyEditCategory = (propertyOrCategory, fallback = "") => {
  const raw =
    typeof propertyOrCategory === "string"
      ? propertyOrCategory
      : propertyOrCategory?._category ||
        propertyOrCategory?.propertyCategory ||
        propertyOrCategory?.categoryType ||
        propertyOrCategory?.category ||
        fallback;

  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

  if (PROPERTY_EDIT_CATEGORIES.includes(key)) return key;
  if (key.includes("resid")) return "residential";
  if (key.includes("commerc")) return "commercial";
  if (key.includes("agricult") || key.includes("farm")) return "agricultural";
  if (key === "plot" || key.includes("land")) return "land";
  if (PROPERTY_EDIT_CATEGORIES.includes(String(fallback || "").toLowerCase())) {
    return String(fallback).toLowerCase();
  }
  return "";
};

/**
 * Prepare Redux + localStorage, then return navigate path for property edit.
 * Shared by residential / commercial / land / agricultural entry points.
 */
export const preparePropertyEdit = ({
  dispatch,
  property,
  category: categoryHint,
  hydrate = true,
  resetOtherCategories = true,
} = {}) => {
  const id = String(property?._id || property?.id || "").trim();
  const category = resolvePropertyEditCategory(property, categoryHint);
  if (!id || !category || !actions[category]) return null;

  localStorage.setItem("editPropertyId", id);
  localStorage.setItem("editPropertyCategory", category);

  if (typeof dispatch === "function") {
    dispatch(setActiveCategory(category));

    if (resetOtherCategories) {
      PROPERTY_EDIT_CATEGORIES.forEach((cat) => {
        if (cat !== category && actions[cat]?.resetForm) {
          dispatch(actions[cat].resetForm());
        }
      });
    }

    if (hydrate && actions[category]?.hydrateForm && property) {
      dispatch(
        actions[category].hydrateForm({
          ...property,
          propertyCategory: category,
          _id: id,
        }),
      );
    }
  }

  return {
    id,
    category,
    path: `/edit-property/${id}`,
  };
};

export const navigateToPropertyEdit = ({
  navigate,
  dispatch,
  property,
  category,
  hydrate = true,
}) => {
  const prepared = preparePropertyEdit({
    dispatch,
    property,
    category,
    hydrate,
  });
  if (!prepared || typeof navigate !== "function") return null;
  navigate(prepared.path);
  return prepared;
};
