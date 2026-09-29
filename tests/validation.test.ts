import { describe, expect, it } from "vitest";
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from "@/lib/validation";
import { pageWindow } from "@/components/Pagination";

describe("listTasksQuerySchema", () => {
  it("applies defaults", () => {
    expect(listTasksQuerySchema.parse({})).toEqual({
      sort: "createdAt",
      order: "desc",
      page: 1,
      pageSize: 10,
    });
  });

  it("coerces query-string values and treats empty strings as unset", () => {
    expect(
      listTasksQuerySchema.parse({ status: "", page: "3", pageSize: "15", sort: "statusChangedAt" }),
    ).toMatchObject({ status: undefined, page: 3, pageSize: 15, sort: "statusChangedAt" });
  });

  it("rejects unsupported page sizes, sorts and statuses", () => {
    expect(listTasksQuerySchema.safeParse({ pageSize: "50" }).success).toBe(false);
    expect(listTasksQuerySchema.safeParse({ sort: "title" }).success).toBe(false);
    expect(listTasksQuerySchema.safeParse({ status: "DONE" }).success).toBe(false);
    expect(listTasksQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });
});

describe("task schemas", () => {
  it("requires a non-blank title", () => {
    expect(createTaskSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(createTaskSchema.parse({ title: "  Buy milk " })).toEqual({
      title: "Buy milk",
      description: "",
      status: "PENDING",
    });
  });

  it("rejects empty updates", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
    expect(updateTaskSchema.safeParse({ status: "BACKLOG" }).success).toBe(true);
  });
});

describe("pageWindow", () => {
  it("shows every page when there are few", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("collapses gaps with an ellipsis", () => {
    expect(pageWindow(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageWindow(1, 10)).toEqual([1, 2, "…", 10]);
  });
});
