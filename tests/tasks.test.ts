import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  buildTaskWhere,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  paginate,
  updateTask,
  type Actor,
} from "@/lib/tasks";
import { listTasksQuerySchema } from "@/lib/validation";

const db = new PrismaClient();
let admin: Actor;
let alice: Actor;
let bob: Actor;

const query = (q: Record<string, unknown> = {}) => listTasksQuerySchema.parse(q);

beforeEach(async () => {
  await db.taskStatusEvent.deleteMany();
  await db.task.deleteMany();
  await db.user.deleteMany();
  const mk = (email: string, role: "ADMIN" | "USER") =>
    db.user.create({ data: { email, name: email.split("@")[0], role, passwordHash: "x" } });
  admin = { id: (await mk("admin@test.dev", "ADMIN")).id, role: "ADMIN" };
  alice = { id: (await mk("alice@test.dev", "USER")).id, role: "USER" };
  bob = { id: (await mk("bob@test.dev", "USER")).id, role: "USER" };
});

afterAll(() => db.$disconnect());

describe("paginate", () => {
  it("computes offsets and clamps out-of-range pages", () => {
    expect(paginate(42, 2, 10)).toEqual({ page: 2, pageSize: 10, total: 42, totalPages: 5, skip: 10 });
    expect(paginate(42, 99, 15)).toMatchObject({ page: 3, totalPages: 3, skip: 30 });
    expect(paginate(0, 1, 10)).toMatchObject({ page: 1, totalPages: 1, skip: 0 });
  });
});

describe("buildTaskWhere", () => {
  it("always scopes normal users to their own tasks", () => {
    expect(buildTaskWhere(alice, { userId: bob.id })).toEqual({ ownerId: alice.id });
  });

  it("lets admins see everything or filter by user", () => {
    expect(buildTaskWhere(admin, {})).toEqual({});
    expect(buildTaskWhere(admin, { userId: bob.id, status: "BACKLOG" })).toEqual({
      ownerId: bob.id,
      status: "BACKLOG",
    });
  });
});

describe("tasks", () => {
  it("records the initial status event on create", async () => {
    const task = await createTask(alice, { title: "A", description: "", status: "BACKLOG" }, db);
    const detail = await getTask(alice, task.id, db);
    expect(detail?.statusEvents).toHaveLength(1);
    expect(detail?.statusEvents[0]).toMatchObject({ fromStatus: null, toStatus: "BACKLOG" });
  });

  it("records a timestamped event for each status change, and none for other edits", async () => {
    const task = await createTask(alice, { title: "A", description: "", status: "BACKLOG" }, db);
    await updateTask(alice, task.id, { status: "PENDING" }, db);
    await updateTask(alice, task.id, { status: "IN_PROGRESS" }, db);
    await updateTask(alice, task.id, { title: "Renamed" }, db);
    await updateTask(alice, task.id, { status: "IN_PROGRESS" }, db); // unchanged → no event
    const updated = await updateTask(alice, task.id, { status: "COMPLETED" }, db);

    const detail = await getTask(alice, task.id, db);
    expect(detail?.title).toBe("Renamed");
    expect(detail?.statusEvents.map((e) => [e.fromStatus, e.toStatus])).toEqual([
      [null, "BACKLOG"],
      ["BACKLOG", "PENDING"],
      ["PENDING", "IN_PROGRESS"],
      ["IN_PROGRESS", "COMPLETED"],
    ]);
    expect(updated?.statusChangedAt.getTime()).toBe(detail?.statusEvents.at(-1)?.changedAt.getTime());
  });

  it("hides other users' tasks but gives admins full access", async () => {
    const task = await createTask(alice, { title: "Private", description: "", status: "PENDING" }, db);

    expect(await getTask(bob, task.id, db)).toBeNull();
    expect(await updateTask(bob, task.id, { title: "Hacked" }, db)).toBeNull();
    expect(await deleteTask(bob, task.id, db)).toBe(false);

    const edited = await updateTask(admin, task.id, { status: "COMPLETED" }, db);
    expect(edited?.status).toBe("COMPLETED");
    expect(await deleteTask(admin, task.id, db)).toBe(true);
    expect(await getTask(alice, task.id, db)).toBeNull();
  });

  it("filters, sorts, paginates and numbers rows serially", async () => {
    const base = Date.UTC(2026, 0, 1);
    for (let i = 0; i < 23; i++) {
      await db.task.create({
        data: {
          title: `Task ${i + 1}`,
          status: i % 2 === 0 ? "PENDING" : "COMPLETED",
          ownerId: i < 20 ? alice.id : bob.id,
          createdAt: new Date(base + i * 60_000),
        },
      });
    }

    const page2 = await listTasks(alice, query({ page: 2, sort: "createdAt", order: "asc" }), db);
    expect(page2).toMatchObject({ page: 2, pageSize: 10, total: 20, totalPages: 2 });
    expect(page2.items.map((t) => t.serial)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(page2.items[0].title).toBe("Task 11");

    const desc = await listTasks(alice, query({ order: "desc", pageSize: 15 }), db);
    expect(desc.items).toHaveLength(15);
    expect(desc.items[0].title).toBe("Task 20");

    const completed = await listTasks(alice, query({ status: "COMPLETED" }), db);
    expect(completed.total).toBe(10);
    expect(completed.items.every((t) => t.status === "COMPLETED")).toBe(true);

    expect((await listTasks(admin, query(), db)).total).toBe(23);
    expect((await listTasks(admin, query({ userId: bob.id }), db)).total).toBe(3);
    // A normal user passing userId still only gets their own tasks.
    expect((await listTasks(alice, query({ userId: bob.id }), db)).total).toBe(20);
  });
});
