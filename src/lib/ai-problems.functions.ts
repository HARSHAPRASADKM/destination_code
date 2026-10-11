import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  prompt: z.string().trim().min(5, "Describe the problem in a few words").max(600),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).nullable(),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const generateProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI is not configured." };

    const { generateProblemWithAi, AiError } = await import("./ai-problems.server");
    try {
      const p = await generateProblemWithAi(data.prompt, data.difficulty, apiKey);
      const slug = `${slugify(p.title) || "problem"}-${Math.random().toString(36).slice(2, 7)}`;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("problems").insert({
        title: p.title,
        slug,
        description: p.description,
        difficulty: p.difficulty,
        topic: p.topic,
        input_format: p.input_format,
        output_format: p.output_format,
        constraints: p.constraints,
        examples: p.examples,
        starter_code: p.starter_code,
      });
      if (error) return { ok: false as const, error: "Could not save the generated problem." };
      return { ok: true as const, slug, title: p.title };
    } catch (e) {
      if (e instanceof AiError) return { ok: false as const, error: e.message };
      console.error(e);
      return { ok: false as const, error: "AI generation failed. Please try again." };
    }
  });
