import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { AiProblemGenerator } from "@/components/AiProblemGenerator";
import { Input } from "@/components/ui/input";
import { DIFFICULTIES, TOPICS, fetchProblems } from "@/lib/problems";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "Problems — Destination Code" },
      { name: "description", content: "Browse coding problems or generate new ones with AI." },
      { property: "og:title", content: "Problems — Destination Code" },
      { property: "og:description", content: "Browse coding problems or generate new ones with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["problems"], queryFn: fetchProblems });
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);

  const list = useMemo(
    () =>
      (data ?? []).filter(
        (p) =>
          (!diff || p.difficulty === diff) &&
          (!topic || p.topic === topic) &&
          p.title.toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q, diff, topic],
  );

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs transition-colors",
      active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Problems</h1>
        <p className="mt-1 text-muted-foreground">Pick a challenge — or ask AI to create one for you.</p>

        <div className="mt-6">
          <AiProblemGenerator />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className={chip(!diff)} onClick={() => setDiff(null)}>All levels</button>
            {DIFFICULTIES.map((d) => (
              <button key={d} className={chip(diff === d)} onClick={() => setDiff(d)}>{d}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className={chip(!topic)} onClick={() => setTopic(null)}>All topics</button>
            {TOPICS.map((t) => (
              <button key={t} className={chip(topic === t)} onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading problems…</p>
          ) : list.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No problems match your filters.</p>
          ) : (
            list.map((p, i) => (
              <Link
                key={p.id}
                to="/problems/$slug"
                params={{ slug: p.slug }}
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.topic}</p>
                  </div>
                </div>
                <DifficultyBadge difficulty={p.difficulty} />
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
