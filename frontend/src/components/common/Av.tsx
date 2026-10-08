
export function Av({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const s = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  return (
    <div className={`${s[size]} rounded-full flex items-center justify-center font-extrabold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}
