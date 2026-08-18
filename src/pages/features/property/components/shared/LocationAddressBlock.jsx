import { MapPin } from "lucide-react";

function PlaceChip({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold capitalize text-slate-700 break-words">
        {value}
      </p>
    </div>
  );
}

/**
 * Address on its own line; locality / city / state / pincode as separate chips.
 */
export default function LocationAddressBlock({
  address,
  locality,
  city,
  state,
  pincode,
  className = "",
}) {
  const hasAddress = Boolean(String(address || "").trim());
  const hasPlaces = Boolean(
    locality || city || state || pincode,
  );

  if (!hasAddress && !hasPlaces) return null;

  return (
    <div className={`mt-2 space-y-2 ${className}`}>
      {hasAddress ? (
        <div className="flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#27AE60]" />
          <span className="min-w-0 break-words">{String(address).trim()}</span>
        </div>
      ) : (
        <div className="flex items-start gap-1.5 text-sm text-slate-400">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#27AE60]" />
          <span>Address not set</span>
        </div>
      )}

      {hasPlaces ? (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <PlaceChip label="Locality" value={locality} />
          <PlaceChip label="City" value={city} />
          <PlaceChip label="State" value={state} />
          <PlaceChip label="Pincode" value={pincode} />
        </div>
      ) : null}
    </div>
  );
}
