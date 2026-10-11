import { supabase } from "@/integrations/supabase/client";
import type { ExampleCase } from "@/lib/code-execution";

export type Problem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  topic: string;
  input_format: string;
  output_format: string;
  constraints: string;
  examples: ExampleCase[];
  starter_code: Record<string, string>;
};

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export const TOPICS = [
  "Arrays",
  "Strings",
  "Hash Maps",
  "Sorting",
  "Searching",
  "Stack",
  "Queue",
  "Trees",
  "Graphs",
] as const;

function normalize(row: Record<string, unknown>): Problem {
  return {
    ...(row as unknown as Problem),
    examples: (row['examples'] as ExampleCase[] | null) ?? [],
    starter_code: (row['starter_code'] as Record<string, string> | null) ?? {},
  };
}

export async function fetchProblems(): Promise<Problem[]> {
  const { data, error } = await supabase
    .from("problems")
    .select(
      "id,title,slug,description,difficulty,topic,input_format,output_format,constraints,examples,starter_code",
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchProblemBySlug(slug: string): Promise<Problem | null> {
  const { data, error } = await supabase
    .from("problems")
    .select(
      "id,title,slug,description,difficulty,topic,input_format,output_format,constraints,examples,starter_code",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function recordProblemOpened(userId: string, problemId: string) {
  const { error } = await supabase.from("problem_progress").upsert(
    {
      user_id: userId,
      problem_id: problemId,
      status: "attempted",
      last_opened_at: new Date().toISOString(),
    },
    { onConflict: "user_id,problem_id" },
  );
  if (error) throw error;
}

export type ProgressRow = {
  id: string;
  status: string;
  last_opened_at: string;
  problem_id: string;
  problems: { title: string; slug: string; difficulty: string; topic: string } | null;
};

export async function fetchRecentProgress(userId: string): Promise<ProgressRow[]> {
  const { data, error } = await supabase
    .from("problem_progress")
    .select("id,status,last_opened_at,problem_id,problems(title,slug,difficulty,topic)")
    .eq("user_id", userId)
    .order("last_opened_at", { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data ?? []) as unknown as ProgressRow[];
}
