import { getServices } from "@/lib/server/get-services";
import { handleApiError, jsonSuccess } from "@/lib/server/handle-api";
import { parseGetDoctorProfileDto } from "@/lib/server/parse-query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseGetDoctorProfileDto(searchParams);
    const { doctors } = await getServices();
    const data = await doctors.getDoctorProfile(query.doctorId);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
