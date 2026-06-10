export type CorporateUserData = {
  userId: number;
  corporateId: number;
  packageId: number;
  corporateCompany: Record<string, unknown>;
  corporatePackage: Record<string, unknown>;
};
