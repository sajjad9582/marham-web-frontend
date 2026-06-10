import { CorporateUserRepository } from "@/lib/server/repositories/corporate-user.repository";

export class CorporateService {
  constructor(private readonly corporateUserRepository: CorporateUserRepository) {}

  async getCorporateUserDetails(userId: number) {
    return this.corporateUserRepository.findLatestByUserId(userId);
  }
}
