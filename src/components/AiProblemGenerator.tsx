import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateProblem } from "@/lib/ai-problems.functions";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const LEVELS = [null, "Easy", "Medium", "Hard"] as const;
const IDEAS = [
  "A sliding window problem about stock prices",
  "Graph problem: shortest path between cities",
  "String puzzle involving anagrams",
];

export function AiProblemGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const generate = useServerFn(generateProblem);
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof LEVELS)[number]>(null);
  const [busy, setBusy] = useState(false);

  async function onGenerate() {
    if (prompt.trim().length < 5) {
      toast.error("Describe the problem you want in a few words.");
      return;
    }
    setBusy(true);
    try {
      const res = await generate({ data: { prompt, difficulty } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Created “${res.title}”`);
      await queryClient.invalidateQueries({ queryKey: ["problems"] });
      navigate({ to: "/problems/$slug", params: { slug: res.slug } });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel glow-surface rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Generate a problem with AI</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Describe what you want to practice and we'll create a fresh problem with examples and starter code.
      </p>

      {user ? (
        <>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A medium array problem about finding pairs that sum to a target"
            className="mt-4 min-h-24"
            maxLength={600}
            disabled={busy}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setPrompt(idea)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {idea}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-lg border border-border p-1">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl ?? "any"}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs",
                    difficulty === lvl ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  {lvl ?? "Any"}
                </button>
              ))}
            </div>
            <Button onClick={onGenerate} disabled={busy}>
              {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Sparkles className="mr-1.5 size-4" />}
              {busy ? "Generating…" : "Generate problem"}
            </Button>
          </div>
        </>
      ) : (
        <Button asChild className="mt-4">
          <Link to="/login">Log in to generate problems</Link>
        </Button>
      )}
    </div>
  );
}
