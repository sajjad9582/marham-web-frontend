import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { specialities, symptoms } from "@/lib/db/schema";

export interface CatalogItem {
  id: number;
  name: string;
}

// Both catalogs are small, slow-changing master data, so we memoise them for the
// lifetime of the server process. The booking assistant resolves the LLM's
// free-text symptom/speciality against these, so ids are always real.
let symptomCache: CatalogItem[] | null = null;
let specialityCache: CatalogItem[] | null = null;

export async function getSymptomCatalog(): Promise<CatalogItem[]> {
  if (symptomCache) return symptomCache;
  const rows = await db
    .select({ id: symptoms.id, name: symptoms.name })
    .from(symptoms)
    .where(isNull(symptoms.deletedAt));
  symptomCache = rows
    .filter((r) => r.name)
    .map((r) => ({ id: Number(r.id), name: String(r.name) }));
  return symptomCache;
}

export async function getSpecialityCatalog(): Promise<CatalogItem[]> {
  if (specialityCache) return specialityCache;
  const rows = await db
    .select({ id: specialities.id, name: specialities.name })
    .from(specialities);
  specialityCache = rows
    .filter((r) => r.name)
    .map((r) => ({ id: Number(r.id), name: String(r.name) }));
  return specialityCache;
}
