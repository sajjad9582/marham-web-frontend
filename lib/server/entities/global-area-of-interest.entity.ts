// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('global_areas_of_interest')
export class GlobalAreaOfInterest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    title: string;

    @Column({ name: 'speciality_id', default: 0 })
    specialityId: number;

    @Column({ name: 'sub_speciality_id', default: 0 })
    subSpecialityId: number;

    @Column({ name: 'doctor_id', default: 0 })
    doctorId: number;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @Column({ name: 'updated_at', nullable: true })
    updatedAt: number;
}

