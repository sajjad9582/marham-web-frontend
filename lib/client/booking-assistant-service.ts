import type { BookingAssistantResult } from "@/lib/services/booking-assistant";

/**
 * Client-side call to the natural-language booking assistant.
 * `import type` above is erased at build time, so no server code is pulled in.
 */
export async function askBookingAssistant(
  message: string,
  city?: string,
): Promise<BookingAssistantResult> {
  const res = await fetch("/api/ai/booking-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, city }),
  });

  const json = (await res.json().catch(() => null)) as
    | { success: boolean; message?: string; data?: BookingAssistantResult }
    | null;

  if (!json?.success || !json.data) {
    throw new Error(json?.message || "The assistant couldn't respond. Please try again.");
  }
  return json.data;
}
