import { z } from "zod";
import { ROLES, TASK_STATUSES } from "./status";

export const PAGE_SIZES = [10, 15] as const;
export const SORT_FIELDS = ["createdAt", "updatedAt", "statusChangedAt"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_LABELS: Record<SortField, string> = {
  createdAt: "Created",
  updatedAt: "Updated",
  statusChangedAt: "Status changed",
};

const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

export const listTasksQuerySchema = z.object({
  status: z.preprocess(emptyToUndefined, z.enum(TASK_STATUSES).optional()),
  userId: z.preprocess(emptyToUndefined, z.string().optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(SORT_FIELDS).default("createdAt")),
  order: z.preprocess(emptyToUndefined, z.enum(["asc", "desc"]).default("desc")),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int()
      .refine((n) => (PAGE_SIZES as readonly number[]).includes(n), "pageSize must be 10 or 15")
      .default(10),
  ),
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).default(""),
  status: z.enum(TASK_STATUSES).default("PENDING"),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5000),
    status: z.enum(TASK_STATUSES),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const createUserSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(1, "Name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(ROLES).default("USER"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
