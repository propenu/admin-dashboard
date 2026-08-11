import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getUserSearch } from "../../../features/user/userService";
import {
  createFieldMeeting,
  searchFieldMeetingContacts,
} from "../../../features/fieldMeetings/fieldMeetingService";
import { getFeaturedProjectsByType } from "../../../features/property/propertyService";
import { INDIAN_STATES, getCitiesByState } from "../../../utils/countryStateCity";
import {
  defaultMeetingPlace,
  defaultWizardState,
  isRemoteMeeting,
  MEETING_PLACE_OPTIONS,
  MEETING_TYPES,
  meetingPlaceLabel,
  meetingTypeLabel,
  initials,
  PERSON_TITLES,
  toIsoDateInput,
  VISIT_LOGGING_MODES,
} from "../fieldMeetingUtils";

const emptyPersonForm = () => ({
  name: "",
  phone: "",
  email: "",
  company: "",
  title: "Manager",
  roleIntent: "other",
});

const STEPS = [
  { id: 1, key: "who", label: "Who" },
  { id: 2, key: "when", label: "When" },
  { id: 3, key: "where", label: "Where" },
  { id: 4, key: "prep", label: "Prep" },
  { id: 5, key: "confirm", label: "Confirm" },
];

const OBJECTIVE_OPTIONS = [
  { value: "qualification", label: "Qualification" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "service", label: "Service" },
  { value: "negotiation", label: "Negotiation" },
  { value: "follow_up", label: "Follow-up" },
  { value: "closing", label: "Closing" },
];

const pickItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.projects)) return payload.projects;
  return [];
};

