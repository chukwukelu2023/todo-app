import { NextResponse, type NextRequest } from "next/server";
import { HttpError, requireApiUser, withErrors } from "@/lib/authz";
import { parseOr400, readJson } from "@/lib/http";
import { deleteTask, getTask, updateTask } from "@/lib/tasks";
import { updateTaskSchema } from "@/lib/validation";

type Ctx = RouteContext<"/api/tasks/[id]">;

export const GET = withErrors(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireApiUser();
  const { id } = await ctx.params;
  const task = await getTask(user, id);
  if (!task) throw new HttpError(404, "Task not found");
  return NextResponse.json(task);
});

export const PATCH = withErrors(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireApiUser();
  const { id } = await ctx.params;
  const input = parseOr400(updateTaskSchema, await readJson(req));
  const task = await updateTask(user, id, input);
  if (!task) throw new HttpError(404, "Task not found");
  return NextResponse.json(task);
});

export const DELETE = withErrors(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireApiUser();
  const { id } = await ctx.params;
  if (!(await deleteTask(user, id))) throw new HttpError(404, "Task not found");
  return new NextResponse(null, { status: 204 });
});
