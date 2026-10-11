import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, ListChecks, Terminal } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/hero-video.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Destination Code — Your journey to better coding starts here" },
      {
        name: "description",
        content:
          "Practice coding problems, improve your problem-solving skills, and build your confidence one challenge at a time.",
      },
      { property: "og:title", content: "Destination Code" },
      {
        property: "og:description",
        content: "Practice coding problems and build your confidence one challenge at a time.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: ListChecks,
    title: "Practice Problems",
    body: "Solve carefully designed coding challenges.",
  },
  {
    icon: Terminal,
    title: "Developer Workspace",
    body: "Write and test your solutions in a clean coding environment.",
  },
  {
    icon: Code2,
    title: "Track Your Progress",
    body: "Keep your coding journey organized in one place.",
  },
];

const steps = [
  { n: "01", title: "Choose a problem", body: "Filter by difficulty or topic and pick your next challenge." },
  { n: "02", title: "Write your solution", body: "Code in the editor with starter templates in six languages." },
  { n: "03", title: "Practice and improve", body: "Run the examples, reset, and refine your approach." },
];

const languages = ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go"];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="glow-surface relative overflow-hidden">
          <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-50" />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                Practice platform for developers
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                Your journey to better coding starts here
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Practice coding problems, improve your problem-solving skills, and build your
                confidence one challenge at a time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="shadow-glow">
                  <Link to="/signup">
                    Start Coding <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/problems">Explore Problems</Link>
                </Button>
              </div>
            </div>

            <div className="panel relative overflow-hidden shadow-panel">
              <video
                src={heroVideo.url}
                className="aspect-[4/3] w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="panel p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="panel p-6">
                <span className="font-mono text-sm text-primary">{step.n}</span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
          <div className="panel flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Supported languages</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick the language you're most comfortable with.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <span
                  key={language}
                  className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 font-mono text-xs text-muted-foreground"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          Destination Code — your journey to better coding starts here.
        </div>
      </footer>
    </div>
  );
}
