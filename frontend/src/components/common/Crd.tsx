
export function Crd({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div onClick={onClick} style={style} className={`bg-white rounded-3xl border border-[#E8E5F4] shadow-sm shadow-violet-50 transition-shadow duration-200 ${onClick ? "cursor-pointer hover:shadow-md hover:shadow-violet-100" : ""} ${className}`}>
      {children}
    </div>
  );
}
