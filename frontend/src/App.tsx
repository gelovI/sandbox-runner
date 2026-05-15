import { useEffect, useState } from "react";
import { Play, Activity } from "lucide-react";
import "./index.css";
import Editor from "@monaco-editor/react";

type RunStatus = "SUCCESS" | "FAILED" | "TIMEOUT";

type RunSummary = {
  id: string;
  language: string;
  status: RunStatus;
  exitCode: number | null;
  durationMs: number;
  createdAt: string;
};

type RunDetail = RunSummary & {
  code: string;
  stdout: string;
  stderr: string;
};

type Stats = {
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  timeoutRuns: number;
  successRate: number;
  averageDurationMs: number;
  languageDistribution: Record<string, number>;
};

function statusClass(status: RunStatus) {
  if (status === "SUCCESS") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (status === "TIMEOUT") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-red-500/15 text-red-300 border-red-500/30";
}

function editorLanguage(language: string) {
  if (language === "javascript") return "javascript";
  return "python";
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState('print("Hello from Docker")');
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunDetail | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  async function loadRuns() {
    const response = await fetch("/api/runs?limit=20");
    const data = await response.json();
    setRuns(data);
  }

  async function loadRun(id: string) {
    const response = await fetch(`/api/runs/${id}`);
    const data = await response.json();
    setSelectedRun(data);
  }

  async function loadStats() {
    const response = await fetch("/api/stats");
    const data = await response.json();
    setStats(data);
  }

  async function runCode() {
    setIsRunning(true);

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language, code })
      });

      const data = await response.json();
      setSelectedRun(data);
      await loadRuns();
      await loadStats();
    } finally {
      setIsRunning(false);
    }
  }

  useEffect(() => {
    loadRuns();
    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <Activity size={16} />
              Kotlin + Docker Desktop Sandbox Runner
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Run code in isolated Docker containers.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Ktor backend, PostgreSQL persistence, Docker-based execution, resource limits and clean architecture.
            </p>
          </div>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Total Runs" value={stats?.totalRuns ?? 0} />

          <MetricCard
            label="Success Rate"
            value={`${(stats?.successRate ?? 0).toFixed(1)}%`}
          />

          <MetricCard
            label="Avg Runtime"
            value={`${Math.round(stats?.averageDurationMs ?? 0)} ms`}
          />

          <MetricCard
            label="Languages"
            value={Object.keys(stats?.languageDistribution ?? {}).length}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
          <section className="flex h-[620px] flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Code Runner</h2>
              <select
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="kotlin">Kotlin</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
              <Editor
                height="420px"
                language={editorLanguage(language)}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "JetBrains Mono, Consolas, monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  wordWrap: "on"
                }}
              />
            </div>

            <button
              onClick={runCode}
              disabled={isRunning}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play size={18} />
              {isRunning ? "Running..." : "Run in Docker"}
            </button>
          </section>

          <section className="flex h-[620px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-xl font-semibold">Run History</h2>
            <div className="mt-2 flex-1 space-y-3 overflow-y-auto pr-2">
              {runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => loadRun(run.id)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-cyan-400/40"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-slate-400">
                      {run.id.slice(0, 8)}
                    </span>
                    <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(run.status)}`}>
                      {run.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">
                    {run.language} · {run.durationMs} ms · exit {run.exitCode ?? "n/a"}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedRun && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Run Details</h2>
              <span className={`rounded-full border px-3 py-1 text-sm ${statusClass(selectedRun.status)}`}>
                {selectedRun.status}
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-400">Code</h3>
                <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-sm">
                  {selectedRun.code}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-400">Output</h3>
                <pre className="min-h-[120px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-emerald-200">
                  {selectedRun.stdout || "(no stdout)"}
                </pre>

                <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-400">Errors</h3>
                <pre className="min-h-[120px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-red-200">
                  {selectedRun.stderr || "(no stderr)"}
                </pre>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}