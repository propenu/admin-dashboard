// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/UsePropertySlice/useActivePropertySlice.jsx
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../../../store/newIndex";

export const useActivePropertySlice = () => {
  const dispatch = useDispatch();

  const activeCategory = useSelector((state) => state.ui.activeCategory);
   
  const form = useSelector((state) => state[activeCategory].form);

  const updateFieldValue = (key, value) => {
    dispatch(actions[activeCategory].updateField({ key, value }));
  };

   

  const updateNestedFieldValue = (parent, child, value) => {
    dispatch(
      actions[activeCategory].updateNestedField({
        parent,
        child,
        value,
      }),
    );
  };

  const toggleArrayValue = (key, value) => {
    const existing = Array.isArray(form[key]) ? form[key] : [];

    const updated = existing.some((item) =>
      typeof item === "object" ? item.title === value : item === value,
    )
      ? existing.filter((item) =>
          typeof item === "object" ? item.title !== value : item !== value,
        )
      : [...existing, typeof value === "string" ? { title: value } : value];

    updateFieldValue(key, updated);
  };

  const toggleStringArrayValue = (key, value) => {
    const existing = Array.isArray(form[key]) ? form[key] : [];

    const updated = existing.includes(value)
      ? existing.filter((v) => v !== value)
      : [...existing, value];

    updateFieldValue(key, updated);
  };

  return {
    activeCategory,
    form,
    updateFieldValue,
    updateNestedFieldValue,
    toggleArrayValue,
    toggleStringArrayValue,
  };
};;
