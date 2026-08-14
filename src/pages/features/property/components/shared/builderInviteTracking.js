/** Builder attach / invite email status for project list cards */

const FAIL_STATUSES = ["failed", "bounced", "expired", "revoked", "rejected"];

export const getBuilderPersonName = (project) => {
  const created = project?.createdBy;
  if (created && typeof created === "object") {
    return (
      created.fullName ||
      created.name ||
      created.companyName ||
      ""
    );
  }
  const snap = project?.builderOnboarding?.builderSnapshot;
  return snap?.contactName || snap?.companyName || project?.builderName || "";
};

export const hasBuilderAttached = (project) => {
  const created = project?.createdBy;
  if (!created) return false;
  if (typeof created === "object") {
    return Boolean(created._id || created.id || created.fullName || created.name);
  }
  return Boolean(String(created).trim());
};

/**
 * @returns {{
 *   kind: 'none' | 'attached' | 'invite',
 *   mode: string,
 *   uiStatus: string,
 *   email: string,
 *   builderName: string,
 *   headline: string,
 *   subline: string,
 *   badgeLabel: string,
 *   badgeClass: string,
 *   animate: boolean,
 *   sentAt: any,
 *   openedAt: any,
 *   clickedAt: any,
 * }}
 */
export const getBuilderInviteTracking = (project) => {
  const onboarding = project?.builderOnboarding || {};
  const mode = String(onboarding.mode || "").toLowerCase();
  const uiStatus = String(
    onboarding.emailUiStatus || onboarding.assignStatus || onboarding.emailStatus || "",
  ).toLowerCase();
  const email =
    onboarding.inviteEmail ||
    onboarding.builderSnapshot?.email ||
    "";
  const builderName = getBuilderPersonName(project);
  const attached = hasBuilderAttached(project);
  const isInviteFlow =
    mode === "invite_link" ||
    Boolean(onboarding.inviteId) ||
    Boolean(onboarding.inviteEmail);

  const sentAt = onboarding.lastEmailAt || null;
  const openedAt = onboarding.openedAt || null;
  const clickedAt = onboarding.clickedAt || null;

  // Completed / verified invite counts as attached
  if (
    attached ||
    ["onboarded", "verified"].includes(uiStatus) ||
    mode === "existing_builder" ||
    mode === "staff_direct"
  ) {
    const viaInvite = isInviteFlow || ["onboarded", "verified"].includes(uiStatus);
    return {
      kind: "attached",
      mode,
      uiStatus: uiStatus || "attached",
      email,
      builderName,
      headline: builderName ? `Builder: ${builderName}` : "Builder attached",
      subline: viaInvite
        ? email
          ? `Onboarded via invite · ${email}`
          : "Onboarded via invite"
        : mode === "staff_direct"
          ? "Assigned by staff"
          : "Existing builder linked",
      badgeLabel: viaInvite ? "Onboarded" : "Attached",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      animate: false,
      sentAt,
      openedAt,
      clickedAt,
    };
  }

  if (isInviteFlow || ["invited", "sent", "delivered", "not_opened", "opened", "clicked", "interested", "otp_pending", "queued"].includes(uiStatus)) {
    const map = {
      queued: { label: "Queued", cls: "bg-slate-50 text-slate-700 border-slate-200", animate: true },
      sent: { label: "Sent", cls: "bg-blue-50 text-blue-800 border-blue-200", animate: true },
      delivered: { label: "Delivered", cls: "bg-blue-50 text-blue-800 border-blue-200", animate: true },
      invited: { label: "Invite sent", cls: "bg-blue-50 text-blue-800 border-blue-200", animate: true },
      not_opened: {
        label: "Not opened",
        cls: "bg-amber-50 text-amber-800 border-amber-200",
        animate: true,
      },
      opened: {
        label: "Opened",
        cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
        animate: true,
      },
      clicked: {
        label: "Clicked",
        cls: "bg-blue-50 text-blue-800 border-blue-200",
        animate: true,
      },
      interested: {
        label: "Interested",
        cls: "bg-blue-50 text-blue-800 border-blue-200",
        animate: true,
      },
      otp_pending: {
        label: "OTP pending",
        cls: "bg-violet-50 text-violet-800 border-violet-200",
        animate: true,
      },
    };

    if (FAIL_STATUSES.includes(uiStatus)) {
      return {
        kind: "invite",
        mode,
        uiStatus,
        email,
        builderName,
        headline: email ? `Invite · ${email}` : "Builder invite",
        subline: "Invite failed or expired — resend from details",
        badgeLabel: uiStatus.replace(/_/g, " "),
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        animate: true,
        sentAt,
        openedAt,
        clickedAt,
      };
    }

    const meta = map[uiStatus] || {
      label: uiStatus ? uiStatus.replace(/_/g, " ") : "Invite sent",
      cls: "bg-blue-50 text-blue-800 border-blue-200",
      animate: true,
    };

    const subByStatus = {
      not_opened: "Delivered — waiting for open",
      opened: "Email opened — waiting for click",
      clicked: "Link clicked — waiting for onboard",
      otp_pending: "OTP sent — waiting for verify",
      interested: "Builder started signup",
      sent: "Invite email sent",
      delivered: "Reached inbox",
      invited: "Invite email sent",
      queued: "Sending invite…",
    };

    return {
      kind: "invite",
      mode,
      uiStatus,
      email,
      builderName,
      headline: email ? `Invite · ${email}` : "Builder invite sent",
      subline: subByStatus[uiStatus] || "Tracking invite email",
      badgeLabel: meta.label,
      badgeClass: meta.cls,
      animate: meta.animate,
      sentAt,
      openedAt,
      clickedAt,
    };
  }

  return {
    kind: "none",
    mode,
    uiStatus: "",
    email: "",
    builderName: "",
    headline: "No builder yet",
    subline: "Attach existing builder or send invite",
    badgeLabel: "Missing",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    animate: true,
    sentAt: null,
    openedAt: null,
    clickedAt: null,
  };
};

export const formatInviteShortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};
