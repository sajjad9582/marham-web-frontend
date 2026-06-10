import { getDoctorProfile } from "@/lib/services/doctors";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { getDoctorProfileSchema } from "@/lib/schemas/doctors";
import { parseSearchParams } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(getDoctorProfileSchema, searchParams);
    const data = await getDoctorProfile(query.doctorId);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
