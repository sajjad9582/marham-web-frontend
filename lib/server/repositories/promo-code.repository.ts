import { DataSource, Repository, Brackets } from "typeorm";
import { PromoCode } from "@/lib/server/entities";
import { PromoCodeValidity } from "@/lib/server/enums/promo-code-validity.enum";
import { AppointmentRepository } from "@/lib/server/repositories/appointment.repository";

export class PromoCodeRepository extends Repository<PromoCode> {
  constructor(
    private dataSource: DataSource,
    private appointmentRepository: AppointmentRepository,
  ) {
    super(PromoCode, dataSource.createEntityManager());
  }

  async checkPromoCode(promoCode: string, date: string): Promise<PromoCode | null> {
    return this.createQueryBuilder("promo_code")
      .where("promo_code.code = :promoCode", { promoCode })
      .andWhere("promo_code.deleted_at IS NULL")
      .andWhere(
        new Brackets((sqb) => {
          sqb
            .where("promo_code.validity = :lifetime", { lifetime: PromoCodeValidity.LIFETIME })
            .orWhere(
              new Brackets((sqb2) => {
                sqb2
                  .where("promo_code.validity = :specificTime", {
                    specificTime: PromoCodeValidity.SPECIFIC_TIME,
                  })
                  .andWhere("promo_code.valid_from <= :date", { date })
                  .andWhere("promo_code.valid_to >= :date", { date });
              }),
            )
            .orWhere("promo_code.validity = :oneTime AND promo_code.claimed_at IS NULL", {
              oneTime: PromoCodeValidity.ONETIME,
            });
        }),
      )
      .getOne();
  }

  async getPromoCodeAppointmentCount(promoCodeId: number): Promise<number> {
    return this.appointmentRepository.countAppointmentsByPromoCode(BigInt(promoCodeId));
  }
}
