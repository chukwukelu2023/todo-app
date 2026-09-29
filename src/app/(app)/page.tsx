import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskTable } from "@/components/TaskTable";
import { primaryButton } from "@/components/ui";
import { requireUser } from "@/lib/authz";
import { listTasks } from "@/lib/tasks";
import { listUsers } from "@/lib/users";
import { listTasksQuerySchema } from "@/lib/validation";

export default async function TasksPage(props: PageProps<"/">) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  // Flatten repeated params and fall back to defaults for anything invalid in the URL.
  const raw = Object.fromEntries(
    Object.entries(await props.searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = listTasksQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : listTasksQuerySchema.parse({});

  const [result, users] = await Promise.all([
    listTasks(user, query),
    isAdmin ? listUsers() : Promise.resolve(undefined),
  ]);

  const params: Record<string, string> = {};
  for (const key of ["status", "userId", "sort", "order", "pageSize"] as const) {
    const value = query[key];
    if (value !== undefined) params[key] = String(value);
  }
  const filtered = Boolean(query.status || query.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isAdmin ? "All tasks" : "My tasks"}
          </h1>
          <p className="text-sm text-slate-500">Click a task to see its details and progress.</p>
        </div>
        <Link href="/tasks/new" className={primaryButton}>
          New task
        </Link>
      </div>

      <TaskFilters query={query} users={users} />

      {result.items.length > 0 ? (
        <>
          <TaskTable items={result.items} timestampField={query.sort} showOwner={isAdmin} />
          <Pagination {...result} params={params} />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-900">
            {filtered ? "No tasks match these filters" : "No tasks yet"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {filtered ? "Try a different status or user." : "Create your first task to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
