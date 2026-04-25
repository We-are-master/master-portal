import type { JobStatus } from "@/lib/mocks/portal-v2";

const STEP_INDEX: Record<JobStatus, number> = {
  upcoming: 1,
  in_progress: 2,
  awaiting_report: 3,
  completed: 4,
  cancelled: 0,
};

export function ProgressBar({ status }: { status: JobStatus }) {
  const steps = ["Request", "Assigned", "On Site", "Completed"];
  const prog = STEP_INDEX[status] ?? 1;
  return (
    <div className="prog-bar">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < prog;
        const active = idx === prog;
        return (
          <div key={s} className={`prog-step${done ? " done" : active ? " active" : ""}`}>
            <div className="prog-dot">{done ? "✓" : active ? "●" : idx}</div>
            <div className="prog-lbl">{s}</div>
          </div>
        );
      })}
    </div>
  );
}
