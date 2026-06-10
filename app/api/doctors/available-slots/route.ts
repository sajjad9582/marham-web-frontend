import { getDoctorAvailableSlots } from "@/lib/services/doctor-availability";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { getDoctorAvailableSlotsSchema } from "@/lib/schemas/doctors";
import { parseSearchParams } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(getDoctorAvailableSlotsSchema, searchParams);
    const data = await getDoctorAvailableSlots(query);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
