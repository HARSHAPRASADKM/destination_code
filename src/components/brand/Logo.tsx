import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:-translate-y-0.5">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 3 20h18L12 3Z" />
          <circle cx="12" cy="14.5" r="1.8" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="font-display text-base font-semibold tracking-tight">
        Destination<span className="text-primary"> Code</span>
      </span>
    </Link>
  );
}
