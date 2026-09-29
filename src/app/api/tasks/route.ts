import { NextResponse, type NextRequest } from "next/server";
import { requireApiUser, withErrors } from "@/lib/authz";
import { parseOr400, readJson } from "@/lib/http";
import { createTask, listTasks } from "@/lib/tasks";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validation";

export const GET = withErrors(async (req: NextRequest) => {
  const user = await requireApiUser();
  const query = parseOr400(listTasksQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
  return NextResponse.json(await listTasks(user, query));
});

export const POST = withErrors(async (req: NextRequest) => {
  const user = await requireApiUser();
  const input = parseOr400(createTaskSchema, await readJson(req));
  return NextResponse.json(await createTask(user, input), { status: 201 });
});
