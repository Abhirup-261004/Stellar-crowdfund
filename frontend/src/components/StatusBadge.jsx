const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Successful: "bg-sky-50 text-sky-700 border-sky-200",
  Failed: "bg-rose-50 text-rose-700 border-rose-200",
  Withdrawn: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.Active
      }`}
    >
      {status}
    </span>
  );
}
