import { useEffect, useState } from "react";
import { Play, Activity } from "lucide-react";
import "./index.css";
import Editor from "@monaco-editor/react";

type RunStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "TIMEOUT"
  | "DEAD_LETTER"
  | "CANCEL_REQUESTED"
  | "CANCELLED";

type RunSummary = {
  id: string;
  language: string;
  status: RunStatus;
  exitCode: number | null;
  durationMs: number;
  createdAt: string;
  workerId: string | null;
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

type WorkerInfo = {
  id: string;
  activeJob: string | null;
};

type QueueStats = {
  queuedRuns: number;
  deadLetterRuns: number;
  workersOnline: number;
};

function statusClass(status: RunStatus) {
  if (status === "SUCCESS")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  if (status === "RUNNING")
    return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";

  if (status === "QUEUED")
    return "bg-slate-500/15 text-slate-300 border-slate-500/30";

  if (status === "TIMEOUT")
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";

  if (status === "CANCEL_REQUESTED")
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";

  if (status === "CANCELLED")
    return "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";

  if (status === "DEAD_LETTER")
    return "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30";

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);

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

  async function loadWorkers() {
    const response = await fetch("/api/workers");
    const data = await response.json();
    setWorkers(data);
  }

  async function loadQueueStats() {
    const response = await fetch("/api/queue/stats");
    const data = await response.json();
    setQueueStats(data);
  }

  async function runCode() {

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language, code })
      });

      const data = await response.json();

      const queuedRun: RunSummary = {
        id: data.id,
        language,
        status: data.status,
        exitCode: null,
        durationMs: 0,
        createdAt: new Date().toISOString(),
        workerId: null
      };

      setRuns((previous) => [queuedRun, ...previous]);

      setSelectedRun({
        id: data.id,
        language,
        code,
        status: data.status,
        stdout: "",
        stderr: "",
        exitCode: null,
        durationMs: 0,
        createdAt: new Date().toISOString(),
        workerId: null
      });

      const eventSource = new EventSource(`/api/runs/${data.id}/events`);

      eventSource.addEventListener("status", (event) => {
        const eventData = JSON.parse(event.data);

        setSelectedRun((previous) =>
          previous ? { ...previous, status: eventData.status } : previous
        );

        setRuns((previous) =>
          previous.map((run) =>
            run.id === eventData.id
              ? { ...run, status: eventData.status }
              : run
          )
        );
      });

      eventSource.addEventListener("stdout", (event) => {
        const chunk = JSON.parse(event.data);

        setSelectedRun((previous) =>
          previous ? { ...previous, stdout: previous.stdout + chunk } : previous
        );
      });

      eventSource.addEventListener("stderr", (event) => {
        const chunk = JSON.parse(event.data);

        setSelectedRun((previous) =>
          previous ? { ...previous, stderr: previous.stderr + chunk } : previous
        );
      });

      eventSource.addEventListener("finished", async (event) => {
        const eventData = JSON.parse(event.data);

        setSelectedRun((previous) =>
          previous
            ? {
                ...previous,
                status: eventData.status,
                stdout: eventData.stdout,
                stderr: eventData.stderr,
                exitCode: eventData.exitCode,
                durationMs: eventData.durationMs,
                workerId: eventData.workerId ?? previous.workerId
              }
            : previous
        );

        setRuns((previous) =>
          previous.map((run) =>
            run.id === eventData.id
              ? {
                  ...run,
                  status: eventData.status,
                  exitCode: eventData.exitCode,
                  durationMs: eventData.durationMs,
                  workerId: eventData.workerId
                }
              : run
          )
        );

        eventSource.close();
        await loadStats();
      });

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadRuns();
    loadStats();
    loadWorkers();
    loadQueueStats();

    const interval = window.setInterval(() => {
      loadWorkers();
      loadQueueStats();
    }, 2000);

    return () => window.clearInterval(interval);
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

          <MetricCard label="Workers Online" value={queueStats?.workersOnline ?? 0} />

          <MetricCard label="Queued Jobs" value={queueStats?.queuedRuns ?? 0} />

          <MetricCard label="Dead Letters" value={queueStats?.deadLetterRuns ?? 0} />
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-semibold">Worker Status</h2>

          <div className="grid gap-3 md:grid-cols-3">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="rounded-xl border border-white/10 bg-slate-950/70 p-4"
              >
                <div className="font-mono text-xs text-slate-400">
                  {worker.id.slice(0, 8)}
                </div>

                <div className="mt-2 text-sm">
                  {worker.activeJob ? (
                    <span className="text-cyan-300">
                      Active: {worker.activeJob.slice(0, 8)}
                    </span>
                  ) : (
                    <span className="text-emerald-300">Idle</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

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
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play size={18} />
              Run in Docker
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
                  <div className="mt-1 font-mono text-xs text-slate-500">
                    worker {run.workerId ? run.workerId.slice(0, 8) : "pending"}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedRun && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Run Details</h2>
                <div className="mt-1 text-sm text-slate-400">
                  Worker:{" "}
                  <span className="font-mono text-slate-300">
                    {selectedRun.workerId ?? "pending"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-sm ${statusClass(selectedRun.status)}`}>
                  {selectedRun.status}
                </span>

                {(selectedRun.status === "QUEUED" ||
                  selectedRun.status === "RUNNING" ||
                  selectedRun.status === "CANCEL_REQUESTED") && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/runs/${selectedRun.id}/cancel`, {
                        method: "POST"
                      });
                    }}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/20"
                  >
                    Cancel
                  </button>
                )}
              </div>
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