export const parseTemplateList = (res) => {
  const d = res?.data;
  // nested data.data.data (your actual API structure)
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.templates)) return d.templates;
  if (Array.isArray(d)) return d;
  return [];
};