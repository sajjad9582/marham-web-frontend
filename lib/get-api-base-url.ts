const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_MARHAM_API_URL ?? DEFAULT_API_BASE_URL;
}
