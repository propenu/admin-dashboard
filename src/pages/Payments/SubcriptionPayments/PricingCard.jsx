



// frontend/admin-dashboard/src/pages/Payments/AgentPayments/PricingCard.jsx
import { useDispatch } from "react-redux";
import { useState, useMemo, useEffect } from "react";
import { setSelectedPlan } from "../../../store/payment/PaymentSlice";
import { patchPaymentPlanThunk } from "../../../store/payment/paymentThunks";
import { FEATURE_CONFIG } from "./featureConfig";
import { Pencil } from "lucide-react";

/* Features that show "Up to X" */
const UP_TO_FEATURES = [
  "ENQUIRY_LIMIT",
  "PROPERTY_LISTING_LIMIT",
  "CONTACT_OWNER_LIMIT",
];

export default function PricingCard({ plan, userType }) {
  const dispatch = useDispatch();

  const { code, name, price, durationDays, features = {}, createdAt } = plan;

  //const featureKeys = FEATURE_CONFIG[userType] || [];
  
  const featureKeys =
    userType === "owner"
      ? FEATURE_CONFIG.owner?.[plan.category] || []
      : FEATURE_CONFIG[userType] || [];


  /* ================= STATE ================= */
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  /* ================= EXPIRY CHECK ================= */
  const isExpired = useMemo(() => {
    if (!createdAt || !durationDays) return false;

    const start = new Date(createdAt);
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + durationDays);

    return new Date() > expiry;
  }, [createdAt, durationDays]);

  /* ================= SAVE HANDLER ================= */
  const handleSave = (key) => {
    let oldValue;

    if (key === "PRICE") oldValue = price;
    else if (key === "DURATION_DAYS") oldValue = durationDays;
    else oldValue = features[key];

    if (editValue === "" || Number(editValue) === Number(oldValue)) {
      setEditingKey(null);
      return;
    }

    let payload = {};

    if (key === "PRICE") {
      payload = { price: Number(editValue) };
    } else if (key === "DURATION_DAYS") {
      payload = { durationDays: Number(editValue) };
    } else {
      payload = {
        features: {
          [key]: Number(editValue),
        },
      };
    }

    dispatch(
      patchPaymentPlanThunk({
        code,
        updatedFields: payload,
      })
    )
      .unwrap()
      .catch((err) => {
        console.error("❌ Update failed:", err);
        alert("Update failed");
      });

    setEditingKey(null);
  };

  /* ================= FORMAT FEATURE ================= */
  const formatValue = (key, value) => {
    if (value === undefined) return "-";
    if (key === "BUYER_REACH_PERCENT") return `${value}%`;
    if (UP_TO_FEATURES.includes(key)) return `Up to ${value}`;
    if (key === "TOP_LISTING_DAYS") return `${value} Days`;
    if (key === "TEAM_MEMBERS")
      return `${value} Team Member${value > 1 ? "s" : ""}`;
    return value;
  };

  return (
    <div className="w-[180px] bg-white rounded-lg shadow-md flex flex-col  max-sm:w-[140px]">
      {/* ================= TOP ================= */}
      <div className="flex justify-center">
        <div className="w-[160px] bg-[#F1FCF5] rounded-md m-2 p-3 text-center space-y-1">
          <p className="text-[#27AE60] text-lg text-nowrap font-medium   max-sm:text-sm">{name}</p>
          {/* ================= PRICE ================= */}
          <div className="flex items-center justify-center gap-1">
            {editingKey === "PRICE" ? (
              <input
                autoFocus
                type="number"
                className="w-16 border rounded px-1 text-sm text-center"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSave("PRICE")}
              />
            ) : (
              <p className="text-black text-lg font-semibold">₹{price}</p>
            )}

            <Pencil
              size={12}
              className={`${
                isExpired
                  ? "text-gray-300 cursor-not-allowed"
                  : "cursor-pointer text-gray-400 hover:text-[#27AE60]"
              }`}
              onClick={() => {
                if (isExpired) return;
                setEditingKey("PRICE");
                setEditValue(price);
              }}
            />
          </div>

          {/* ================= DURATION ================= */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            {editingKey === "DURATION_DAYS" ? (
              <input
                autoFocus
                type="number"
                className="w-14 border rounded px-1 text-xs text-center"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSave("DURATION_DAYS")}
              />
            ) : (
              <span>{durationDays} Days</span>
            )}

            <Pencil
              size={10}
              className={`${
                isExpired
                  ? "text-gray-300 cursor-not-allowed"
                  : "cursor-pointer text-gray-400 hover:text-[#27AE60]"
              }`}
              onClick={() => {
                if (isExpired) return;
                setEditingKey("DURATION_DAYS");
                setEditValue(durationDays);
              }}
            />
          </div>

          <button
            onClick={() => dispatch(setSelectedPlan(plan))}
            className="mt-2 w-full bg-[#27AE60] text-white text-xs py-1 rounded"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <div className="px-4 pt-[35px] pb-4 text-sm text-center">
        {featureKeys.map((key) => {
          const value = features[key];

          return (
            // ... inside the features map
            <div
              key={key}
              className="border-b border-[#F3F1F1] h-[53px]  flex items-center justify-center gap-1"
            >
              <div className="flex-1 flex justify-center items-center">
                {editingKey === key ? (
                  <input
                    autoFocus
                    type="number"
                    className="w-full border rounded px-1 text-xs text-center h-8"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(key)}
                  />
                ) : (
                  <span className="text-xs">{formatValue(key, value)}</span>
                )}
              </div>

              <Pencil
                size={12}
                className={`${
                  isExpired
                    ? "text-gray-300 cursor-not-allowed"
                    : "cursor-pointer text-gray-400 hover:text-[#27AE60]"
                } shrink-0`}
                onClick={() => {
                  if (isExpired) return;
                  setEditingKey(key);
                  setEditValue(value ?? "");
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ================= EXPIRED LABEL ================= */}
      {isExpired && (
        <div className="text-[10px] text-red-500 text-center pb-2">
          Plan expired – editing disabled
        </div>
      )}
    </div>
  );
}

