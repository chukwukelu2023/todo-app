"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { STATUS_LABELS, TASK_STATUSES } from "@/lib/status";
import { PAGE_SIZES, SORT_FIELDS, SORT_LABELS, type ListTasksQuery } from "@/lib/validation";
import { selectClass } from "./ui";

type Props = {
  query: ListTasksQuery;
  users?: { id: string; name: string; email: string }[];
};

export function TaskFilters({ query, users }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // any filter/sort change starts again from page 1
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Status">
        <select
          className={selectClass}
          value={query.status ?? ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      {users && (
        <Field label="User">
          <select
            className={selectClass}
            value={query.userId ?? ""}
            onChange={(e) => update("userId", e.target.value)}
          >
            <option value="">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Sort by">
        <select
          className={selectClass}
          value={query.sort}
          onChange={(e) => update("sort", e.target.value)}
        >
          {SORT_FIELDS.map((f) => (
            <option key={f} value={f}>
              {SORT_LABELS[f]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Order">
        <select
          className={selectClass}
          value={query.order}
          onChange={(e) => update("order", e.target.value)}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </Field>

      <Field label="Per page">
        <select
          className={selectClass}
          value={query.pageSize}
          onChange={(e) => update("pageSize", e.target.value)}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      {children}
    </label>
  );
}
