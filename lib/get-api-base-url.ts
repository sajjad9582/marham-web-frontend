export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_MARHAM_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  // Same-origin relative URLs — no build-time API host required in Docker.
  return "";
}