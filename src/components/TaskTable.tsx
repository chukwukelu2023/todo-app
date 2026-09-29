"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TaskListItem } from "@/lib/tasks";
import { SORT_LABELS, type SortField } from "@/lib/validation";
import { LocalTime } from "./LocalTime";
import { StatusBadge } from "./StatusBadge";

type Props = {
  items: TaskListItem[];
  timestampField: SortField;
  showOwner: boolean;
};

export function TaskTable({ items, timestampField, showOwner }: Props) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="w-14 px-4 py-3">
              #
            </th>
            <th scope="col" className="px-4 py-3">
              Title
            </th>
            {showOwner && (
              <th scope="col" className="px-4 py-3">
                Owner
              </th>
            )}
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              {SORT_LABELS[timestampField]}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((task) => (
            <tr
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <td className="px-4 py-3 tabular-nums text-slate-500">{task.serial}</td>
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  href={`/tasks/${task.id}`}
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.title}
                </Link>
              </td>
              {showOwner && <td className="px-4 py-3 text-slate-600">{task.owner.name}</td>}
              <td className="px-4 py-3">
                <StatusBadge status={task.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                <LocalTime value={task[timestampField]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
