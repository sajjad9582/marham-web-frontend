// @ts-nocheck
import { DataSource, In, Between, MoreThanOrEqual, Brackets } from 'typeorm';
import { PatientAppointment } from '@/lib/server/entities';
import { AppointmentStatus } from '@/lib/server/enums/appointment-status.enum';
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import { selectFields } from '@/lib/server/utils/select-fields';
import { FindUserAppointmentsParams } from '@/lib/server/interfaces/find-user-appointments-params.interface';

export class AppointmentRepository extends BaseRepository<PatientAppointment> {
    constructor(private dataSource: DataSource) {
        super(PatientAppointment, dataSource.createEntityManager());
    }

    async findUserAppointments(params: FindUserAppointmentsParams) {
        const query = this.createQueryBuilder('appointment')
            .select([
                'appointment.id',
                'appointment.doctorId',
                'appointment.userId',
                'appointment.doctorName',
                'appointment.hospitalId',
                'appointment.hospitalName',
                'appointment.specialityId',
                'appointment.patientName',
                'appointment.patientPhone',
                'appointment.patientAge',
                'appointment.date',
                'appointment.time',
                'appointment.fee',
                'appointment.appointmentType',
                'appointment.createdAt',
                'appointment.paymentReceived',
                'appointment.prescriptionAdded',
                'appointment.referralAmount',
                'appointment.doctorReferralAmount',
                'appointment.appointmentStatus',
                'appointment.isCommutable',
                'appointment.showedupAt',
                'appointment.discount'
            ])
            .leftJoinAndSelect('appointment.statusDetail', 'statusDetail')
            .leftJoinAndSelect('appointment.subStatusDetail', 'subStatusDetail')
            .leftJoinAndSelect('appointment.onlineConsultation', 'onlineConsultation')
            .leftJoinAndSelect('appointment.hospital', 'hospital')
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .leftJoinAndSelect('appointment.doctorListing', 'doctorListing')
            .where('appointment.appointmentStatus IN (:...statuses)', {
                statuses: [
                    AppointmentStatus.IN_PROCESS,
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CANCELLED,
                    AppointmentStatus.SHOWED_UP
                ]
            });

        if (params.doctorId) {
            query.andWhere('appointment.doctorId = :doctorId', { doctorId: params.doctorId });
        }

        if (params.date) {
            query.andWhere('appointment.date = :date', { date: params.date });
        }

        if (params.appointmentType && params.appointmentType > 0) {
            query.andWhere('appointment.appointmentType = :appointmentType', { appointmentType: params.appointmentType });
        }

        if (params.appointmentStatuses && params.appointmentStatuses.length > 0) {
            query.andWhere('appointment.appointmentStatus IN (:...statuses)', { statuses: params.appointmentStatuses });
        }

        if (params.upcomingDateTime) {
            query.andWhere('CONCAT(appointment.date, " ", appointment.time) >= :now', {
                now: `${params.upcomingDateTime}`
            });
        }

        if (params.userId) {
            query.andWhere(new Brackets((qb) => {
                qb.where('appointment.userId = :userId', { userId: params.userId });
                // .orWhere('appointment.addedBy = :userId', { userId: params.userId });
            }));
        }

        if (params.upcomingDateTime) {
            query.orderBy('appointment.date', 'ASC').addOrderBy('appointment.time', 'ASC');
        } else {
            query.orderBy('appointment.date', 'DESC').addOrderBy('appointment.time', 'DESC');
        }

        query.skip(params.skip)
            .take(params.limit);

        return query.getManyAndCount();
    }

    /**
     * Count appointments for a specific doctor, hospital, date and time slot
     * Used for checking slot availability
     * Only counts appointments with IN_PROCESS, SCHEDULED, or SHOWED_UP status
     */
    async countAppointmentsForSlot(
        doctorId: number,
        hospitalId: number,
        date: string,
        timeSlot: number
    ): Promise<number> {
        // Convert timeSlot number (e.g., 1430) to time string (e.g., '14:30:00')
        const hours = Math.floor(timeSlot / 100);
        const minutes = timeSlot % 100;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

        return await this.count({
            where: {
                doctorId: doctorId,
                hospitalId: hospitalId,
                date: date as any,
                time: timeString,
                appointmentStatus: In([
                    AppointmentStatus.IN_PROCESS,
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.SHOWED_UP
                ]),
            }
        });
    }

