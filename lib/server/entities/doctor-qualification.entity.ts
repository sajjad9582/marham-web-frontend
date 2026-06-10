// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctor_qualifications')
export class DoctorQualification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'dID' })
    doctorId: number;

    @Column({ name: 'institute', nullable: true })
    institute?: string;

    @Column({ name: 'qualification' })
    qualification: string;

    @Column({ name: 'year_from', type: 'date', nullable: true })
    yearFrom?: Date | null;

    @Column({ name: 'year_to', type: 'date', nullable: true })
    yearTo?: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'status', default: 0 })
    status: number;

    // @Column({ name: 'document', nullable: true })
    // document?: string;
}

