// @ts-nocheck
import { DataSource, Not, IsNull } from 'typeorm';
import { DoctorListing, Doctor } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import { selectFields } from '@/lib/server/utils/select-fields';
import lodash from 'lodash';

const { isNull } = lodash;

export interface HospitalSearchParams {
    doctorIds: number[];
    city?: string;
    area?: string;
}

export class DoctorListingRepository extends BaseRepository<DoctorListing> {
    constructor(private dataSource: DataSource) {
        super(DoctorListing, dataSource.createEntityManager());
    }

    /**
     * Find hospital listings for doctors
     */
    async findHospitalsByDoctors(params: HospitalSearchParams): Promise<any[]> {
        const { doctorIds, city, area } = params;

        const hospitalQb = this.createQueryBuilder('listing')
            .leftJoin('listing.hospital', 'hospital')
            .select([
                'listing.id',
                'listing.doctorId',
                'listing.hospitalId',
                'listing.hospitalName',
                'listing.hospitalArea',
                'listing.hospitalCity',
                'listing.fee',
                'listing.isOnlinePaymentEnabled',
                'listing.discountFee',
                'listing.hospitalType',
                'hospital.lat',
                'hospital.lng',
                'hospital.locationVerifiedAt'
            ])
            .where('listing.dlID IN (:...doctorIds)', { doctorIds })
            .andWhere('listing.deleted_at IS NULL')
            .andWhere('listing.active_at IS NOT NULL')
            .andWhere('listing.inactive_at IS NULL');

        // Apply city/area filters if provided
        if (city) {
            hospitalQb.andWhere('listing.hospitalCity = :city', { city });
        }

        if (area) {
            hospitalQb.andWhere('listing.hospitalArea = :area', { area });
        }

        const results = await hospitalQb.getRawAndEntities();
        
        // Map results to include hospital data
        return results.entities.map((listing, index) => {
            const raw = results.raw[index];
            return {
                ...listing
            };
        });
    }

    /**
     * Find all ACTIVE hospital listings for a specific doctor
     */
    async getDoctorHospitals(doctorId: number): Promise<DoctorListing[]> {
        return await this.createQueryBuilder('listing')
            .leftJoin('listing.hospital', 'hospital')
            .where('listing.doctorId = :doctorId', { doctorId })
            .andWhere('listing.deletedAt IS NULL')
            .andWhere('listing.activeAt IS NOT NULL')
            .andWhere('listing.inactiveAt IS NULL')
            .select([
                'listing.id', 'listing.doctorId', 'listing.fee', 'listing.discountFee', 'listing.profilePic', 
                'listing.categoryName', 'listing.specialityId', 'listing.specialityName', 'listing.similarSpecialities', 
                'listing.monday', 'listing.tuesday', 'listing.wednesday', 'listing.thursday', 'listing.friday', 
                'listing.saturday', 'listing.sunday', 'listing.startTime', 'listing.endTime', 'listing.onCall', 
                'listing.hospitalId', 'listing.hospitalName', 'listing.hospitalAddress', 'listing.hospitalArea', 
                'listing.hospitalCity', 'listing.lat', 'listing.lng', 'listing.hospitalType', 
                'listing.averageWaitingTime', 'listing.averageAppointmentTime', 'listing.diagnosisScore', 
                'listing.staffScore', 'listing.directBooking', 'listing.isOnlinePaymentEnabled', 
                'listing.isOnlinePaymentCompulsory', 'listing.onLeave', 'listing.onLeaveFrom', 
                'listing.onLeaveTo', 'listing.leaveNotes',
                'hospital.id', 'hospital.locationVerifiedAt'
            ])
            .groupBy('listing.id')
            .orderBy('listing.hospitalType', 'DESC')
            .addOrderBy('listing.hospitalName', 'ASC')
            .getMany();
    }

    /**
     * Find all hospital venues for a specific doctor (including inactive, excluding non-payment ones)
     */
    async getDoctorVenues(doctorId: number): Promise<DoctorListing[]> {
        return await this.find({
            where: {
                doctorId: doctorId,
                deletedAt: IsNull(),
            },
            select: selectFields([
                'id', 'doctorId', 'fee', 'discountFee', 'profilePic', 'categoryName', 'specialityId',
                'specialityName', 'similarSpecialities', 'monday', 'tuesday', 'wednesday', 'thursday',
                'friday', 'saturday', 'sunday', 'startTime', 'endTime', 'onCall', 'hospitalId',
                'hospitalName', 'hospitalAddress', 'hospitalArea', 'hospitalCity', 'lat', 'lng',
                'hospitalType', 'averageWaitingTime', 'averageAppointmentTime', 'diagnosisScore',
                'staffScore', 'directBooking', 'isOnlinePaymentEnabled', 'isOnlinePaymentCompulsory',
                'onLeave', 'onLeaveFrom', 'onLeaveTo', 'leaveNotes', 'activeAt', 'inactiveAt', 'isInactiveByNonPayment'
            ]),
            order: {
                hospitalType: 'DESC',
                hospitalName: 'ASC'
            }
        });
    }

    /**
     * Get ALL doctor hospital listings for slot calculation
     * A doctor can have multiple listings at the same hospital with different schedules
     */
    async getDoctorHospitalListings(doctorId: number, hospitalId: number): Promise<DoctorListing[]> {
        return await this.find({
            where: {
                doctorId: doctorId,
                hospitalId: hospitalId,
                deletedAt: IsNull(),
                activeAt: Not(IsNull()),
                inactiveAt: IsNull(),
            },
            select: selectFields([
                'id', 'doctorId', 'hospitalId', 'hospitalName', 'fee', 'discountFee',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'startTime', 'endTime', 'onCall', 'nextSlot', 'averageTimePerPatient',
                'patientsPerHour', 'onLeave', 'onLeaveFrom', 'onLeaveTo', 'consultancyReferral'
            ]),
            order: {
                startTime: 'ASC'
            }
        });
    }

