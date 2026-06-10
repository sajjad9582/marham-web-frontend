import { findLatestCorporateUserByUserId } from "@/lib/db/queries/corporate";

export async function getCorporateUserDetails(userId: number) {
  return findLatestCorporateUserByUserId(userId);
}
