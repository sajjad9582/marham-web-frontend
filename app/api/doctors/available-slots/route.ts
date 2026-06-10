import { getServices } from "@/lib/server/get-services";
import { handleApiError, jsonSuccess } from "@/lib/server/handle-api";
import { parseGetDoctorAvailableSlotsDto } from "@/lib/server/parse-query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseGetDoctorAvailableSlotsDto(searchParams);
    const { doctorAvailability } = await getServices();
    const data = await doctorAvailability.getDoctorAvailableSlots(
      query.doctorId,
      query.hospitalId,
      query.date,
      query.days,
    );
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
