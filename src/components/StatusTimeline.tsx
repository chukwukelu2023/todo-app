import { isTaskStatus, STATUS_LABELS } from "@/lib/status";
import { LocalTime } from "./LocalTime";

type StatusEvent = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: Date | string;
  changedBy: { name: string };
};

const label = (s: string) => (isTaskStatus(s) ? STATUS_LABELS[s] : s);

export function StatusTimeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No status changes recorded.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
          <p className="text-sm text-slate-900">
            {e.fromStatus ? (
              <>
                {label(e.fromStatus)} → <span className="font-medium">{label(e.toStatus)}</span>
              </>
            ) : (
              <>
                Created as <span className="font-medium">{label(e.toStatus)}</span>
              </>
            )}
          </p>
          <p className="text-xs text-slate-500">
            <LocalTime value={e.changedAt} /> · by {e.changedBy.name}
          </p>
        </li>
      ))}
    </ol>
  );
}
