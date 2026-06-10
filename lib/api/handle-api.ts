import { NextResponse } from "next/server";
import { apiError, apiSuccess, wrapNestPayload } from "@/lib/api/api-response";
import { HttpError, isHttpError } from "@/lib/api/http-error";

export function jsonSuccess<T>(data: T, message = "Success") {
  return NextResponse.json(apiSuccess(data, message));
}

export function jsonNestPayload(payload: Record<string, unknown>) {
  return NextResponse.json(wrapNestPayload(payload));
}

export function handleApiError(error: unknown) {
  if (isHttpError(error)) {
    return NextResponse.json(apiError(error.message), { status: error.statusCode });
  }
  console.error(error);
  return NextResponse.json(apiError("Internal server error"), { status: 500 });
}
