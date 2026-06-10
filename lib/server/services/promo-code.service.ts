import { PromoCodeRepository } from '@/lib/server/repositories/promo-code.repository';
import { PromoCode } from '@/lib/server/entities';
import { ValidatePromoCodeDto } from '@/lib/server/dto/validate-promo-code.dto';
import { PromoCodeValidity, PromoCodeRestriction, Program } from '@/lib/server/enums';

export class PromoCodeService {
    constructor(
        private readonly promoCodeRepository: PromoCodeRepository,
    ) { }

    async validatePromoCode(dto: ValidatePromoCodeDto): Promise<{ valid: boolean; promoCode?: PromoCode; message?: string }> {
        const { promoCode, programId, doctorId, specialityId, orderId } = dto;
        const date = new Date().toISOString().split('T')[0];

        // Check if promo code exists and is valid
        const code = await this.promoCodeRepository.checkPromoCode(promoCode, date);

        if (!code) {
            return {
                valid: false,
                message: 'Invalid or expired promo code'
            };
        }

        // Check if promo code is applicable for the program
        if (programId && !this.isValidForType(code, programId)) {
            return {
                valid: false,
                message: 'Promo code is not applicable for this service'
            };
        }

        // Check validity based on program
        const isValid = await this.checkValidity(code, programId, orderId);

        if (!isValid) {
            return {
                valid: false,
                message: 'Promo code has already been used or is no longer valid'
            };
        }

        // Check if promo code is valid for specific doctor or speciality
        if (code.isSpecialityOrDoctor) {
            const isVerified = this.isVerifiedForService(code, specialityId ?? 0, doctorId ?? 0, orderId);
            if (!isVerified) {
                return {
                    valid: false,
                    message: 'Promo code is not valid for this doctor or speciality'
                };
            }
        }

        return {
            valid: true,
            promoCode: code
        };
    }

    private isValidForType(promoCode: PromoCode, applicableOnId: number): boolean {
        return promoCode.applicableOn?.includes(applicableOnId) ?? false;
    }

    private async checkValidity(promoCode: PromoCode, programId: number, orderId: number = 0): Promise<boolean> {
        if (promoCode.usageCount > 0) {
            return this.isValidForType(promoCode, programId) &&
                await this.isValidUsageCount(promoCode, programId) &&
                !promoCode.claimedAt &&
                this.isValidityOfTime(promoCode);
        } else {
            if (programId === Program.CORPORATE_SUBSCRIPTION) { // CORPORATE_SUBSCRIPTION
                const subscriptionCount = await this.getSubscriptionCount(promoCode.id);
                return this.isValidForType(promoCode, programId) &&
                    subscriptionCount === 0 &&
                    !promoCode.claimedAt &&
                    this.isValidityOfTime(promoCode);
            } else {
                return this.isValidForType(promoCode, programId) &&
                    !promoCode.claimedAt &&
                    this.isValidityOfTime(promoCode);
            }
        }
    }

    private async isValidUsageCount(promoCode: PromoCode, programId: number): Promise<boolean> {
        if (this.isValidForType(promoCode, Program.CORPORATE_SUBSCRIPTION)) { // CORPORATE_SUBSCRIPTION
            const subscriptionCount = await this.getSubscriptionCount(promoCode.id);
            return promoCode.usageCount > subscriptionCount;
        } else {
            const appointmentCount = await this.getAppointmentCount(promoCode.id);
            return promoCode.usageCount > appointmentCount;
        }
    }

    private isValidityOfTime(promoCode: PromoCode): boolean {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        if (promoCode.validFrom && promoCode.validTo) {
            const validFrom = new Date(promoCode.validFrom).toISOString().split('T')[0];
            const validTo = new Date(promoCode.validTo).toISOString().split('T')[0];
            return validFrom <= today && validTo >= today;
        }

        if (!promoCode.validFrom && !promoCode.validTo) {
            return true;
        }

        return false;
    }

    private isVerifiedForService(promoCode: PromoCode, specialityId: number, doctorId: number, orderId: number = 0): boolean {
        if (!orderId) {
            // For Speciality
            if (promoCode.isSpecialityOrDoctor === PromoCodeRestriction.SPECIALITY && specialityId) {
                return this.isValidForSpeciality(promoCode, specialityId);
            }

            // For Doctor
            if (promoCode.isSpecialityOrDoctor === PromoCodeRestriction.DOCTOR && doctorId) {
                return this.isValidForDoctor(promoCode, doctorId);
            }
        } else {
            // For Subscription Plan
            if (this.isValidForType(promoCode, 11)) { // CORPORATE_SUBSCRIPTION
                return this.isValidForSubscription(promoCode, orderId);
            }
        }

        return false;
    }

    private isValidForSpeciality(promoCode: PromoCode, specialityId: number): boolean {
        if (!promoCode.specialityOrDoctorData) return false;
        const specialityData = promoCode.specialityOrDoctorData.split(',').map(id => parseInt(id.trim()));
        return specialityData.includes(specialityId);
    }

    private isValidForDoctor(promoCode: PromoCode, doctorId: number): boolean {
        if (!promoCode.specialityOrDoctorData) return false;
        const doctorIds = promoCode.specialityOrDoctorData.split(',').map(id => parseInt(id.trim()));
        return doctorIds.includes(doctorId);
    }

    private isValidForSubscription(promoCode: PromoCode, subscriptionId: number): boolean {
        if (!promoCode.specialityOrDoctorData) return false;
        const ids = promoCode.specialityOrDoctorData.split(',').map(id => parseInt(id.trim()));
        return ids.includes(subscriptionId);
    }

    private async getAppointmentCount(promoCodeId: number): Promise<number> {
        return this.promoCodeRepository.getPromoCodeAppointmentCount(promoCodeId);
    }

    private async getSubscriptionCount(promoCodeId: number): Promise<number> {
        // Implement subscription count logic if needed
        // For now, returning 0 as subscriptions table relationship is not defined
        return 0;
    }

    async markPromoCodeAsUsed(promoCodeId: number): Promise<void> {
        const promoCode = await this.promoCodeRepository.findOne({ where: { id: promoCodeId } });

        if (promoCode && promoCode.validity === PromoCodeValidity.ONETIME) {
            await this.promoCodeRepository.update(promoCodeId, {
                claimedAt: new Date()
            });
        }
    }

    async getPromoCodeById(id: number): Promise<PromoCode | null> {
        return this.promoCodeRepository.findOne({ where: { id } });
    }

    async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
        return this.promoCodeRepository.findOne({ where: { code } });
    }
}
