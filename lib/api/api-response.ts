export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export function apiSuccess<T>(data: T, message = "Success"): ApiResponse<T> {
  return { success: true, message, data };
}

export function apiError<T = null>(message: string, data: T = null as T): ApiResponse<T> {
  return { success: false, message, data };
}

/** Nest-style payload with status/message fields (promo validate). */
export function wrapNestPayload(payload: Record<string, unknown>): ApiResponse<unknown> {
  let message = "Success";
  let isError = false;
  const data = { ...payload };

  if (data.status === false || data.error) {
    isError = true;
  }
  if ("message" in data && typeof data.message === "string") {
    message = data.message;
    delete data.message;
  }
  if ("status" in data) {
    delete data.status;
  }
  if ("error" in data) {
    delete data.error;
  }

  if (isError) {
    return apiError(message, Object.keys(data).length ? data : null);
  }
  return apiSuccess(Object.keys(data).length ? data : null, message);
}
