import { ticketSurface } from "./ticketUi";

export default function DashboardCard({ title, children, className = "" }) {
  return (
    <section className={`${ticketSurface} p-4 ${className}`}>
      {title && (
        <h2 className="mb-3 text-[13px] font-bold leading-tight text-slate-950">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
