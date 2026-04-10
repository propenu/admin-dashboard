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
  "PROPERTY_COMPARISON",
  "LEAD_DASHBOARD",
];

export default function PricingCard({ plan, userType }) {
  const dispatch = useDispatch();

  const {
    code,
    name,
    price,
    dprice,
    durationDays,
    features = {},
    createdAt,
  } = plan;

  //const featureKeys = FEATURE_CONFIG[userType] || [];

  const featureKeys =
    userType === "owner"
      ? FEATURE_CONFIG.owner?.[plan.category] || []
      : FEATURE_CONFIG[userType] || [];

  /* ================= STATE ================= */
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  /* ================= SAVE HANDLER ================= */
  // const handleSave = (key) => {
  //   let oldValue;

  //   if (key === "PRICE") oldValue = price;
  //   else if (key === "dprice") oldValue = dprice;
  //   else if (key === "DURATION_DAYS") oldValue = durationDays;
  //   else oldValue = features[key];

  //   if (editValue === "" || Number(editValue) === Number(oldValue)) {
  //     setEditingKey(null);
  //     return;
  //   }

  //   let payload = {};

  //   if (key === "PRICE") {
  //     payload = { price: Number(editValue) };
  //   } else if (key === "dprice") {
  //     payload = { dprice: Number(editValue) };
  //   }
  //    else if (key === "DURATION_DAYS") {
  //     payload = { durationDays: Number(editValue) };
  //   } else {
  //     payload = {
  //       features: {
  //         ...features,
  //         [key]: Number(editValue),
  //       },
  //     };
  //   }

  //   dispatch(
  //     patchPaymentPlanThunk({
  //       code,
  //       updatedFields: payload,
  //     })
  //   )
  //     .unwrap()
  //     .catch((err) => {
  //       console.error("❌ Update failed:", err);
  //       alert("Update failed");
  //     });

  //   setEditingKey(null);
  // };

  const handleSave = (key) => {
    let oldValue;

    if (key === "PRICE") oldValue = price;
    else if (key === "DPRICE") oldValue = dprice;
    else if (key === "DURATION_DAYS") oldValue = durationDays;
    else oldValue = features[key];
    if (editValue === "" || Number(editValue) === Number(oldValue)) {
      setEditingKey(null);
      return;
    }
    let payload = {};
    // ✅ PRICE update
    if (key === "PRICE") {
      payload = { price: Number(editValue) };
    }
    // ✅ DPRICE update
    else if (key === "DPRICE") {
      payload = { dprice: Number(editValue) };
    }
    // ✅ DURATION update
    else if (key === "DURATION_DAYS") {
      payload = { durationDays: Number(editValue) };
    }
    // ✅ FEATURES update
    else {
      payload = {
        features: {
          ...features,
          [key]: Number(editValue),
        },
      };
    }
    dispatch(
      patchPaymentPlanThunk({
        code,
        updatedFields: payload,
      }),
    )
      .unwrap()
      .catch((err) => {
        console.error("Update failed:", err);
        alert("Update failed");
      });

    setEditingKey(null);
  };

  const discountPercent = useMemo(() => {
    if (!price || !dprice) return 0;

    const percent = ((dprice - price) / dprice) * 100;
    return Math.round(percent);
  }, [price, dprice]);

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
          <p className="text-[#27AE60] text-lg text-nowrap font-medium   max-sm:text-sm">
            {name}
          </p>
          {/* ================= PRICE ================= */}

          <div className="relative flex items-center justify-center gap-1">
            {/* PRICE */}
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
              <>
                <p className="text-black text-xl font-semibold">₹{price}</p>
                <Pencil
                  size={12}
                  className="cursor-pointer text-gray-400 hover:text-[#27AE60]"
                  onClick={() => {
                    setEditingKey("PRICE");
                    setEditValue(price);
                  }}
                />
              </>
            )}

            <span className="text-xs">/</span>

            {/* DISCOUNT PRICE */}
            {editingKey === "DPRICE" ? (
              <input
                autoFocus
                type="number"
                className="w-16 border rounded px-1 text-sm text-center"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSave("DPRICE")}
              />
            ) : (
              <>
                <p className="text-red-500 text-[10px] font-semibold line-through">
                  ₹{dprice}
                </p>
                <Pencil
                  size={12}
                  className="cursor-pointer text-gray-400 hover:text-[#27AE60]"
                  onClick={() => {
                    setEditingKey("DPRICE");
                    setEditValue(dprice);
                  }}
                />
              </>
            )}

            {/* Discount % */}
            {discountPercent > 0 && (
              <span
                className="absolute -top-12 -right-5 text-white text-[11px] font-bold bg-gradient-to-r from-[#27AE60] to-[#2ECC71] px-2 py-[3px] rounded-full shadow-lg animate-pulse transition-transform duration-300 hover:scale-110
                max-sm:-top-12 max-sm:right-8 max-sm:text-[10px] max-sm:shadow-lime-900"
              >
                {discountPercent}% OFF
              </span>
            )}
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
              className={"cursor-pointer text-gray-400 hover:text-[#27AE60]"}
              onClick={() => {
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
                className={
                  "cursor-pointer text-gray-400 hover:text-[#27AE60] shrink-0"
                }
                onClick={() => {
                  setEditingKey(key);
                  setEditValue(value ?? "");
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
