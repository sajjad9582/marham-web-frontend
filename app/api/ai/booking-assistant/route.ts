import { runBookingAssistant } from "@/lib/services/booking-assistant";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { bookingAssistantSchema } from "@/lib/schemas/booking-assistant";
import { parseJsonBody } from "@/lib/schemas/parse";

export const runtime = "nodejs";
// A Model-Gateway parse spins up a Browserbase session, so allow extra headroom.
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(bookingAssistantSchema, request);
    const data = await runBookingAssistant(body);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
