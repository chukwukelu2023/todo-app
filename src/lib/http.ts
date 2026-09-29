import { z } from "zod";
import { HttpError } from "./authz";

/** Parses a value with a zod schema, throwing a 400 HttpError with field errors on failure. */
export function parseOr400<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, "Validation failed", z.flattenError(result.error));
  }
  return result.data;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}
