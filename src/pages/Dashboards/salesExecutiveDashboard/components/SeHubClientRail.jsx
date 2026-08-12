import { AlertCircle, MapPin, Search } from "lucide-react";
import {
  clientId,
  clientLocation,
  clientRoleLabel,
  formatShortDate,
  groupClientsByLocation,
} from "../salesExecutiveHubData";

const selectCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400";

export default function SeHubClientRail({
  clients,
  selectedClientId,
  onSelect,
  searchQuery,
  onSearchChange,
  locationFilters,
  onLocationFilter,
  locationOptions,
  lastMeetingByClientId = {},
  followUpClientIds = new Set(),
}) {
  const groups = groupClientsByLocation(clients);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-3 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Clients ({clients.length})
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">By location</p>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients by name, phone…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-400 focus:bg-white"
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <select
            className={selectCls}
            value={locationFilters.state}
            onChange={(e) => onLocationFilter("state", e.target.value)}
          >
            <option value="">State</option>
            {locationOptions.states.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={locationFilters.city}
            onChange={(e) => onLocationFilter("city", e.target.value)}
          >
            <option value="">City</option>
            {locationOptions.cities.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={locationFilters.pincode}
            onChange={(e) => onLocationFilter("pincode", e.target.value)}
          >
            <option value="">Pincode</option>
            {locationOptions.pincodes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={locationFilters.locality}
            onChange={(e) => onLocationFilter("locality", e.target.value)}
          >
            <option value="">Locality</option>
            {locationOptions.localities.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {!clients.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-xs text-slate-500">
            No clients for this search / location.
          </div>
        ) : (
          groups.map(({ region, rows }) => (
            <div key={region}>
              <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="h-3 w-3" />
                {region}
              </p>
              <div className="space-y-1.5">
                {rows.map((client) => {
                  const id = clientId(client);
                  const selected = id === selectedClientId;
                  const loc = clientLocation(client);
                  const lastMeeting = lastMeetingByClientId[id];
                  const due = followUpClientIds.has(id);
                  return (
                    <button
                      key={id || client.email || client.name}
                      type="button"
                      onClick={() => onSelect(id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                        selected
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`line-clamp-1 text-sm font-bold ${
                            selected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {client.name || "Unnamed client"}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            selected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {clientRoleLabel(client)}
                        </span>
                      </div>
                      <p
                        className={`mt-1 line-clamp-1 text-[11px] ${
                          selected ? "text-emerald-50" : "text-slate-500"
                        }`}
                      >
                        {loc.line}
                      </p>
                      <p
                        className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${
                          selected
                            ? due
                              ? "text-amber-100"
                              : "text-emerald-100"
                            : due
                              ? "text-amber-700"
                              : "text-slate-400"
                        }`}
                      >
                        {due ? (
                          <>
                            <AlertCircle className="h-3 w-3" />
                            Follow-up due
                          </>
                        ) : (
                          <>
                            Last meeting:{" "}
                            {lastMeeting
                              ? formatShortDate(
                                  lastMeeting.scheduledStart ||
                                    lastMeeting.punchOutAt ||
                                    lastMeeting.updatedAt,
                                )
                              : "—"}
                          </>
                        )}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