    /**
     * Get all booked time slots for a specific doctor, hospital, and date
     * Returns a Set of booked time slots (e.g., 1430, 1500, etc.)
     * Only includes appointments with IN_PROCESS, SCHEDULED, or SHOWED_UP status
     */
    async getBookedTimeSlotsForDate(
        doctorId: number,
        hospitalId: number,
        date: string
    ): Promise<Set<number>> {
        const appointments = await this.find({
            where: {
                doctorId: doctorId,
                hospitalId: hospitalId,
                date: date as any,
                appointmentStatus: In([
                    AppointmentStatus.IN_PROCESS,
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.SHOWED_UP
                ]),
            },
            select: selectFields(['time'])
        });

        // Convert time strings to time slot numbers
        const bookedSlots = new Set<number>();
        appointments.forEach(appointment => {
            if (appointment.time) {
                // Parse time string (e.g., '14:30:00') to time slot number (e.g., 1430)
                const [hours, minutes] = appointment.time.split(':').map(Number);
                const timeSlot = hours * 100 + minutes;
                bookedSlots.add(timeSlot);
            }
        });

        return bookedSlots;
    }

    /**
     * Get all booked time slots for multiple dates at once
     * Returns a Map where key is the date string and value is a Set of booked time slots
     * Only includes appointments with IN_PROCESS, SCHEDULED, or SHOWED_UP status
     */
    async getBookedTimeSlotsForDates(
        doctorId: number,
        hospitalId: number,
        dates: string[]
    ): Promise<Map<string, Set<number>>> {
        if (dates.length === 0) {
            return new Map();
        }

        const appointments = await this.find({
            where: {
                doctorId: doctorId,
                hospitalId: hospitalId,
                date: In(dates) as any,
                appointmentStatus: In([
                    AppointmentStatus.IN_PROCESS,
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.SHOWED_UP
                ]),
            },
            select: selectFields(['date', 'time'])
        });

        // Group by date and convert time strings to time slot numbers
        const bookedSlotsByDate = new Map<string, Set<number>>();

        // Initialize empty sets for all dates
        dates.forEach(date => {
            bookedSlotsByDate.set(date, new Set<number>());
        });

        // Populate with booked slots
        appointments.forEach(appointment => {
            if (appointment.date && appointment.time) {
                const dateStr = typeof appointment.date === 'string'
                    ? appointment.date
                    : appointment.date.toISOString().split('T')[0];

                // Parse time string (e.g., '14:30:00') to time slot number (e.g., 1430)
                const [hours, minutes] = appointment.time.split(':').map(Number);
                const timeSlot = hours * 100 + minutes;

                const slotsForDate = bookedSlotsByDate.get(dateStr);
                if (slotsForDate) {
                    slotsForDate.add(timeSlot);
                }
            }
        });

        return bookedSlotsByDate;
    }

    async findConflictingAppointments(doctorId: number, hospitalId: number | null, startDate: string, endDate: string) {
        const query = this.createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.statusDetail', 'statusDetail')
            .leftJoinAndSelect('appointment.subStatusDetail', 'subStatusDetail')
            .leftJoinAndSelect('appointment.onlineConsultation', 'onlineConsultation')
            .leftJoinAndSelect('appointment.hospital', 'hospital')
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .leftJoinAndSelect('appointment.doctorListing', 'doctorListing')
            .where('appointment.doctorId = :doctorId', { doctorId })
            .andWhere('appointment.appointmentStatus IN (:...statuses)', {
                statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROCESS]
            })
            .andWhere('appointment.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });

        if (hospitalId) {
            query.andWhere('appointment.hospitalId = :hospitalId', { hospitalId });
        }

        return query.getMany();
    }

