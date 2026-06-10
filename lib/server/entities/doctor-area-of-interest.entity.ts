// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('doctor_areas_of_interest')
export class DoctorAreaOfInterest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'area_of_interest_id', default: 0 })
    areaOfInterestId: number;

    @Column({ name: 'doctor_id', default: 0 })
    doctorId: number;

    @Column({ name: 'is_scrapped', type: 'tinyint', nullable: true, default: 0 })
    isScrapped: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
    updatedAt: Date;

    @ManyToOne('Doctor', 'doctorAreasOfInterest')
    @JoinColumn({ name: 'doctor_id' })
    doctor: unknown;

    @ManyToOne('GlobalAreaOfInterest')
    @JoinColumn({ name: 'area_of_interest_id' })
    areaOfInterest: unknown;
}

