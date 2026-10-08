
export function EmptyState({ icon, title, desc, action, onAction }: {
  icon: string; title: string; desc?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5" style={{ background: "#F5F3FF" }}>{icon}</div>
      <h3 className="font-extrabold text-lg text-[#1C1135] mb-2">{title}</h3>
      {desc && <p className="text-sm text-[#7C6F9A] font-medium max-w-xs leading-relaxed mb-5">{desc}</p>}
      {action && onAction && (
        <button onClick={onAction} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all active:scale-[.97] hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #5B21B6, #4C1D95)" }}>
          {action}
        </button>
      )}
    </div>
  );
}
