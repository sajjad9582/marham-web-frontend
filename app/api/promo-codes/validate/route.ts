import { getServices } from "@/lib/server/get-services";
import { handleApiError, jsonNestPayload, requireFields } from "@/lib/server/handle-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    requireFields(body, ["promoCode", "programId"]);

    const { promoCode } = await getServices();
    const result = await promoCode.validatePromoCode({
      promoCode: String(body.promoCode),
      programId: Number(body.programId),
      doctorId: body.doctorId != null ? Number(body.doctorId) : undefined,
      specialityId: body.specialityId != null ? Number(body.specialityId) : undefined,
      orderId: body.orderId != null ? Number(body.orderId) : undefined,
    });

    if (!result.valid || !result.promoCode) {
      return jsonNestPayload({
        status: false,
        message: result.message || "Invalid promo code",
      });
    }

    return jsonNestPayload({
      status: true,
      message: "Promo code is valid",
      code: result.promoCode.code,
      discountPercentage: result.promoCode.discountPercentage,
      companyName: result.promoCode.companyName,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
