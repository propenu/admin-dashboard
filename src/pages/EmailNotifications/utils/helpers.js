
//src/pages/EmailNotifications/utils/helpers.js

// ─── helpers ──────────//
export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";


export const getCatMeta = (c) =>
  CATEGORY_META[c] || {
    // icon: <Mail size={14} />,
    icon:"mail",
    label: c,
    color: "bg-gray-100 text-gray-600 border-gray-200",
  };

export const CATEGORY_META = {
  festival: {
    // icon: <PartyPopper size={14} />,
    icon:"partypopper",
    label: "Festival",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  offer: {
    // icon: <Send size={14} />,
    icon:"send",
    label: "Offer",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  transactional: {
    // icon: <Zap size={14} />,
    icon:"zap",
    label: "Transactional",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
};
 

// ─── Extract {{varName}} — ignores pure numbers like {{1}}, {{2}} ──────────
export const extractVarNames = (text) => {
  if (!text) return [];
  const seen = new Set();
  const result = [];
  for (const m of text.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)) {
    const name = m[1];
    if (/^\d+$/.test(name)) continue;
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
};


// Convert {{name}} → {name} (for saving)
export const toSingleBraces = (text) =>
  (text || "").replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, "{$1}");


// Convert {name} → {{name}} (for editing UI)
export const toDoubleBraces = (text) =>
  (text || "").replace(/\{([a-zA-Z0-9_]+)\}/g, "{{$1}}");


// ─── Extract from both subject + stripped HTML body ───────────────────────
export const extractAllVars = (subject, content) => {
  const stripped = (content || "").replace(/<[^>]*>/g, " ");
  const seen = new Set();
  const result = [];
  for (const name of [
    ...extractVarNames(subject),
    ...extractVarNames(stripped),
  ]) {
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
};

// ─── Build samples map from API variables array ───────────────────────────
export const toSamplesMap = (vars) => {
  const map = {};
  (Array.isArray(vars) ? vars : []).forEach((v) => {
    if (typeof v === "string") map[v] = "";
    else if (v?.name) map[v.name] = v.sample ?? "";
  });
  return map;
};

// ─── Replace {{varName}} with actual sample values ────────────────────────
export const applyValues = (text, samplesMap) =>
  (text || "").replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, name) =>
    samplesMap[name]?.trim() ? samplesMap[name] : `{{${name}}}`,
  ); 


  