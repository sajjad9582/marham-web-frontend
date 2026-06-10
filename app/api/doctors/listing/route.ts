import { getDoctorListing } from "@/lib/services/doctors";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { getDoctorsSchema } from "@/lib/schemas/doctors";
import { parseSearchParams } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(getDoctorsSchema, searchParams);
    const data = await getDoctorListing(query, undefined, true);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