    // async getPriorityAppointments(doctorId: number, date: string) {
    //     return this.createQueryBuilder('appointment')
    //         .leftJoinAndSelect('appointment.statusDetail', 'statusDetail')
    //         .leftJoinAndSelect('appointment.subStatusDetail', 'subStatusDetail')
    //         .leftJoinAndSelect('appointment.onlineConsultation', 'onlineConsultation')
    //         .leftJoinAndSelect('appointment.doctor', 'doctor')
    //         .where('appointment.doctorId = :doctorId', { doctorId })
    //         .andWhere('appointment.date = :date', { date })
    //         .andWhere('appointment.appointmentStatus IN (:...statuses)', { statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROCESS] })
    //         .orderBy('appointment.time', 'ASC')
    //         .getMany();
    // }

    // async countTodayAppointments(doctorId: number, date: string): Promise<number> {
    //     return this.count({
    //         where: {
    //             doctorId: doctorId,
    //             date: date as any,
    //             appointmentStatus: AppointmentStatus.SCHEDULED
    //         }
    //     });
    // }

    // async countPendingConfirmations(doctorId: number): Promise<number> {
    //     return this.count({
    //         where: {
    //             doctorId: doctorId,
    //             appointmentStatus: AppointmentStatus.IN_PROCESS
    //         }
    //     });
    // }

    async getDoctorAccountBalance(doctorId: number, monthStart: Date, monthEnd: Date): Promise<number> {
        const result = await this.createQueryBuilder('appointment')
            .select('SUM(appointment.doctorReferralAmount)', 'sum')
            .where('appointment.doctorId = :doctorId', { doctorId })
            .andWhere('appointment.appointmentStatus = :status', { status: AppointmentStatus.SHOWED_UP })
            .andWhere(
                '(appointment.date BETWEEN :monthStart AND :monthEnd OR (appointment.date < :monthStart AND appointment.showedupAt BETWEEN :monthStart AND :monthEnd))',
                { monthStart, monthEnd }
            )
            .getRawOne();
        return result && result.sum ? parseFloat(result.sum) : 0;
    }

    async findForPaymentValidation(id: bigint, userId: number): Promise<PatientAppointment | null> {
        return this.findOne({
            where: [
                { id: id, userId: userId },
                { id: id, addedBy: userId }
            ],
            select: selectFields(['id', 'fee', 'paymentReceived', 'appointmentStatus'])
        });
    }

    async hasDuplicateProcessAppointment(phone: string, doctorId: number, date: any): Promise<boolean> {
        const count = await this.createQueryBuilder('appointment')
            .where('appointment.patientPhone = :phone', { phone })
            .andWhere('appointment.doctorId = :doctorId', { doctorId })
            .andWhere('appointment.appointmentStatus = :status', { status: AppointmentStatus.IN_PROCESS })
            .andWhere('CONCAT(appointment.date, " ", appointment.time) > NOW()')
            .getCount();

        return count >= 2;
    }

    async findLatestInProcessAppointment(userId: number, doctorId: number): Promise<PatientAppointment | null> {
        const today = new Date();
        today.setMinutes(today.getMinutes() - 5);

        return this.findOne({
            where: {
                userId: userId,
                doctorId: doctorId,
                appointmentStatus: AppointmentStatus.IN_PROCESS,
                paymentReceived: 0,
                createdAt: MoreThanOrEqual(today)
            },
            order: { createdAt: 'DESC' }
        });
    }

    async isFollowUpPatient(phone: string, doctorId: number, startDate: Date, endDate: Date): Promise<boolean> {
        const count = await this.count({
            where: {
                patientPhone: phone,
                doctorId: doctorId,
                appointmentStatus: In([AppointmentStatus.SCHEDULED, AppointmentStatus.SHOWED_UP]),
                date: Between(startDate as any, endDate as any) as any
            }
        });
        return count > 0;
    }

