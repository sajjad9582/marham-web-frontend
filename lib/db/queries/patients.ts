import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";

export type PatientRow = typeof patients.$inferSelect;

export async function findOrCreatePatient(data: {
  name?: string | null;
  phone?: string | null;
  userId?: number | null;
  age?: number | null;
  city?: string | null;
  area?: string | null;
  uuid?: string | null;
  visitorSource?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): Promise<PatientRow> {
  if (data.phone && data.name) {
    const existing = await db
      .select()
      .from(patients)
      .where(and(eq(patients.phone, data.phone), eq(patients.name, data.name)))
      .limit(1);

    if (existing[0]) return existing[0];
  }

  await db.insert(patients).values({
    name: data.name ?? "",
    phone: data.phone ?? null,
    userId: data.userId ?? null,
    age: data.age ?? null,
    city: data.city ?? null,
    area: data.area ?? null,
    uuid: data.uuid ?? null,
    visitorSource: data.visitorSource ?? null,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    createdAt: new Date(),
  });

  const inserted = await db
    .select()
    .from(patients)
    .where(and(eq(patients.phone, data.phone ?? ""), eq(patients.name, data.name ?? "")))
    .limit(1);

  return inserted[0]!;
}
