// src/pages/WhatsAppNotifications/modals/SendWhatsAppModal.jsx
import { useState, useEffect } from "react";
import {
  Send,
  Users,
  Building2,
  MapPin,
  Phone,
  ChevronDown,
  Loader2,
  X,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { State, City } from "country-state-city";
import {
  getUserSearch,
  sentWhatsAppNotification,
  getAllWhatsAppNotifications,
} from "../../../features/user/userService";
import { Modal } from "./Modal";

const IN_STATES = State.getStatesOfCountry("IN");
const getCitiesByState = (code) =>
  code ? City.getCitiesOfState("IN", code) : [];

export const SendWhatsAppModal = ({ template, onClose }) => {
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [locality, setLocality] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingU, setLoadingU] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [sending, setSending] = useState(false);

  const cities = getCitiesByState(stateCode);

  useEffect(() => {
    (async () => {
      try {
        setLoadingU(true);
        const res = await getUserSearch("user");
        setUsers(res?.data?.results || res?.data || []);
        setFetched(true);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoadingU(false);
      }
    })();
  }, []);

  useEffect(() => {
    setCityName("");
  }, [stateCode]);

  const localityOpts = [
    ...new Set(users.map((u) => u.locality).filter(Boolean)),
  ];
  const hasFilters = stateCode || cityName || locality;

  const filteredUsers = users.filter((u) => {
    const mLoc = locality.trim()
      ? (u.locality || "").toLowerCase().includes(locality.toLowerCase())
      : true;
    const sName = stateCode
      ? (
          IN_STATES.find((s) => s.isoCode === stateCode)?.name || ""
        ).toLowerCase()
      : "";
    const mState = stateCode ? (u.state || "").toLowerCase() === sName : true;
    const mCity = cityName
      ? (u.city || "").toLowerCase() === cityName.toLowerCase()
      : true;
    return mLoc && mState && mCity;
  });

  const handleSend = async () => {
    if (!filteredUsers.length) {
      toast.error("No users match the selected filters");
      return;
    }
    try {
      setSending(true);
      await sentWhatsAppNotification({
        templateName: template.name,
        state: stateCode
          ? IN_STATES.find((s) => s.isoCode === stateCode)?.name
          : "",
        city: cityName,
        locality: locality,
      });
      toast.success(
        `WhatsApp campaign sent to ${filteredUsers.length} users! 🚀`,
      );
      onClose();
    } catch (err) {
      toast.error(err?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      title={`Send — ${template.name}`}
      icon={<Send size={16} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {/* Template banner */}
        <div className="flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
              Template
            </p>
            <p className="text-xs font-semibold text-green-900 font-mono truncate">
              {template.name}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              template.status === "APPROVED"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {template.status}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Filter Recipients
            </p>
            {hasFilters && (
              <button
                onClick={() => {
                  setStateCode("");
                  setCityName("");
                  setLocality("");
                }}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X size={11} /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select
                className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] bg-white cursor-pointer pr-7"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              >
                <option value="">All States</option>
                {IN_STATES.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] bg-white cursor-pointer pr-7 disabled:opacity-40"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={!stateCode}
              >
                <option value="">
                  {stateCode ? "All Cities" : "Select state first"}
                </option>
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="relative">
            <Building2
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              list="wa-send-locality"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] placeholder-gray-300 bg-white"
              placeholder="Filter by locality…"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
            <datalist id="wa-send-locality">
              {localityOpts.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Recipient count */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            filteredUsers.length > 0
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {loadingU ? (
            <Loader2 size={16} className="animate-spin text-[#25D366]" />
          ) : (
            <Users
              size={16}
              className={
                filteredUsers.length > 0 ? "text-[#25D366]" : "text-gray-400"
              }
            />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-bold ${
                filteredUsers.length > 0 ? "text-green-800" : "text-gray-500"
              }`}
            >
              {loadingU
                ? "Loading users…"
                : `${filteredUsers.length} recipient${filteredUsers.length !== 1 ? "s" : ""}`}
            </p>
            <p className="text-[10px] text-gray-400">
              {!loadingU &&
                fetched &&
                (hasFilters
                  ? "matching filters"
                  : "all users — add filters to narrow down")}
            </p>
          </div>
        </div>

        {/* User preview list */}
        {!loadingU && filteredUsers.length > 0 && (
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <div className="divide-y divide-gray-100 max-h-44 overflow-y-auto">
              {filteredUsers.slice(0, 20).map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E8F8EF] flex items-center justify-center text-[10px] font-bold text-[#25D366] flex-shrink-0">
                    {(u.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {u.name || "—"}
                    </p>
                    <div className="flex items-center gap-2">
                      {u.phone && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Phone size={8} />
                          {u.phone}
                        </span>
                      )}
                      {u.city && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <MapPin size={8} />
                          {u.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length > 20 && (
                <div className="px-3 py-2 text-center text-[10px] text-gray-400 font-semibold bg-gray-50">
                  +{filteredUsers.length - 20} more users
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || !filteredUsers.length}
          className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-2xl hover:bg-[#1EAF54] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 14px rgba(37,211,102,.3)" }}
        >
          {sending ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send size={14} />
              {filteredUsers.length > 0
                ? `Send to ${filteredUsers.length} Users`
                : "No Users Found"}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
