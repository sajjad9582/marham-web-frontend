import { getServices } from "@/lib/server/get-services";
import { handleApiError, jsonSuccess } from "@/lib/server/handle-api";
import { parseGetDoctorsDto } from "@/lib/server/parse-query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseGetDoctorsDto(searchParams);
    const { doctors } = await getServices();
    const data = await doctors.getDoctorListing(query, undefined, undefined, true);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
