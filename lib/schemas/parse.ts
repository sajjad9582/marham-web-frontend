import { z } from "zod";
import { HttpError } from "@/lib/api/http-error";

function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  params: URLSearchParams,
): z.infer<T> {
  const result = schema.safeParse(searchParamsToObject(params));
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join("; ");
    throw new HttpError(400, message || "Invalid query parameters");
  }
  return result.data;
}

export async function parseJsonBody<T extends z.ZodType>(
  schema: T,
  request: Request,
): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join("; ");
    throw new HttpError(400, message || "Invalid request body");
  }
  return result.data;
}
