import { bookPhysicalFromWeb } from "@/lib/services/bookings";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { webBookAppointmentSchema } from "@/lib/schemas/bookings";
import { parseJsonBody } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(webBookAppointmentSchema, request);
    const data = await bookPhysicalFromWeb(body);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
