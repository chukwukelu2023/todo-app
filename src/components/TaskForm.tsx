"use client";

import { useState } from "react";
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/status";
import { ApiError, apiFetch, type FieldErrors } from "./api";
import { inputClass, labelClass, primaryButton, secondaryButton } from "./ui";

export type TaskFormValues = { title: string; description: string; status: TaskStatus };

type Props = {
  initial?: TaskFormValues;
  /** When set, the form PATCHes this task; otherwise it creates a new one. */
  taskId?: string;
  submitLabel: string;
  onSaved: (task: { id: string }) => void;
  onCancel: () => void;
};

export function TaskForm({ initial, taskId, submitLabel, onSaved, onCancel }: Props) {
  const [values, setValues] = useState<TaskFormValues>(
    initial ?? { title: "", description: "", status: "PENDING" },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const task = await apiFetch<{ id: string }>(taskId ? `/api/tasks/${taskId}` : "/api/tasks", {
        method: taskId ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });
      onSaved(task);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          className={inputClass}
          value={values.title}
          maxLength={200}
          required
          autoFocus
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
        <FieldError messages={fieldErrors.title} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          className={inputClass}
          value={values.description}
          maxLength={5000}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
        <FieldError messages={fieldErrors.description} />
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          className={inputClass}
          value={values.status}
          onChange={(e) => setValues({ ...values, status: e.target.value as TaskStatus })}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className={primaryButton} disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
        <button type="button" className={secondaryButton} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{messages.join(", ")}</p>;
}
