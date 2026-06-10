import { desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { userFriendsAndFamily, users } from "@/lib/db/schema";

export type UserRow = typeof users.$inferSelect;

export async function findUserById(id: number): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findUserByPhone(phone: string): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return rows[0] ?? null;
}

export async function insertUser(data: Partial<UserRow>): Promise<UserRow> {
  const now = new Date();
  await db.insert(users).values({
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  } as typeof users.$inferInsert);

  if (data.phone) {
    const row = await findUserByPhone(data.phone);
    if (row) return row;
  }
  if (data.id) {
    const row = await findUserById(data.id);
    if (row) return row;
  }
  throw new Error("Failed to retrieve inserted user");
}

export async function updateUser(user: UserRow): Promise<UserRow> {
  await db
    .update(users)
    .set({ ...user, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return (await findUserById(user.id))!;
}

export async function findUsersByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
      gender: users.gender,
      dateOfBirth: users.dateOfBirth,
      verified: users.verified,
    })
    .from(users)
    .where(inArray(users.id, ids));
}

export async function findAllFriendsAndFamilyByUserId(userId: number) {
  return db
    .select()
    .from(userFriendsAndFamily)
    .where(eq(userFriendsAndFamily.userId, userId))
    .orderBy(desc(userFriendsAndFamily.createdAt));
}
