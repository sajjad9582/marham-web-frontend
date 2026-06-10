import { DataSource } from 'typeorm';
import { DoctorLeave } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import { LeaveReasonType } from '@/lib/server/enums/leave-reason-type.enum';

export class DoctorLeaveRepository extends BaseRepository<DoctorLeave> {
    constructor(private dataSource: DataSource) {
        super(DoctorLeave, dataSource.createEntityManager());
    }

    async saveDoctorLeave(doctorId: number, hospitalId: number, startDate: string, endDate: string, reason: string, createdBy: number): Promise<DoctorLeave> {
        const leave = this.create({
            doctorId,
            hospitalId,
            leaveFrom: startDate as any,
            leaveTo: endDate as any,
            reason: reason,
            reasonType: this.getReasonType(reason),
            createdBy: createdBy
        });
        return await this.save(leave);
    }

    private getReasonType(reason: string): LeaveReasonType {
        const reasonLower = reason.toLowerCase();
        if (reasonLower.includes('vacation')) return LeaveReasonType.VACATION;
        if (reasonLower.includes('sick')) return LeaveReasonType.SICK;
        if (reasonLower.includes('personal')) return LeaveReasonType.PERSONAL;
        if (reasonLower.includes('out of city') || reasonLower.includes('out of country')) return LeaveReasonType.OUT_OF_CITY_COUNTRY;
        if (reasonLower.includes('emergency')) return LeaveReasonType.EMERGENCY;
        if (reasonLower.includes('medical')) return LeaveReasonType.MEDICAL_ISSUE;
        if (reasonLower.includes('circumstances')) return LeaveReasonType.EXTERNAL_CIRCUMSTANCES;
        return LeaveReasonType.OTHER;
    }

    async deleteDoctorLeave(doctorId: number, hospitalId?: number): Promise<void> {
        const where: any = {
            doctorId,
        };

        if (hospitalId) {
            where.hospitalId = hospitalId;
        }

        await this.softDelete(where);
    }

    async findActiveLeavesByDoctorId(doctorId: number): Promise<DoctorLeave[]> {
        return await this.find({
            where: {
                doctorId,
            },
            order: {
                leaveFrom: 'ASC'
            }
        });
    }

    async findActiveLeavesByHospitalId(doctorId: number, hospitalId: number): Promise<DoctorLeave[]> {
        return await this.find({
            where: {
                doctorId,
                hospitalId
            },
            order: {
                leaveFrom: 'ASC'
            }
        });
    }

    async findLeaveById(id: number): Promise<DoctorLeave | null> {
        return await this.findOne({
            where: { id }
        });
    }
}
