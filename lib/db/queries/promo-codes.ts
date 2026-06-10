import { and, count, eq, isNull, lte, gte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { patientAppointments, promoCodes } from "@/lib/db/schema";
import { PromoCodeValidity } from "@/lib/db/enums/promo-code-validity.enum";

export type PromoCodeRow = typeof promoCodes.$inferSelect;

export async function checkPromoCode(code: string, date: string): Promise<PromoCodeRow | null> {
  const rows = await db
    .select()
    .from(promoCodes)
    .where(
      and(
        eq(promoCodes.code, code),
        isNull(promoCodes.deletedAt),
        or(
          eq(promoCodes.validity, PromoCodeValidity.LIFETIME),
          and(
            eq(promoCodes.validity, PromoCodeValidity.SPECIFIC_TIME),
            lte(promoCodes.validFrom, new Date(date)),
            gte(promoCodes.validTo, new Date(date)),
          ),
          and(
            eq(promoCodes.validity, PromoCodeValidity.ONETIME),
            isNull(promoCodes.claimedAt),
          ),
        ),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getPromoCodeAppointmentCount(promoCodeId: bigint): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(patientAppointments)
    .where(eq(patientAppointments.promoCodeId, promoCodeId));

  return result[0]?.value ?? 0;
}

export async function findPromoCodeById(id: number): Promise<PromoCodeRow | null> {
  const rows = await db.select().from(promoCodes).where(eq(promoCodes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function markPromoCodeClaimed(id: number): Promise<void> {
  await db
    .update(promoCodes)
    .set({ claimedAt: sql`NOW()`, updatedAt: new Date() })
    .where(eq(promoCodes.id, id));
}
