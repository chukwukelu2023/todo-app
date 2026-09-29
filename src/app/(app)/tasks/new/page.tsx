import type { Metadata } from "next";
import Link from "next/link";
import { NewTaskForm } from "@/components/NewTaskForm";

export const metadata: Metadata = { title: "New task" };

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to tasks
      </Link>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">New task</h1>
        <NewTaskForm />
      </section>
    </div>
  );
}
