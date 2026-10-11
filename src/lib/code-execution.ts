/**
 * CodeExecutionService
 *
 * Phase 1: a mock runner. It validates that the editor contains real work and
 * simulates results against the problem's public examples. Swap the internals
 * of `run()` for a real sandboxed execution API later — the interface and the
 * `ExecutionResult` shape are what the UI depends on.
 */

export type ExampleCase = {
  input: string;
  output: string;
  explanation?: string;
};

export type CaseResult = {
  name: string;
  input: string;
  expected: string;
  passed: boolean;
};

export type ExecutionResult = {
  status: "passed" | "failed" | "empty";
  cases: CaseResult[];
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  message?: string;
};

export type RunInput = {
  code: string;
  language: string;
  starterCode: string;
  examples: ExampleCase[];
};

function hasMeaningfulEdits(code: string, starterCode: string) {
  const strip = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("//") && !line.startsWith("#"))
      .join("\n");

  const written = strip(code);
  if (written.length === 0) return false;
  return written !== strip(starterCode);
}

export const CodeExecutionService = {
  async run({ code, starterCode, examples }: RunInput): Promise<ExecutionResult> {
    // Simulated latency so loading states are exercised.
    await new Promise((resolve) => setTimeout(resolve, 650));

    const cases = examples.length
      ? examples
      : [{ input: "sample input", output: "sample output" } satisfies ExampleCase];

    const edited = hasMeaningfulEdits(code, starterCode);

    if (!edited) {
      return {
        status: "empty",
        cases: cases.map((example, index) => ({
          name: `Example ${index + 1}`,
          input: example.input,
          expected: example.output,
          passed: false,
        })),
        passedCount: 0,
        totalCount: cases.length,
        runtimeMs: 0,
        message: "Write your solution before running. Starter code alone won't pass the examples.",
      };
    }

    const results: CaseResult[] = cases.map((example, index) => ({
      name: `Example ${index + 1}`,
      input: example.input,
      expected: example.output,
      passed: true,
    }));

    return {
      status: "passed",
      cases: results,
      passedCount: results.length,
      totalCount: results.length,
      runtimeMs: 90 + Math.floor(code.length % 80),
      message: "Demo run — results are simulated against the public examples.",
    };
  },
};

export const LANGUAGES = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "go", label: "Go", monaco: "go" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];
