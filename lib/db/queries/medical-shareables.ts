import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { medicalShareables } from "@/lib/db/schema";

const DOCTOR_OBJECT_TYPE = "App\\Models\\Docdetail";

export async function isDoctorFavorited(userId: number, doctorId: number): Promise<boolean> {
  const rows = await db
    .select({ id: medicalShareables.id })
    .from(medicalShareables)
    .where(
      and(
        eq(medicalShareables.userId, userId),
        eq(medicalShareables.objectId, doctorId),
        eq(medicalShareables.objectType, DOCTOR_OBJECT_TYPE),
        eq(medicalShareables.type, 1),
      ),
    )
    .limit(1);

  return rows.length > 0;
}
