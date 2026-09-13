export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-2xl font-extrabold tracking-tight sm:text-3xl ${className}`}
    >
      <span className="text-blue">G</span>
      <span className="text-ink">PH</span>
    </span>
  );
}
