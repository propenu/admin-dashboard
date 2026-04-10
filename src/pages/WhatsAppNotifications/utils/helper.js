export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const applyVars = (text = "", examples = []) => {
  let r = text;
  examples.forEach((val, i) => {
    r = r.replace(
      new RegExp(`\\{\\{${i + 1}\\}\\}`, "g"),
      val || `{{${i + 1}}}`,
    );
  });
  return r;
};

export const countVars = (text = "") => {
  const m = text.match(/\{\{\d+\}\}/g) || [];
  const n = m.map((x) => parseInt(x.replace(/[{}]/g, ""), 10));
  return n.length ? Math.max(...n) : 0;
};
