import { NextResponse, type NextRequest } from "next/server";
import { HttpError, requireApiAdmin, withErrors } from "@/lib/authz";
import { parseOr400, readJson } from "@/lib/http";
import { createUser, EmailTakenError, listUsers } from "@/lib/users";
import { createUserSchema } from "@/lib/validation";

export const GET = withErrors(async () => {
  await requireApiAdmin();
  return NextResponse.json(await listUsers());
});

export const POST = withErrors(async (req: NextRequest) => {
  await requireApiAdmin();
  const input = parseOr400(createUserSchema, await readJson(req));
  try {
    return NextResponse.json(await createUser(input), { status: 201 });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      throw new HttpError(409, err.message, { fieldErrors: { email: [err.message] } });
    }
    throw err;
  }
});
