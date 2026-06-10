import { getServices } from "@/lib/server/get-services";
import { handleApiError, jsonSuccess, requireFields } from "@/lib/server/handle-api";
import type { WebBookOnlineConsultationDto } from "@/lib/server/dto/web-book-online-consultation.dto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebBookOnlineConsultationDto;
    requireFields(body as unknown as Record<string, unknown>, [
      "doctorId",
      "date",
      "time",
      "patientPhone",
      "patientName",
    ]);

    const { webOnlineConsultation } = await getServices();
    const data = await webOnlineConsultation.bookFromWeb(body);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
