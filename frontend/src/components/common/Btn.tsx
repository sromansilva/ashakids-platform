
export function Btn({
  children, variant = "primary", size = "md", onClick, className = "", disabled = false, type = "button", title,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "cta" | "danger";
  size?: "sm" | "md" | "lg";
  title?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-bold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 select-none active:scale-[.97]";
  const sizes = { sm: "text-xs px-3.5 py-1.5", md: "text-sm px-5 py-2.5", lg: "text-base px-7 py-3.5" };
  const variantStyles: Record<string, string> = {
    primary:   "bg-violet-700 text-white hover:bg-violet-800 shadow-sm shadow-violet-200",
    secondary: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    ghost:     "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700",
    outline:   "border border-[#E8E5F4] bg-white text-[#1C1135] hover:bg-[#F5F3FF]",
    cta:       "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200",
    danger:    "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} title={title}
      className={`${base} ${sizes[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </button>
  );
}
