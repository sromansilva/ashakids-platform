
export function Bdg({ children, color = "violet" }: {
  children: React.ReactNode;
  color?: "violet" | "teal" | "orange" | "pink" | "red" | "gray" | "green";
}) {
  const c = {
    violet: "bg-violet-100 text-violet-700",
    teal:   "bg-teal-50 text-teal-700",
    orange: "bg-orange-50 text-orange-700",
    pink:   "bg-pink-50 text-pink-700",
    red:    "bg-red-50 text-red-600",
    gray:   "bg-slate-100 text-slate-600",
    green:  "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${c[color]}`}>
      {children}
    </span>
  );
}
