import { isTaskStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  const known = isTaskStatus(status);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        known ? STATUS_STYLES[status] : "bg-gray-100 text-gray-700 ring-gray-300"
      }`}
    >
      {known ? STATUS_LABELS[status] : status}
    </span>
  );
}
