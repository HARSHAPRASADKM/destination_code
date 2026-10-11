import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const authedLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/problems", label: "Problems" },
  { to: "/profile", label: "Profile" },
] as const;

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo to={user ? "/dashboard" : "/"} />

        <nav className="hidden items-center gap-1 md:flex">
          {user
            ? authedLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                >
                  {link.label}
                </Link>
              ))
            : (
                <Link
                  to="/problems"
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Problems
                </Link>
              )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
              <LogOut className="mr-1.5 size-3.5" /> Logout
            </Button>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Start Coding</Link>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {(user ? authedLinks : ([{ to: "/problems", label: "Problems" }] as const)).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" className="mt-2" onClick={handleSignOut}>
                <LogOut className="mr-1.5 size-3.5" /> Logout
              </Button>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" onClick={() => setOpen(false)}>
                  <Link to="/signup">Start Coding</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