export default function ScheduleMeetingModal({
  open,
  onClose,
  onCreated,
  visibilityHint = ["Sales Manager", "RM", "BD Head"],
}) {
  const [form, setForm] = useState(defaultWizardState);
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [platformResults, setPlatformResults] = useState([]);
  const [contactResults, setContactResults] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyPersonForm);
  const [propertyQ, setPropertyQ] = useState("");
  const [propertyResults, setPropertyResults] = useState([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(defaultWizardState());
    setSearchQ("");
    setPlatformResults([]);
    setContactResults([]);
    setShowCreate(false);
    setCreateForm(emptyPersonForm());
    setDirty(false);
    setPropertyQ("");
    setPropertyResults([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") tryClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dirty]);

  useEffect(() => {
    if (!open || form.step !== 1) return;
    const q = searchQ.trim();
    if (q.length < 2) {
      setPlatformResults([]);
      setContactResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const [platformRes, contactRes] = await Promise.all([
          getUserSearch({ role: "user,agent,builder", q }).catch(() => null),
          searchFieldMeetingContacts(q).catch(() => []),
        ]);
        const platformList = pickItems(platformRes?.data ?? platformRes).slice(0, 8);
        const contactList = (Array.isArray(contactRes) ? contactRes : contactRes?.data || []).slice(
          0,
          8,
        );
        setPlatformResults(platformList);
        setContactResults(contactList);
        const none = platformList.length === 0 && contactList.length === 0;
        setShowCreate(none);
        if (none) {
          const looksEmail = q.includes("@");
          const looksPhone = /^\+?\d[\d\s-]{6,}$/.test(q);
          setCreateForm((f) => ({
            ...f,
            email: looksEmail ? q : f.email,
            phone: looksPhone ? q.replace(/\s+/g, "") : f.phone,
          }));
        }
      } catch {
        setPlatformResults([]);
        setContactResults([]);
        setShowCreate(true);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ, open, form.step]);

  useEffect(() => {
    if (!open || form.step !== 3) return;
    const q = propertyQ.trim();
    if (q.length < 2) {
      setPropertyResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setPropertyLoading(true);
      try {
        const res = await getFeaturedProjectsByType("", 1, 10, { search: q });
        const list = pickItems(res?.data ?? res);
        setPropertyResults(list.slice(0, 10));
      } catch {
        setPropertyResults([]);
      } finally {
        setPropertyLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [propertyQ, open, form.step]);

  const cities = useMemo(
    () => getCitiesByState(form.location.state).map((c) => c.name),
    [form.location.state],
  );

  const remote = isRemoteMeeting(form.meetingType);

  const tryClose = () => {
    if (dirty && !window.confirm("Discard unsaved meeting details?")) return;
    onClose?.();
  };

  const patch = (partial) => {
    setDirty(true);
    setForm((f) => ({ ...f, ...partial }));
  };

  const syncPrimaryClient = (people) => {
    const primary = people.find((p) => p.isPrimary) || people[0] || null;
    return primary
      ? {
          id: primary.contactId || primary.userId || null,
          userId: primary.userId || null,
          contactId: primary.contactId || null,
          name: primary.name,
          company: primary.company,
          phone: primary.phone,
          email: primary.email,
          title: primary.title,
          roleName: primary.roleName,
          source: primary.source,
        }
      : null;
  };

  const addPersonToMeeting = (person) => {
    const key =
      person.contactId ||
      person.userId ||
      `${person.name}-${person.phone}-${person.email}-${person.title}`;
    const exists = (form.people || []).some((p) => {
      if (person.contactId && p.contactId === person.contactId) return true;
      if (person.userId && p.userId === person.userId) return true;
      return (
        p.name === person.name &&
        p.phone === person.phone &&
        p.email === person.email &&
        p.title === person.title
      );
    });
    if (exists) {
      toast.message("Person already added to this meeting");
      return;
    }
    const next = [
      ...(form.people || []),
      {
        ...person,
        key,
        isPrimary: (form.people || []).length === 0,
      },
    ];
    patch({
      people: next,
      client: syncPrimaryClient(next),
      createClient: null,
    });
    setShowCreate(false);
    setCreateForm(emptyPersonForm());
    toast.success(`${person.name} added to meeting people`);
  };

  const removePerson = (index) => {
    const next = (form.people || []).filter((_, i) => i !== index);
    if (next.length && !next.some((p) => p.isPrimary)) next[0].isPrimary = true;
    patch({ people: next, client: syncPrimaryClient(next) });
  };

  const selectPlatformUser = (user) => {
    addPersonToMeeting({
      userId: String(user._id || user.id),
      contactId: null,
      name: user.name || "",
      company: user.companyName || "",
      phone: user.phone || "",
      email: user.email || "",
      title: "Owner",
      roleName: user.roleName || "owner",
      source: "platform_user",
      _create: false,
    });
  };

  const selectMeetingContact = (contact) => {
    const id = String(contact.contactId || contact._id || contact.id);
    addPersonToMeeting({
      userId: null,
      contactId: id,
      name: contact.name || "",
      company: contact.company || "",
      phone: contact.phone || "",
      email: contact.email || "",
      title: contact.title || "Manager",
      roleName: contact.clientType || contact.roleName || "owner",
      source: "meeting_contact",
      _create: false,
    });
  };

  const applyCreateClient = () => {
    if (createForm.name.trim().length < 2) {
      return toast.error("Full name is required");
    }
    addPersonToMeeting({
      userId: null,
      contactId: null,
      name: createForm.name.trim(),
      company: createForm.company.trim(),
      phone: createForm.phone.trim(),
      email: createForm.email.trim(),
      title: createForm.title || "Other",
      roleName: createForm.roleIntent || "other",
      roleIntent: createForm.roleIntent || "other",
      source: "meeting_contact",
      _create: true,
    });
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!(form.people || []).length) {
        toast.error("Add at least one person (CEO, manager, head, …)");
        return false;
      }
      if (form.loggingMode === "already_visited" && !form.visitConfirmed) {
        toast.error("Confirm that this visit already took place to continue");
        return false;
      }
    }
    if (step === 2) {
      if (!form.date || !form.startTime || !form.endTime) {
        toast.error("Date and time are required");
        return false;
      }
      if (form.endTime <= form.startTime) {
        toast.error("End time must be after start time");
        return false;
      }
      const placeOpts = MEETING_PLACE_OPTIONS[form.meetingType];
      if (placeOpts?.length && !form.meetingPlace) {
        toast.error("Select meeting place (On site / Off site / Office)");
        return false;
      }
    }
    if (step === 3 && !remote && !form.location.state) {
      toast.error("State is required for in-person meetings");
      return false;
    }
    if (step === 5 && form.loggingMode === "already_visited" && !String(form.outcome || "").trim()) {
      toast.error("Add a short visit outcome before logging");
      return false;
    }
    return true;
  };

  const setLoggingMode = (mode) => {
    const next = {
      loggingMode: mode,
      visitConfirmed: mode === "already_visited" ? form.visitConfirmed : false,
    };
    if (mode === "walk_in" || mode === "already_visited") {
      next.prepChecks = {
        ...form.prepChecks,
        review_client: true,
        review_properties: true,
        confirm_location: true,
      };
    }
    if (mode === "walk_in") {
      next.date = toIsoDateInput();
    }
    patch(next);
  };

  const next = () => {
    if (!validateStep(form.step)) return;
    patch({ step: Math.min(5, form.step + 1) });
  };

  const back = () => patch({ step: Math.max(1, form.step - 1) });

  const buildPayload = (draft = false) => {
    const prepTasks = [
      {
        key: "review_client",
        title: "Review client profile",
        description: "Go through client details and previous interactions.",
        completed: Boolean(form.prepChecks.review_client),
      },
      {
        key: "check_properties",
        title: "Check property matches",
        description: "Shortlist relevant properties as per client needs.",
        completed: Boolean(form.prepChecks.review_properties),
      },
      {
        key: "prepare_plan",
        title: "Prepare meeting plan",
        description: form.customPrepNote || "Define key discussion points and next steps.",
        completed: Boolean(form.prepChecks.confirm_location),
      },
    ];

    const people = (form.people || []).map((p, index) => ({
      name: p.name,
      company: p.company,
      phone: p.phone,
      email: p.email,
      title: p.title,
      roleName: p.roleName,
      roleIntent: p.roleIntent || p.roleName,
      userId: p.userId || undefined,
      contactId: p.contactId || undefined,
      isPrimary: Boolean(p.isPrimary) || index === 0,
      _create: Boolean(p._create) || (!p.userId && !p.contactId),
      create: Boolean(p._create) || (!p.userId && !p.contactId),
    }));

    return {
      draft,
      wizardStep: form.step,
      people,
      meetingType: form.meetingType,
      meetingPlace: form.meetingPlace || defaultMeetingPlace(form.meetingType),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      location: remote ? {} : form.location,
      linkedProperty: form.linkedProperty,
      objective: form.objective,
      notes: form.notes,
      outcome: form.outcome,
      loggingMode: form.loggingMode || "scheduled",
      visitConfirmed: Boolean(form.visitConfirmed),
      prepTasks,
    };
  };

  const save = async (draft = false) => {
    if (!draft && !validateStep(1)) return;
    if (!draft && !validateStep(2)) return;
    if (!draft && !validateStep(3)) return;
    if (!draft && !validateStep(5)) return;
    setSaving(true);
    try {
      await createFieldMeeting(buildPayload(draft));
      toast.success(
        draft
          ? "Draft saved"
          : form.loggingMode === "already_visited"
            ? "Visit logged as completed"
            : form.loggingMode === "walk_in"
              ? "Walk-in visit confirmed"
              : "Meeting scheduled successfully",
      );
      setDirty(false);
      onCreated?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const isAlreadyVisited = form.loggingMode === "already_visited";
  const isWalkIn = form.loggingMode === "walk_in";

  const primaryLabel =
    form.step === 1
      ? "Next: When >"
      : form.step === 2
        ? "Next: Where >"
        : form.step === 3
          ? "Next: Prep >"
          : form.step === 4
            ? "Next: Confirm >"
            : isAlreadyVisited
              ? "Log completed visit"
              : isWalkIn
                ? "Confirm walk-in"
                : "Schedule Meeting";

  const modalTitle = isAlreadyVisited
    ? "Log completed visit"
    : isWalkIn
      ? "Log walk-in visit"
      : "Schedule meeting";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-3 motion-safe:animate-in sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-meeting-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) tryClose();
      }}
    >
      <div
        ref={panelRef}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl motion-safe:transition-transform"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <h2 id="schedule-meeting-title" className="text-base font-black text-slate-950">
              {modalTitle}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {STEPS.map((step, idx) => {
                const done = form.step > step.id;
                const active = form.step === step.id;
                return (
                  <div key={step.id} className="flex items-center gap-1.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-emerald-600 text-white"
                          : active
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : step.id}
                    </div>
                    <span
                      className={`hidden text-xs font-semibold sm:inline ${
                        active ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {idx < STEPS.length - 1 ? (
                      <span className="mx-1 hidden h-px w-6 border-t border-dotted border-slate-300 sm:inline-block" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={tryClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-h-0 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            {form.step === 1 && (
              <section className="space-y-3">
                {/* CRM visit intent — first decision */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Visit logging mode
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Choose how this visit enters the CRM — schedule ahead, walk-in now, or log a
                    visit that already happened.
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {VISIT_LOGGING_MODES.map((mode) => {
                      const active = form.loggingMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setLoggingMode(mode.value)}
                          className={`rounded-xl border px-3 py-2.5 text-left transition ${
                            active
                              ? "border-emerald-500 bg-emerald-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-emerald-200"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            {mode.value === "walk_in" ? (
                              <Zap className={`h-3.5 w-3.5 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                            ) : mode.value === "already_visited" ? (
                              <CheckCircle2
                                className={`h-3.5 w-3.5 ${active ? "text-emerald-600" : "text-slate-400"}`}
                              />
                            ) : (
                              <Calendar
                                className={`h-3.5 w-3.5 ${active ? "text-emerald-600" : "text-slate-400"}`}
                              />
                            )}
                            {mode.label}
                          </span>
                          <span className="mt-1 block text-[10px] leading-snug text-slate-500">
                            {mode.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isAlreadyVisited ? (
                    <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(form.visitConfirmed)}
                        onChange={(e) => patch({ visitConfirmed: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        <span className="block text-xs font-bold text-amber-900">
                          I confirm this visit already took place
                        </span>
                        <span className="mt-0.5 block text-[10px] text-amber-800/80">
                          Required for hierarchy audit. Meeting will be logged as Completed with
                          your confirmation timestamp.
                        </span>
                      </span>
                    </label>
                  ) : null}

                  {isWalkIn ? (
                    <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] font-semibold text-sky-900">
                      Walk-in mode: date defaults to today. Status will be Confirmed (no prep
                      queue).
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Meeting people
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <Users className="h-3.5 w-3.5" />
                    {(form.people || []).length} added
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Add everyone you {isAlreadyVisited ? "met" : "will meet"} — CEO, managers, heads,
                  owners. Stored in the meeting contact book (not login credentials).
                </p>

                {(form.people || []).length > 0 ? (
                  <ul className="space-y-1.5">
                    {(form.people || []).map((person, index) => (
                      <li
                        key={person.key || `${person.name}-${index}`}
                        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[10px] font-black text-emerald-700">
                          {initials(person.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900">
                            {person.name}
                            {person.isPrimary ? (
                              <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                                · Primary
                              </span>
                            ) : null}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {[person.title, person.company, person.phone, person.email]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removePerson(index)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove person"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search people by name, phone, email or company"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                {searching ? (
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                  </p>
                ) : null}
                {contactResults.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Meeting contacts (separate book)
                    </p>
                    {contactResults.map((contact) => {
                      const id = String(contact.contactId || contact._id || contact.id);
                      return (
                        <button
                          key={`c-${id}`}
                          type="button"
                          onClick={() => selectMeetingContact(contact)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 ${
                            form.client?.contactId === id
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200"
                          }`}
                        >
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-xs font-black text-emerald-700">
                            {initials(contact.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-slate-900">
                              {contact.name}
                            </span>
                            <span className="block truncate text-[11px] text-slate-500">
                              {[
                                contact.clientType || "owner",
                                contact.phone,
                                contact.email,
                                contact.meetingCount
                                  ? `${contact.meetingCount} meetings`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {platformResults.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Platform users (existing login)
                    </p>
                    {platformResults.map((user) => {
                      const id = String(user._id || user.id);
                      return (
                        <button
                          key={`u-${id}`}
                          type="button"
                          onClick={() => selectPlatformUser(user)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 ${
                            form.client?.userId === id
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200"
                          }`}
                        >
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                            {initials(user.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-slate-900">
                              {user.name}
                            </span>
                            <span className="block truncate text-[11px] text-slate-500">
                              {[user.roleName || "user", user.phone, user.email]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {showCreate
                      ? "Add another person"
                      : "User not found? Add person to this meeting"}
                  </button>
                  <p className="mb-2 text-[10px] leading-relaxed text-emerald-800/80">
                    Add CEO, managers, heads — as many as you meet. Stored in Field Meetings
                    contact book only (no login / KYC).
                  </p>
                  {showCreate ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs"
                        placeholder="Full name *"
                        value={createForm.name}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                      <select
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs"
                        value={createForm.title}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, title: e.target.value }))
                        }
                      >
                        {PERSON_TITLES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <input
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs"
                        placeholder="Phone (optional)"
                        value={createForm.phone}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, phone: e.target.value }))
                        }
                      />
                      <input
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs"
                        placeholder="Email (optional)"
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                      <input
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs sm:col-span-2"
                        placeholder="Company (optional)"
                        value={createForm.company}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, company: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        onClick={applyCreateClient}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white sm:col-span-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add this person
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {form.step === 2 && (
              <section className="space-y-3">
                {isAlreadyVisited ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
                    Enter when the visit actually happened (past date/time is allowed).
                  </p>
                ) : null}
                <label className="block text-xs font-semibold text-slate-600">
                  Meeting type
                  <select
                    value={form.meetingType}
                    onChange={(e) => {
                      const meetingType = e.target.value;
                      patch({
                        meetingType,
                        meetingPlace: defaultMeetingPlace(meetingType),
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    {MEETING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>

                {MEETING_PLACE_OPTIONS[form.meetingType]?.length ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Meeting place</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {MEETING_PLACE_OPTIONS[form.meetingType].map((place) => {
                        const active = form.meetingPlace === place.value;
                        return (
                          <button
                            key={place.value}
                            type="button"
                            onClick={() => patch({ meetingPlace: place.value })}
                            className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                              active
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                            }`}
                          >
                            {place.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <label className="block text-xs font-semibold text-slate-600">
                  {isAlreadyVisited ? "Visit date" : "Date"}
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => patch({ date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    Start time
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => patch({ startTime: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-600">
                    End time
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => patch({ endTime: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                  </label>
                </div>
              </section>
            )}

            {form.step === 3 && (
              <section className="space-y-3">
                {remote ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Physical location not required for {meetingTypeLabel(form.meetingType)}.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-xs font-semibold text-slate-600">
                      State *
                      <select
                        value={form.location.state}
                        onChange={(e) =>
                          patch({
                            location: { state: e.target.value, city: "", locality: "" },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s.isoCode} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                      City
                      <select
                        value={form.location.city}
                        disabled={!form.location.state}
                        onChange={(e) =>
                          patch({
                            location: {
                              ...form.location,
                              city: e.target.value,
                              locality: "",
                            },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:opacity-50"
                      >
                        <option value="">All / select</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                      Locality
                      <input
                        value={form.location.locality}
                        onChange={(e) =>
                          patch({
                            location: { ...form.location, locality: e.target.value },
                          })
                        }
                        placeholder="Locality"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      />
                    </label>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-600">Linked property (optional)</p>
                  <div className="relative mt-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={propertyQ}
                      onChange={(e) => setPropertyQ(e.target.value)}
                      placeholder="Search by project or property"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Link a property to auto-add meeting context and notes.
                  </p>
                  {propertyLoading ? (
                    <p className="mt-2 text-xs text-slate-500">Searching properties…</p>
                  ) : null}
                  <div className="mt-2 space-y-1">
                    {propertyResults.map((p) => {
                      const id = String(p._id || p.id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            patch({
                              linkedProperty: {
                                id,
                                name: p.title || p.projectName || p.buildingName || "Property",
                                category: "featured",
                                location: [p.locality, p.city, p.state].filter(Boolean).join(", "),
                                priceLabel: p.priceFrom
                                  ? `₹${p.priceFrom}${p.priceTo ? ` – ₹${p.priceTo}` : ""}`
                                  : "",
                              },
                            })
                          }
                          className="flex w-full items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left text-xs hover:border-emerald-300"
                        >
                          <Building2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                          <span>
                            <span className="block font-bold text-slate-800">
                              {p.title || p.projectName || "Property"}
                            </span>
                            <span className="text-slate-500">
                              {[p.locality, p.city].filter(Boolean).join(", ")}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {form.linkedProperty ? (
                    <p className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-800">
                      Linked: {form.linkedProperty.name}
                      <button
                        type="button"
                        className="ml-2 underline"
                        onClick={() => patch({ linkedProperty: null })}
                      >
                        Clear
                      </button>
                    </p>
                  ) : null}
                </div>
              </section>
            )}

            {form.step === 4 && (
              <section className="space-y-3">
                <label className="block text-xs font-semibold text-slate-600">
                  Meeting objective
                  <select
                    value={form.objective}
                    onChange={(e) => patch({ objective: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    {OBJECTIVE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                {isAlreadyVisited || isWalkIn ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                    Prep checklist is skipped for {isAlreadyVisited ? "already-visited" : "walk-in"}{" "}
                    logs — CRM marks prep complete automatically.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Preparation checklist
                    </p>
                    {[
                      ["review_client", "Review client profile"],
                      ["review_properties", "Review shortlisted properties"],
                      ["check_inventory", "Check inventory"],
                      ["check_pricing", "Check pricing"],
                      ["prepare_documents", "Prepare documents"],
                      ["confirm_location", "Confirm location"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(form.prepChecks[key])}
                          onChange={(e) =>
                            patch({
                              prepChecks: {
                                ...form.prepChecks,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {isAlreadyVisited ? (
                  <label className="block text-xs font-semibold text-slate-600">
                    Visit outcome *
                    <textarea
                      value={form.outcome}
                      onChange={(e) => patch({ outcome: e.target.value })}
                      rows={3}
                      placeholder="What happened? Interest level, next step, objections…"
                      className="mt-1 w-full rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2.5 text-sm"
                    />
                  </label>
                ) : null}

                <label className="block text-xs font-semibold text-slate-600">
                  Notes
                  <textarea
                    value={form.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                    rows={3}
                    placeholder="Add meeting notes or discussion points"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
              </section>
            )}

            {form.step === 5 && (
              <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Confirm summary
                </p>
                {[
                  [
                    "Logging",
                    VISIT_LOGGING_MODES.find((m) => m.value === form.loggingMode)?.label ||
                      "Schedule ahead",
                  ],
                  [
                    "People",
                    (form.people || []).length
                      ? (form.people || [])
                          .map((p) => `${p.name}${p.title ? ` (${p.title})` : ""}`)
                          .join(", ")
                      : "—",
                  ],
                  ["Type", meetingTypeLabel(form.meetingType)],
                  ...(form.meetingPlace
                    ? [["Place", meetingPlaceLabel(form.meetingPlace)]]
                    : []),
                  ["Date", form.date],
                  ["Time", `${form.startTime} – ${form.endTime}`],
                  [
                    "Location",
                    remote
                      ? "Remote"
                      : [form.location.locality, form.location.city, form.location.state]
                          .filter(Boolean)
                          .join(", ") || "—",
                  ],
                  ["Property", form.linkedProperty?.name || "Not linked"],
                  ["Objective", form.objective.replace(/_/g, " ")],
                  ...(isAlreadyVisited
                    ? [["Outcome", form.outcome || "—"], ["Confirmed", form.visitConfirmed ? "Yes" : "No"]]
                    : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-slate-200/80 py-1.5">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-right font-semibold capitalize text-slate-900">{v}</span>
                  </div>
                ))}
              </section>
            )}
          </div>

          <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-100 bg-slate-50/60 p-4 lg:block">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Preview
            </p>
            {(form.people || []).length ? (
              <ul className="mt-3 space-y-2">
                {(form.people || []).map((person, index) => (
                  <li key={person.key || index} className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800">
                      {initials(person.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {person.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {[person.title, person.company].filter(Boolean).join(" · ") || "Attendee"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-500">Add people to preview</p>
            )}

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                {meetingTypeLabel(form.meetingType)}
                {form.meetingPlace
                  ? ` · ${meetingPlaceLabel(form.meetingPlace)}`
                  : ""}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                {form.date} · {form.startTime} – {form.endTime}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {remote
                  ? "Remote"
                  : [form.location.locality, form.location.city, form.location.state]
                      .filter(Boolean)
                      .join(", ") || "Location pending"}
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                {form.linkedProperty?.name || "Not linked"}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-[11px] text-emerald-900">
              <p className="flex items-center gap-1.5 font-bold">
                <Eye className="h-3.5 w-3.5" /> Visible to
              </p>
              <p className="mt-1 font-semibold">
                {(visibilityHint || []).join(" → ") || "Manager hierarchy"}
              </p>
              <p className="mt-2 flex items-start gap-1.5 text-emerald-800/80">
                <Shield className="mt-0.5 h-3 w-3 shrink-0" />
                Only users in the above hierarchy will be able to view this meeting and related
                notes.
              </p>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={tryClose}
            className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <div className="flex flex-wrap gap-2">
            {form.step > 1 ? (
              <button
                type="button"
                onClick={back}
                className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={() => save(true)}
              className="min-h-11 rounded-xl border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              Save as draft
            </button>
            {form.step < 5 ? (
              <button
                type="button"
                onClick={next}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {primaryLabel}
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => save(false)}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : isAlreadyVisited
                    ? "Log completed visit"
                    : isWalkIn
                      ? "Confirm walk-in"
                      : "Schedule Meeting"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
