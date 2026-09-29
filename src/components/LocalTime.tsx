"use client";

import { formatDateTime, formatRelative } from "@/lib/format";

/**
 * Renders a timestamp in the viewer's timezone. The server render may use a
 * different timezone, so hydration differences in the text are expected.
 */
export function LocalTime({ value, className }: { value: Date | string; className?: string }) {
  const date = new Date(value);
  return (
    <time
      dateTime={date.toISOString()}
      title={formatRelative(date)}
      className={className}
      suppressHydrationWarning
    >
      {formatDateTime(date)}
    </time>
  );
}
