import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, Play, XCircle } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { CodeExecutionService, LANGUAGES, type ExecutionResult } from "@/lib/code-execution";
import { fetchProblemBySlug, recordProblemOpened } from "@/lib/problems";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const Editor = lazy(() => import("@monaco-editor/react"));

export const Route = createFileRoute("/problems/$slug")({
  head: () => ({
    meta: [
      { title: "Solve a problem — Destination Code" },
      { name: "description", content: "Read the problem, write your solution, and run it against examples." },
      { property: "og:title", content: "Solve a problem — Destination Code" },
      { property: "og:description", content: "Write and run your solution in the Destination Code workspace." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProblemPage,
});

function ProblemPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { data: problem, isLoading } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => fetchProblemBySlug(slug),
  });
  const [lang, setLang] = useState<string>("python");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    if (user && problem) recordProblemOpened(user.id, problem.id).catch(() => {});
  }, [user, problem]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <p className="p-10 text-center text-muted-foreground">Loading…</p>
      </div>
    );
  if (!problem)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-10 text-center">
          <p className="text-muted-foreground">Problem not found.</p>
          <Link to="/problems" className="mt-3 inline-block text-primary">Back to problems</Link>
        </div>
      </div>
    );

  const starter = problem.starter_code[lang] ?? "";
  const code = codes[lang] ?? starter;
  const monacoLang = LANGUAGES.find((l) => l.id === lang)?.monaco ?? "plaintext";

  async function run() {
    if (!problem) return;
    setRunning(true);
    setResult(await CodeExecutionService.run({ code, language: lang, starterCode: starter, examples: problem.examples }));
    setRunning(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="grid flex-1 gap-4 p-4 lg:grid-cols-2">
        <section className="overflow-auto rounded-xl border border-border p-5 lg:max-h-[calc(100vh-6rem)]">
          <Link to="/problems" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3" /> All problems
          </Link>
          <h1 className="mt-3 font-display text-2xl font-semibold">{problem.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="text-xs text-muted-foreground">{problem.topic}</span>
          </div>
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed">{problem.description}</p>
          {problem.input_format && <Block title="Input">{problem.input_format}</Block>}
          {problem.output_format && <Block title="Output">{problem.output_format}</Block>}
          {problem.examples.map((ex, i) => (
            <div key={i} className="mt-5 rounded-lg bg-secondary/50 p-4 font-mono text-xs">
              <p className="mb-2 font-sans text-sm font-semibold">Example {i + 1}</p>
              <p><span className="text-muted-foreground">Input:</span> {ex.input}</p>
              <p><span className="text-muted-foreground">Output:</span> {ex.output}</p>
              {ex.explanation && <p className="mt-1 font-sans text-muted-foreground">{ex.explanation}</p>}
            </div>
          ))}
          {problem.constraints && <Block title="Constraints">{problem.constraints}</Block>}
        </section>

        <section className="flex flex-col overflow-hidden rounded-xl border border-border">
          <div className="flex items-center justify-between gap-2 border-b border-border p-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
            <Button size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Play className="mr-1.5 size-4" />}
              Run
            </Button>
          </div>
          <div className="h-[420px] lg:flex-1">
            <ClientOnly fallback={<div className="p-4 text-sm text-muted-foreground">Loading editor…</div>}>
              <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading editor…</div>}>
                <Editor
                  height="100%"
                  language={monacoLang}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  value={code}
                  onChange={(v) => setCodes((c) => ({ ...c, [lang]: v ?? "" }))}
                  options={{ fontSize: 14, minimap: { enabled: false }, fontFamily: "JetBrains Mono" }}
                />
              </Suspense>
            </ClientOnly>
          </div>
          {result && (
            <div className="border-t border-border p-4 text-sm">
              <p className="font-medium">
                {result.passedCount}/{result.totalCount} examples passed
                {result.runtimeMs > 0 && <span className="ml-2 text-xs text-muted-foreground">{result.runtimeMs} ms</span>}
              </p>
              {result.message && <p className="mt-1 text-xs text-muted-foreground">{result.message}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {result.cases.map((c) => (
                  <span key={c.name} className="inline-flex items-center gap-1 text-xs">
                    {c.passed ? <CheckCircle2 className="size-3.5 text-easy" /> : <XCircle className="size-3.5 text-hard" />}
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: string }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