    /**
     * Clear leave for a doctor at a specific hospital
     */
    async clearDoctorLeave(doctorId: number, updatedBy: number, hospitalId?: number): Promise<void> {
        const where: any = {
            doctorId: doctorId,
            activeAt: Not(IsNull()),
            inactiveAt: IsNull(),
            deletedAt: IsNull()
        };

        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        await this.update(where, {
            onLeaveFrom: null,
            onLeaveTo: null,
            leaveNotes: null,
            onLeave: false,
            updatedBy: updatedBy
        });
    }

    /**
     * Save leave for a doctor (one or all hospitals)
     */
    async saveDoctorLeave(doctorId: number, startDate: string, endDate: string, reason: string, updatedBy: number, hospitalId?: number): Promise<void> {
        const updateData = {
            onLeaveFrom: startDate as any,
            onLeaveTo: endDate as any,
            leaveNotes: reason,
            onLeave: true,
            updatedBy: updatedBy
        };

        const where: any = {
            doctorId,
            activeAt: Not(IsNull()),
            inactiveAt: IsNull(),
            deletedAt: IsNull()
        };

        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        await this.update(where, updateData);
    }

    async findByDoctorAndHospitalId(doctorId: number, hospitalId: number) {
        return await this.findOne({
            where: {
                doctorId: doctorId,
                hospitalId: hospitalId,
                deletedAt: IsNull(),
                activeAt: Not(IsNull()),
                inactiveAt: IsNull()
            }
        });
    }

    /**
     * Create a new doctor location listing
     */
    async createDoctorLocation(doctorListing: Partial<DoctorListing>): Promise<DoctorListing> {
        const newListing = this.create(doctorListing);
        return await this.save(newListing);
    }

    /**
     * Find existing doctor listing to copy data from
     */
    async findExistingDoctorListing(doctorId: number): Promise<DoctorListing | null> {
        return await this.findOne({
            where: {
                doctorId: doctorId,
                deletedAt: IsNull(),
                activeAt: Not(IsNull()),
                inactiveAt: IsNull(),
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    /**
     * Get a specific doctor location listing
     */
    async getDoctorLocation(id: number, doctorId: number): Promise<DoctorListing | null> {
        return await this.findOne({
            where: {
                id: id,
                doctorId: doctorId,
                deletedAt: IsNull(),
            }
        });
    }

    /**
     * Count active locations for a doctor
     */
    async countActiveLocations(doctorId: number): Promise<number> {
        return await this.count({
            where: {
                doctorId: doctorId,
                deletedAt: IsNull(),
                inactiveAt: IsNull(),
                activeAt: Not(IsNull()),
            }
        });
    }

    /**
     * Update listing status
     */
    async updateStatus(id: number, userId: number, inactiveAt: Date | null): Promise<void> {
        await this.update(id, {
            inactiveAt: inactiveAt,
            updatedBy: userId,
        });
    }

    /**
     * Toggle direct booking status for a doctor location
     */
    async toggleDirectBooking(id: number, directBooking: boolean, notes: string | null, userId: number): Promise<void> {
        await this.update(id, {
            directBooking: directBooking,
            directBookingNotes: notes,
            updatedBy: userId,
        });
    }

    /**
     * Update doctor online/offline status in doctor_corporate_influx_shift_timings table
     */
    async updateDoctorOnlineStatus(doctorId: number, isOnline: boolean): Promise<void> {
        const onlineStatus = isOnline ? 1 : 0;
        await this.dataSource.query(
            'UPDATE doctor_corporate_influx_shift_timings SET is_online = ? WHERE doctor_id = ?',
            [onlineStatus, doctorId]
        );
    }

    /**
     * Get scheduler settings for a doctor (all hospitals or specific hospital)
     */
    async getSchedulerSettings(doctorId: number, hospitalId?: number): Promise<DoctorListing[]> {
        const where: any = {
            doctorId: doctorId,
            deletedAt: IsNull(),
            activeAt: Not(IsNull()),
            inactiveAt: IsNull(),
        };

        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        return await this.find({
            where,
            select: selectFields([
                'id', 'doctorId', 'hospitalId', 'hospitalName', 'averageTimePerPatient',
                'consultationTimingType', 'nextSlot', 'updatedAt'
            ]),
            order: {
                hospitalName: 'ASC'
            }
        });
    }

    /**
     * Update scheduler settings for a doctor (all hospitals or specific hospital)
     */
    async updateSchedulerSettings(
        doctorId: number,
        updateData: {
            averageTimePerPatient?: number;
            consultationTimingType?: number;
            nextSlot?: boolean;
        },
        hospitalId?: number,
        updatedBy?: number
    ): Promise<void> {
        const where: any = {
            doctorId: doctorId,
            deletedAt: IsNull(),
            activeAt: Not(IsNull()),
            inactiveAt: IsNull(),
        };

        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        const dataToUpdate: any = { ...updateData };

        console.log(`Data to Log is `, JSON.stringify(dataToUpdate));
        
        if (updatedBy) {
            dataToUpdate.updatedBy = updatedBy;
        }

        await this.update(where, dataToUpdate);
    }

}
