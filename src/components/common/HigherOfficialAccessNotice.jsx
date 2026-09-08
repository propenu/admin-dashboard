/** Shared blocked-state for Accounts / Subscriptions permission pages. */
export default function HigherOfficialAccessNotice({
  title = "Access disabled",
  permissionLabel,
  extra,
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center bg-[#f6f8f7] px-4 py-10">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          You don’t have access to this section yet. Please ask your higher official
          to enable{" "}
          <span className="font-semibold text-slate-700">{permissionLabel}</span> on
          your role.
          {extra ? <> {extra}</> : null}
        </p>
      </div>
    </div>
  );
}
