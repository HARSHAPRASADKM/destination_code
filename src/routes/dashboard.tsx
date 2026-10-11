import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { AiProblemGenerator } from "@/components/AiProblemGenerator";
import { fetchRecentProgress } from "@/lib/problems";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Destination Code" },
      { name: "description", content: "Your recent problems and AI problem generator." },
      { property: "og:title", content: "Dashboard — Destination Code" },
      { property: "og:description", content: "Pick up where you left off." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    </div>
  ),
});

function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["progress", user!.id],
    queryFn: () => fetchRecentProgress(user!.id),
  });
  const name = (user?.user_metadata?.["display_name"] as string | undefined) ?? user?.email?.split("@")[0];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Welcome back, {name}</h1>
      <p className="mt-1 text-muted-foreground">Keep the streak going.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AiProblemGenerator />
        <div className="rounded-2xl border border-border p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Recently opened</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : !data?.length ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing yet. <Link to="/problems" className="text-primary">Browse problems</Link>
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {data.map((row) =>
                row.problems ? (
                  <li key={row.id}>
                    <Link
                      to="/problems/$slug"
                      params={{ slug: row.problems.slug }}
                      className="flex items-center justify-between py-3 hover:text-primary"
                    >
                      <span className="text-sm">{row.problems.title}</span>
                      <DifficultyBadge difficulty={row.problems.difficulty} />
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
