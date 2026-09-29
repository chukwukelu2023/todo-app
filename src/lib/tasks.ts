import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./prisma";
import type { Role } from "./status";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./validation";

export type Actor = { id: string; role: Role };

type Db = PrismaClient;

export function canAccessTask(actor: Actor, task: { ownerId: string }): boolean {
  return actor.role === "ADMIN" || task.ownerId === actor.id;
}

/** Normal users only ever see their own tasks; admins see all, optionally filtered by user. */
export function buildTaskWhere(
  actor: Actor,
  query: Pick<ListTasksQuery, "status" | "userId">,
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};
  if (actor.role === "ADMIN") {
    if (query.userId) where.ownerId = query.userId;
  } else {
    where.ownerId = actor.id;
  }
  if (query.status) where.status = query.status;
  return where;
}

/** Clamps the requested page into range and works out the row offset. */
export function paginate(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return { page: current, pageSize, total, totalPages, skip: (current - 1) * pageSize };
}

export async function listTasks(actor: Actor, query: ListTasksQuery, db: Db = defaultPrisma) {
  const where = buildTaskWhere(actor, query);
  const total = await db.task.count({ where });
  const { skip, ...meta } = paginate(total, query.page, query.pageSize);

  const items = await db.task.findMany({
    where,
    orderBy: [{ [query.sort]: query.order }, { id: query.order }],
    skip,
    take: meta.pageSize,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      statusChangedAt: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    ...meta,
    items: items.map((t, i) => ({ ...t, serial: skip + i + 1 })),
  };
}
export type TaskListResult = Awaited<ReturnType<typeof listTasks>>;
export type TaskListItem = TaskListResult["items"][number];

export async function getTask(actor: Actor, id: string, db: Db = defaultPrisma) {
  const task = await db.task.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      statusEvents: {
        orderBy: [{ changedAt: "asc" }, { id: "asc" }],
        include: { changedBy: { select: { id: true, name: true } } },
      },
    },
  });
  // Inaccessible tasks are reported as missing so other users' task ids are not leaked.
  if (!task || !canAccessTask(actor, task)) return null;
  return task;
}
export type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTask>>>;

export async function createTask(actor: Actor, input: CreateTaskInput, db: Db = defaultPrisma) {
  const now = new Date();
  return db.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      statusChangedAt: now,
      createdAt: now,
      ownerId: actor.id,
      statusEvents: {
        create: { fromStatus: null, toStatus: input.status, changedAt: now, changedById: actor.id },
      },
    },
  });
}

/** Returns the updated task, or null if it doesn't exist or isn't accessible. */
export async function updateTask(
  actor: Actor,
  id: string,
  input: UpdateTaskInput,
  db: Db = defaultPrisma,
) {
  return db.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({ where: { id } });
    if (!existing || !canAccessTask(actor, existing)) return null;

    const data: Prisma.TaskUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;

    if (input.status !== undefined && input.status !== existing.status) {
      const now = new Date();
      data.status = input.status;
      data.statusChangedAt = now;
      data.statusEvents = {
        create: {
          fromStatus: existing.status,
          toStatus: input.status,
          changedAt: now,
          changedBy: { connect: { id: actor.id } },
        },
      };
    }

    return tx.task.update({ where: { id }, data });
  });
}

/** Returns true if deleted, false if it doesn't exist or isn't accessible. */
export async function deleteTask(actor: Actor, id: string, db: Db = defaultPrisma) {
  const existing = await db.task.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing || !canAccessTask(actor, existing)) return false;
  await db.task.delete({ where: { id } });
  return true;
}
