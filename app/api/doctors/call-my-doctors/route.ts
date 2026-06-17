import { getCallMyDoctorsForListing } from "@/lib/services/doctors";
import { handleApiError, jsonSuccess } from "@/lib/api/handle-api";
import { getCallMyDoctorsSchema } from "@/lib/schemas/call-my-doctors";
import { parseSearchParams } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(getCallMyDoctorsSchema, searchParams);
    const data = await getCallMyDoctorsForListing(query);
    return jsonSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
