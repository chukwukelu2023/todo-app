"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskDetail as TaskDetailData } from "@/lib/tasks";
import { isTaskStatus, STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/status";
import { ApiError, apiFetch } from "./api";
import { LocalTime } from "./LocalTime";
import { StatusBadge } from "./StatusBadge";
import { StatusTimeline } from "./StatusTimeline";
import { TaskForm } from "./TaskForm";
import { dangerButton, secondaryButton, selectClass } from "./ui";

type Props = { task: TaskDetailData; showOwner: boolean };

export function TaskDetail({ task, showOwner }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const changeStatus = (status: TaskStatus) =>
    run(async () => {
      await apiFetch(`/api/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      router.refresh();
    });

  const remove = () => {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    run(async () => {
      await apiFetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    });
  };

  if (editing) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Edit task</h1>
        <TaskForm
          taskId={task.id}
          initial={{
            title: task.title,
            description: task.description,
            status: isTaskStatus(task.status) ? task.status : "PENDING",
          }}
          submitLabel="Save changes"
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      </section>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold break-words text-slate-900">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          {task.description ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{task.description}</p>
          ) : (
            <p className="text-sm italic text-slate-400">No description.</p>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <Meta label="Created">
            <LocalTime value={task.createdAt} />
          </Meta>
          <Meta label="Last updated">
            <LocalTime value={task.updatedAt} />
          </Meta>
          <Meta label="Status changed">
            <LocalTime value={task.statusChangedAt} />
          </Meta>
          {showOwner && <Meta label="Owner">{task.owner.name}</Meta>}
        </dl>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Move to
            <select
              className={selectClass}
              value={task.status}
              disabled={busy}
              onChange={(e) => changeStatus(e.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex gap-2">
            <button className={secondaryButton} disabled={busy} onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className={dangerButton} disabled={busy} onClick={remove}>
              Delete
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Progress history</h2>
        <StatusTimeline events={task.statusEvents} />
      </section>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-800">{children}</dd>
    </div>
  );
}
