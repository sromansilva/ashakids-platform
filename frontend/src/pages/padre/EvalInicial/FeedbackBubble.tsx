
export function FeedbackBubble({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl mb-4 animate-[fadeIn_0.3s_ease]" style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC" }}>
      <span className="text-2xl">✨</span>
      <p className="text-sm font-bold text-green-700">{message}</p>
    </div>
  );
}
