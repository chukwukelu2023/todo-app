import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./prisma";
import type { CreateUserInput } from "./validation";

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

export async function listUsers(db: PrismaClient = defaultPrisma) {
  return db.user.findMany({
    orderBy: { name: "asc" },
    select: { ...publicUserSelect, _count: { select: { tasks: true } } },
  });
}
export type UserListItem = Awaited<ReturnType<typeof listUsers>>[number];

export class EmailTakenError extends Error {
  constructor() {
    super("A user with that email already exists");
  }
}

export async function createUser(input: CreateUserInput, db: PrismaClient = defaultPrisma) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw new EmailTakenError();
  return db.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, 10),
    },
    select: publicUserSelect,
  });
}
