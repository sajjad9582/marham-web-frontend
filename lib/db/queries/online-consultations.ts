import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctorListings, onlineConsultations } from "@/lib/db/schema";

export type OnlineConsultationInsert = typeof onlineConsultations.$inferInsert;
export type OnlineConsultationRow = typeof onlineConsultations.$inferSelect;

export async function findOnlineConsultationByAppointmentId(appointmentId: bigint) {
  const rows = await db
    .select()
    .from(onlineConsultations)
    .where(eq(onlineConsultations.appointmentId, appointmentId))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertOnlineConsultation(
  data: OnlineConsultationInsert,
): Promise<OnlineConsultationRow> {
  const now = new Date();
  await db.insert(onlineConsultations).values({
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  });

  const inserted = await findOnlineConsultationByAppointmentId(data.appointmentId);
  if (!inserted) throw new Error("Failed to create online consultation");
  return inserted;
}

export async function findVideoConsultationListing(doctorId: number) {
  const rows = await db
    .select()
    .from(doctorListings)
    .where(
      and(
        eq(doctorListings.doctorId, String(doctorId)),
        eq(doctorListings.hospitalType, "2"),
        isNotNull(doctorListings.activeAt),
        isNull(doctorListings.inactiveAt),
        isNull(doctorListings.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
