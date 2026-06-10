import { HttpError } from "@/lib/api/http-error";
import {
  findAllFriendsAndFamilyByUserId,
  findUserById as findUserRowById,
  findUserByPhone,
  insertUser,
  updateUser,
  findUsersByIds,
  type UserRow,
} from "@/lib/db/queries/users";
import { formatPhoneNumber } from "@/lib/db/utils/phone.util";
import { UserType } from "@/lib/db/enums";

export type User = UserRow;

export async function findUserById(id: number): Promise<User> {
  const found = await findUserRowById(id);
  if (!found) {
    throw new HttpError(404, `User with ID ${id} not found`);
  }
  return found;
}

export async function createUserWithPhone(
  phone: string,
  additionalData: Partial<User> = {},
): Promise<User> {
  const formattedPhone = formatPhoneNumber(phone);
  const existingUser = await findUserByPhone(formattedPhone);
  if (existingUser) return existingUser;

  return insertUser({
    phone: formattedPhone,
    ...additionalData,
  });
}

export async function updateUserProfile(
  id: number,
  data: { name?: string },
): Promise<Partial<User>> {
  const found = await findUserById(id);
  if (data.name) found.name = data.name;
  const saved = await updateUser(found);
  return { id: saved.id, name: saved.name, phone: saved.phone, email: saved.email };
}

export async function validateUserAccess(
  authenticatedUserId: number,
  targetUserId: number,
): Promise<void> {
  if (authenticatedUserId === targetUserId) return;

  const records = await findAllFriendsAndFamilyByUserId(authenticatedUserId);
  if (records.length === 0) {
    throw new HttpError(
      400,
      "You can only perform this action for yourself or your family members.",
    );
  }

  const relationUserIds = records.map((r) => r.relationUserId);
  const users = await findUsersByIds(relationUserIds);
  const isFamilyMember = users.some((member) => member.id === targetUserId);

  if (!isFamilyMember) {
    throw new HttpError(
      400,
      "You can only perform this action for yourself or your family members.",
    );
  }
}

export async function resolvePatientUser(phone: string, patientName: string): Promise<User> {
  const formattedPhone = formatPhoneNumber(phone);
  let user = await findUserByPhone(formattedPhone);

  if (!user) {
    return createUserWithPhone(formattedPhone, {
      name: patientName.trim(),
      type: String(UserType.SIMPLE_USER),
    });
  }

  const trimmedName = patientName.trim();
  if (trimmedName && user.name !== trimmedName) {
    await updateUserProfile(user.id, { name: trimmedName });
    user.name = trimmedName;
  }

  return user;
}
