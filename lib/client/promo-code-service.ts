import { MARHAM_API_ENDPOINTS, ONLINE_CONSULTATION_PROGRAM_ID } from "@/lib/constants/marham-api-endpoints";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import type { ValidatePromoCodeResponse } from "@/lib/types/marham-api";

export type ValidatePromoCodeParams = {
  promoCode: string;
  doctorId: number;
  specialityId: number;
};

export async function validatePromoCode(
  params: ValidatePromoCodeParams,
): Promise<ValidatePromoCodeResponse> {
  const response = await fetch(`${getApiBaseUrl()}${MARHAM_API_ENDPOINTS.PROMO_CODES_VALIDATE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      promoCode: params.promoCode,
      programId: ONLINE_CONSULTATION_PROGRAM_ID,
      doctorId: params.doctorId,
      specialityId: params.specialityId,
    }),
  });

  if (!response.ok) {
    return {
      success: false,
      message: "Unable to validate promo code. Please try again.",
      data: null,
    };
  }

  return (await response.json()) as ValidatePromoCodeResponse;
}
