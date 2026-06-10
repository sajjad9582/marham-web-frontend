// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctor_experiences')
export class DoctorExperience {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'dID' })
    doctorId: number;

    @Column({ length: 100, nullable: true })
    designation: string;

    @Column({ nullable: true })
    institute: string;

    @Column({ default: 0 })
    years: number;

    @Column({ name: 'year_from', length: 50, nullable: true })
    yearFrom: string;

    @Column({ name: 'year_to', length: 50, nullable: true })
    yearTo: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

