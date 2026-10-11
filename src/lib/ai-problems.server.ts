import { DIFFICULTIES, TOPICS } from "@/lib/problems";

const LANGS = ["python", "javascript", "typescript", "java", "cpp", "go"] as const;

export type GeneratedProblem = {
  title: string;
  description: string;
  difficulty: (typeof DIFFICULTIES)[number];
  topic: (typeof TOPICS)[number];
  input_format: string;
  output_format: string;
  constraints: string;
  examples: { input: string; output: string; explanation: string }[];
  starter_code: Record<(typeof LANGS)[number], string>;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "description",
    "difficulty",
    "topic",
    "input_format",
    "output_format",
    "constraints",
    "examples",
    "starter_code",
  ],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    difficulty: { type: "string", enum: [...DIFFICULTIES] },
    topic: { type: "string", enum: [...TOPICS] },
    input_format: { type: "string" },
    output_format: { type: "string" },
    constraints: { type: "string" },
    examples: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["input", "output", "explanation"],
        properties: {
          input: { type: "string" },
          output: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    starter_code: {
      type: "object",
      additionalProperties: false,
      required: [...LANGS],
      properties: Object.fromEntries(LANGS.map((l) => [l, { type: "string" }])),
    },
  },
};

const SYSTEM = `You are an expert competitive-programming problem setter.
Create ONE original, well-specified coding problem matching the user's request.
- Description: clear statement in plain prose (no markdown headings).
- Provide 2-3 examples with exact input/output strings and a short explanation.
- Constraints: newline-separated bullet-free lines.
- starter_code: a function signature stub for each language with a comment "// Write your solution here" (use "#" in Python). No solution code.`;

export class AiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function generateProblemWithAi(
  prompt: string,
  difficulty: string | null,
  apiKey: string,
): Promise<GeneratedProblem> {
  const userText = `Request: ${prompt}${difficulty ? `\nDifficulty: ${difficulty}` : ""}`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions: SYSTEM,
      input: [{ role: "user", content: userText }],
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: "problem", strict: true, schema } },
    }),
  });

  if (!res.ok || !res.body) {
    let msg = "AI generation failed.";
    try {
      const j = (await res.json()) as { error?: { message?: string }; message?: string };
      msg = j.error?.message ?? j.message ?? msg;
    } catch {
      /* ignore */
    }
    if (res.status === 429) msg = "Too many requests — please wait a moment and try again.";
    if (res.status === 402) msg = msg || "AI credits are used up for this workspace.";
    throw new AiError(msg, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let refusal = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const evt = JSON.parse(data) as { type: string; delta?: string; response?: { error?: { message?: string } }; message?: string };
          if (evt.type === "response.output_text.delta") text += evt.delta ?? "";
          else if (evt.type === "response.refusal.delta") refusal += evt.delta ?? "";
          else if (evt.type === "response.failed" || evt.type === "error")
            throw new AiError(evt.response?.error?.message ?? evt.message ?? "AI generation failed.", 500);
        } catch (e) {
          if (e instanceof AiError) throw e;
        }
      }
    }
  }

  if (refusal) throw new AiError("The AI declined this request. Try describing a different problem.", 400);
  try {
    return JSON.parse(text) as GeneratedProblem;
  } catch {
    throw new AiError("The AI returned an incomplete problem. Please try again.", 500);
  }
}
