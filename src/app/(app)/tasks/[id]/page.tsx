import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskDetail } from "@/components/TaskDetail";
import { requireUser } from "@/lib/authz";
import { getTask } from "@/lib/tasks";

export const metadata: Metadata = { title: "Task" };

export default async function TaskPage(props: PageProps<"/tasks/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const task = await getTask(user, id);
  if (!task) notFound();

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to tasks
      </Link>
      <TaskDetail task={task} showOwner={user.role === "ADMIN"} />
    </div>
  );
}
