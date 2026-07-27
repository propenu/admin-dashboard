import { ticketSurface } from "./ticketUi";

export default function DashboardCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`${ticketSurface} p-4 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h2 className="text-[13px] font-bold leading-tight text-slate-950">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
