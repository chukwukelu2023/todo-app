import { describe, expect, it } from "vitest";
import { formatDateTime, formatRelative } from "@/lib/format";

describe("formatDateTime", () => {
  it("formats as day month year, time", () => {
    // Build the date in local time so the assertion holds in any timezone.
    expect(formatDateTime(new Date(2026, 8, 29, 16, 42))).toBe("29 Sep 2026, 16:42");
  });

  it("accepts ISO strings", () => {
    const d = new Date(2026, 0, 5, 9, 7);
    expect(formatDateTime(d.toISOString())).toBe("5 Jan 2026, 09:07");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-09-29T12:00:00Z");

  it("returns 'just now' for under a minute", () => {
    expect(formatRelative(new Date("2026-09-29T11:59:30Z"), now)).toBe("just now");
  });

  it("uses the largest whole unit", () => {
    expect(formatRelative(new Date("2026-09-29T10:00:00Z"), now)).toBe("2 hours ago");
    expect(formatRelative(new Date("2026-09-28T12:00:00Z"), now)).toBe("yesterday");
    expect(formatRelative(new Date("2026-10-02T12:00:00Z"), now)).toBe("in 3 days");
  });
});
