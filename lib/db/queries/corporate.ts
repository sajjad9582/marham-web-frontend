import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { corporateUsers } from "@/lib/db/schema";

export async function findLatestCorporateUserByUserId(userId: number) {
  const rows = await db
    .select()
    .from(corporateUsers)
    .where(eq(corporateUsers.userId, userId))
    .orderBy(desc(corporateUsers.id))
    .limit(1);
  return rows[0] ?? null;
}
