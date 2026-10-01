import { useEffect, useState } from "react";
import { CalendarDays, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  getSearchResultEmailSchedule,
  saveSearchResultEmailSchedule,
  sendSearchResultEmailsNow,
} from "../../../features/user/userService";

const REPEATS = [
  { id: "minute", label: "Every minute" },
  { id: "daily", label: "Every day" },
  { id: "weekly", label: "Every week" },
  { id: "monthly", label: "Every month" },
  { id: "once", label: "One time" },
];

const WEEKDAYS = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 0, label: "Sunday" },
];

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const MONTH_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

function pad(value) {
  return String(value).padStart(2, "0");
}

function ordinal(day) {
  const teen = day % 100;
  if (teen >= 11 && teen <= 13) return `${day}th`;
  if (day % 10 === 1) return `${day}st`;
  if (day % 10 === 2) return `${day}nd`;
  if (day % 10 === 3) return `${day}rd`;
  return `${day}th`;
}

function from24(hour) {
  return { hour12: hour % 12 || 12, period: hour >= 12 ? "PM" : "AM" };
}

function to24(hour12, period) {
  const base = Number(hour12) % 12;
  return period === "PM" ? base + 12 : base;
}

function todayDateValue() {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function clockText(hour12, minute, period) {
  return `${hour12}:${pad(minute)} ${period}`;
}

const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-emerald-100 bg-white px-3 text-sm font-semibold text-[#0f3d2e] outline-none focus:border-emerald-400";

function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default function SearchResultEmailCard({ onSent }) {
  const [sendMode, setSendMode] = useState("now");
  const [repeat, setRepeat] = useState("daily");
  const [dateValue, setDateValue] = useState(todayDateValue);
  const [hour12, setHour12] = useState(5);
  const [minute, setMinute] = useState(20);
  const [period, setPeriod] = useState("PM");
  const [weekday, setWeekday] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [savedLabel, setSavedLabel] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSearchResultEmailSchedule()
      .then((res) => {
        const data = res?.data?.data;
        if (cancelled || !data || data.status !== "scheduled") return;
        setSendMode("schedule");
        if (REPEATS.some((item) => item.id === data.repeat)) setRepeat(data.repeat);
        else if (data.repeat === "hourly") setRepeat("daily");
        if (data.hour != null) {
          const clock = from24(Number(data.hour));
          setHour12(clock.hour12);
          setPeriod(clock.period);
        }
        if (data.minute != null) setMinute(Number(data.minute));
        if (data.weekday != null) setWeekday(Number(data.weekday));
        if (data.dayOfMonth != null) setDayOfMonth(Number(data.dayOfMonth));
        if (data.runAt) {
          const when = new Date(data.runAt);
          if (!Number.isNaN(when.getTime())) {
            setDateValue(`${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`);
            const clock = from24(when.getHours());
            setHour12(clock.hour12);
            setMinute(when.getMinutes());
            setPeriod(clock.period);
          }
        }
        setSavedLabel(data.label || "");
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load the scheduled send");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const weekdayName = WEEKDAYS.find((day) => day.id === Number(weekday))?.label || "Monday";
  const timeText = clockText(hour12, minute, period);
  const whenLabel =
    repeat === "minute"
      ? "Every minute"
      : repeat === "weekly"
        ? `Every ${weekdayName} at ${timeText}`
        : repeat === "monthly"
          ? `Every month on the ${ordinal(Number(dayOfMonth))} at ${timeText}`
          : repeat === "once"
            ? `One time on ${dateValue.split("-").reverse().join("-")} at ${timeText}`
            : `Every day at ${timeText}`;

  const confirm = async () => {
    if (sendMode !== "schedule") {
      setBusy(true);
      try {
        const res = await sendSearchResultEmailsNow();
        const message = res?.data?.message || "Search emails and WhatsApp finished.";
        if (res?.data?.data?.sent > 0) toast.success(message);
        else toast(message);
        onSent?.();
      } catch (error) {
        toast.error(error?.response?.data?.message || "The search emails and WhatsApp could not be sent");
      } finally {
        setBusy(false);
      }
      return;
    }

    const body = { repeat };
    if (repeat !== "minute") {
      body.hour = to24(hour12, period);
      body.minute = Number(minute);
    }
    if (repeat === "weekly") body.weekday = Number(weekday);
    if (repeat === "monthly") body.dayOfMonth = Number(dayOfMonth);
    if (repeat === "once") {
      const when = new Date(`${dateValue}T${pad(to24(hour12, period))}:${pad(minute)}:00`);
      if (!dateValue || Number.isNaN(when.getTime())) {
        toast.error("Choose a date and time");
        return;
      }
      if (when.getTime() <= Date.now()) {
        toast.error("Choose a time in the future");
        return;
      }
      body.scheduleAt = when.toISOString();
    }

    setBusy(true);
    try {
      const res = await saveSearchResultEmailSchedule(body);
      setSavedLabel(res?.data?.data?.label || whenLabel);
      toast.success(res?.data?.message || `${whenLabel} IST.`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not schedule the emails and WhatsApp");
    } finally {
      setBusy(false);
    }
  };

  const showTime = repeat !== "minute";

  return (
    <section className="max-w-2xl rounded-2xl border border-emerald-100 bg-white p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
      <div>
        <h2 className="text-sm font-extrabold text-[#0f3d2e]">Send Time</h2>
        <p className="mt-0.5 text-xs text-[#5c7d6d]">
          Send now, or choose how often the email and WhatsApp go to every matching end user.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSendMode("now")}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${
            sendMode === "now"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-emerald-100 bg-white text-slate-600"
          }`}
        >
          <Send size={14} /> Send now
        </button>
        <button
          type="button"
          onClick={() => setSendMode("schedule")}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${
            sendMode === "schedule"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-emerald-100 bg-white text-slate-600"
          }`}
        >
          <CalendarDays size={14} /> Schedule
        </button>
      </div>

      {sendMode === "schedule" ? (
        <div className="mt-3 space-y-3">
          <Field label="Repeat">
            <select value={repeat} onChange={(event) => setRepeat(event.target.value)} className={selectClass}>
              {REPEATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          {repeat === "weekly" ? (
            <Field label="Day of the week">
              <select value={weekday} onChange={(event) => setWeekday(Number(event.target.value))} className={selectClass}>
                {WEEKDAYS.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          {repeat === "monthly" ? (
            <Field label="Day of the month">
              <select
                value={dayOfMonth}
                onChange={(event) => setDayOfMonth(Number(event.target.value))}
                className={selectClass}
              >
                {MONTH_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {ordinal(day)}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          {repeat === "once" ? (
            <Field label="Date">
              <input
                type="date"
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
                className={selectClass}
              />
            </Field>
          ) : null}

          {showTime ? (
            <div className="grid grid-cols-3 gap-2">
              <Field label="Hour">
                <select value={hour12} onChange={(event) => setHour12(Number(event.target.value))} className={selectClass}>
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Minutes">
                <select value={minute} onChange={(event) => setMinute(Number(event.target.value))} className={selectClass}>
                  {MINUTES.map((value) => (
                    <option key={value} value={value}>
                      {pad(value)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="AM / PM">
                <select value={period} onChange={(event) => setPeriod(event.target.value)} className={selectClass}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </Field>
            </div>
          ) : null}

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
              This email and WhatsApp go to all matching end users
            </p>
            <p className="mt-1 text-sm font-bold text-[#0f3d2e]">{whenLabel} IST</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#3f6b56]">
              End users, agents, builders, and builder staff who searched or opened a listing.
              Each person gets one email a day, with up to 4 cards on propenu.com, and the same listings on WhatsApp.
            </p>
            {savedLabel ? (
              <p className="mt-1.5 text-[11px] font-semibold text-emerald-800">Saved: {savedLabel} IST</p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-slate-400">
          Sends the email and WhatsApp now to every matching end user. People already emailed today are skipped.
        </p>
      )}

      <button
        type="button"
        onClick={confirm}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#27AE60] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,161,80,0.24)] hover:bg-[#1e8f4d] disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {busy
          ? sendMode === "schedule"
            ? "Scheduling..."
            : "Sending..."
          : sendMode === "schedule"
            ? "Schedule email and WhatsApp"
            : "Send email and WhatsApp now"}
      </button>
    </section>
  );
}
