export default function DashboardCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-md border border-slate-200 bg-white p-1 ${className}`}>
      {title && <h2 className="text-[11px] font-medium leading-tight text-slate-900">{title}</h2>}
      {children}
    </section>
  );
}
