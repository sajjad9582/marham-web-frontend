import { validatePromoCode } from "@/lib/services/promo-codes";
import { handleApiError, jsonNestPayload } from "@/lib/api/handle-api";
import { validatePromoCodeSchema } from "@/lib/schemas/promo-codes";
import { parseJsonBody } from "@/lib/schemas/parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(validatePromoCodeSchema, request);
    const result = await validatePromoCode(body);

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
