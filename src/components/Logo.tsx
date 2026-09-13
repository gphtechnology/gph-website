export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-xl font-extrabold tracking-tight ${className}`}
    >
      <span className="text-blue">G</span>
      <span className="text-ink">PH</span>
    </span>
  );
}
