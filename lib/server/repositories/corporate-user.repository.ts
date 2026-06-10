// @ts-nocheck
import { DataSource, Repository } from 'typeorm';
import { CorporateUser } from '@/lib/server/entities';
import { CorporateUserData } from '@/lib/server/interfaces/corporate-user-data.interface';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class CorporateUserRepository extends BaseRepository<CorporateUser> {
    constructor(private dataSource: DataSource) {
        super(CorporateUser, dataSource.createEntityManager());
    }

    async findLatestByUserId(userId: number) {
        return this.findOne({
            where: { userId },
            order: { id: 'DESC' },
        });
    }

    createCorporateUser(data: CorporateUserData): CorporateUser {
        const { userId, corporateId, packageId, corporateCompany, corporatePackage } = data;

        const corporateUserData = {
            userId,
            corporateId,
            paymentMode: corporateCompany.paymentMode,
            bookingProcess: corporateCompany.bookingProcess,
            appointment: corporateCompany.appointment,
            appointmentDiscountPercentage: corporateCompany.appointmentDiscountPercentage,
            videoConsultation: corporateCompany.videoConsultation,
            videoConsultationDiscountPercentage: corporateCompany.videoConsultationDiscountPercentage,
            callNow: corporateCompany.callNow,
            callNowDiscountPercentage: corporateCompany.callNowDiscountPercentage,
            labPortal: corporateCompany.labPortal,
            labPortalDiscountPercentage: corporateCompany.labPortalDiscountPercentage,
            medicinePortal: corporateCompany.medicinePortal,
            medicinePortalDiscountPercentage: corporateCompany.medicinePortalDiscountPercentage,
            surgery: corporateCompany.surgery,
            surgeryDiscountPercentage: corporateCompany.surgeryDiscountPercentage,
            hospital: corporateCompany.hospital,
            hospitalDiscountPercentage: corporateCompany.hospitalDiscountPercentage,
            maxLimit: corporatePackage.maxLimit,
            corporatePackageId: packageId,
            isSubscriptionMode: 1,
            isActive: 0,
            remainingConsultations: corporatePackage.noOfConsultations,
            noOfConsultations: corporatePackage.noOfConsultations,
            packageName: corporatePackage.packageName,
            insuranceCode: '0',
            updatedBy: userId,
            createdAt: new Date(),
        };

        return this.create(corporateUserData);
    }
}
