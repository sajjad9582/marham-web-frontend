import { bookFromWeb } from "@/lib/services/bookings";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { webBookOnlineConsultationSchema } from "@/lib/schemas/bookings";
import { parseJsonBody } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(webBookOnlineConsultationSchema, request);
    const data = await bookFromWeb(body);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
