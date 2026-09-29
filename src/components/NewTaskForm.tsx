"use client";

import { useRouter } from "next/navigation";
import { TaskForm } from "./TaskForm";

export function NewTaskForm() {
  const router = useRouter();
  return (
    <TaskForm
      submitLabel="Create task"
      onSaved={(task) => {
        router.push(`/tasks/${task.id}`);
        router.refresh();
      }}
      onCancel={() => router.back()}
    />
  );
}
