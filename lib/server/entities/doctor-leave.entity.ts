// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { LeaveReasonType } from '@/lib/server/enums/leave-reason-type.enum';

@Entity('doctor_leaves')
@Index('idx_dates', ['leaveFrom', 'leaveTo'])
export class DoctorLeave {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ name: 'doctor_id' })
    @Index('idx_doctor_id')
    doctorId: number;

    @ManyToOne('Doctor')
    @JoinColumn({ name: 'doctor_id' })
    doctor: unknown;

    @Column({ name: 'hospital_id' })
    @Index('idx_hospital_id')
    hospitalId: number;

    @Column({ name: 'leave_from', type: 'date' })
    leaveFrom: Date;

    @Column({ name: 'leave_to', type: 'date' })
    leaveTo: Date;

    @Column({ length: 500, nullable: true })
    reason: string;

    @Column({ name: 'reason_type', type: 'tinyint', enum: LeaveReasonType, nullable: true })
    reasonType: LeaveReasonType;

    @Column({ name: 'created_by', default: 0 })
    createdBy: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    @Index('idx_deleted_at')
    deletedAt: Date;
}

