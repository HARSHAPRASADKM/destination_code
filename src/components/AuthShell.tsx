import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col px-5 py-8 sm:px-10 lg:w-1/2">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="hidden p-4 lg:block lg:w-1/2">
        <div className="glow-surface relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-panel">
          <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />
          <span className="font-display text-sm font-medium text-muted-foreground">
            Destination Code
          </span>

          <div className="relative">
            <h2 className="text-3xl font-semibold leading-tight">
              Your journey to better coding starts here
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Curated problems, a clean editor, and a simple way to keep your practice organized.
            </p>

            <div className="mt-10 rounded-2xl border border-border bg-secondary/50 p-6">
              <p className="font-mono text-xs text-primary">2 / 2 examples passed</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Run your solution against the public examples and iterate until it clicks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