    async getLastFlApptId(hospitalId: number): Promise<number> {
        const lastAppointment = await this.createQueryBuilder('appointment')
            .where('appointment.hospitalId = :hospitalId', { hospitalId })
            .orderBy('appointment.flApptId', 'DESC')
            .select('appointment.flApptId')
            .limit(1)
            .getOne();

        return lastAppointment?.flApptId ? lastAppointment.flApptId : 0;
    }

    async createAppointment(data: Partial<PatientAppointment>): Promise<PatientAppointment> {
        const appointment = this.create(data);
        const savedAppointment = await this.save(appointment);
        return savedAppointment;
    }

    async findOneDetailed(id: bigint): Promise<PatientAppointment | null> {
        return this.findOne({
            where: { id },
            relations: ['statusDetail', 'subStatusDetail', 'onlineConsultation', 'doctor', 'hospital', 'doctorListing'],
            select: selectFields([
                'id',
                'doctorId',
                'doctorName',
                'hospitalId',
                'hospitalName',
                'specialityId',
                'patientId',
                'patientName',
                'patientPhone',
                'patientAge',
                'date',
                'time',
                'fee',
                'appointmentType',
                'consultantNotes',
                'consultantPlan',
                'investigationNotes',
                'treatmentPlan',
                'createdAt',
                'userId',
                'addedBy',
                'isDirectBooking',
                'paymentReceived',
                'isCommutable',
                'appointmentStatus',
                'showedupAt',
                'discount'
            ])
        });
    }

    async findOneComplete(id: bigint): Promise<PatientAppointment | null> {
        return this.findOne({
            where: { id },
            relations: ['statusDetail', 'subStatusDetail', 'onlineConsultation', 'doctor', 'hospital', 'doctorListing']
        });
    }

    async findWithPrescriptionRelations(id: bigint): Promise<PatientAppointment | null> {
        return this.findOne({
            where: { id },
            relations: [
                'medicineList',
                'testList',
                'testList.laboratory',
                'fileList'
            ]
        });
    }

    async getUpcomingAppointmentsCount(userId: number, currentDate: string, currentTime: string): Promise<number> {
        return await this.createQueryBuilder('appointment')
            .where('appointment.userId = :userId', { userId })
            .andWhere('appointment.appointmentStatus IN (:...statuses)', {
                statuses: [
                    AppointmentStatus.IN_PROCESS,
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.SHOWED_UP
                ]
            })
            .andWhere('CONCAT(appointment.date, " ", appointment.time) >= :now', {
                now: `${currentDate} ${currentTime}`
            })
            .getCount();
    }

    async getUpcomingAppointments(userId: number, currentDate: string, currentTime: string, limit: number = 10, appointmentStatuses: any = []): Promise<PatientAppointment[]> {
        const [appointments] = await this.findUserAppointments({
            userId,
            skip: 0,
            limit,
            upcomingDateTime: `${currentDate} ${currentTime}`,
            appointmentStatuses
        });

        return appointments;
    }

    async countAppointmentsByPromoCode(promoCodeId: bigint): Promise<number> {
        return this.count({
            where: {
                promoCodeId: String(promoCodeId)
            }
        });
    }

    async markAppointmentAsDoctorNotShowedUp(appointmentId: bigint, userId: number, updatedBy: number): Promise<boolean> {
        const result = await this.update(
            { id: appointmentId, userId },
            {
                appointmentStatus: AppointmentStatus.PATIENT_NOT_SHOWED_UP,
                updatedBy: updatedBy,
                updatedAt: new Date()
            }
        )
        return (result.affected ?? 0) > 0;;
    }

    async toggleIsCommutable(appointmentId: bigint, isCommutable: boolean): Promise<PatientAppointment | null> {
        await this.update(
            { id: appointmentId },
            { isCommutable }
        );
        return this.findOne({ where: { id: appointmentId } });
    }

    async updateWalletDetails(appointmentId: bigint, walletAmount: number, walletAmountDetail: any, updatedBy: number): Promise<void> {
        await this.update(
            { id: appointmentId },
            { walletAmount, walletAmountDetail, updatedBy }
        );
    }
}