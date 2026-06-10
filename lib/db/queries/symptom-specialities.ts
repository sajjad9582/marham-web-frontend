import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { symptomSpecialities } from "@/lib/db/schema";

export async function getSpecialityIdsBySymptom(symptomId: number): Promise<number[]> {
  const rows = await db
    .select({ specialityId: symptomSpecialities.specialityId })
    .from(symptomSpecialities)
    .where(eq(symptomSpecialities.symptomId, String(symptomId)));

  return rows.map((r) => Number(r.specialityId));
}
