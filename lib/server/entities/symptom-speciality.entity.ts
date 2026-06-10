// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('symptom_specialities')
export class SymptomSpeciality {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ name: 'symptom_id' })
    symptomId: number;

    @Column({ name: 'speciality_id' })
    specialityId: number;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @ManyToOne('Symptom', 'specialities')
    @JoinColumn({ name: 'symptom_id' })
    symptom: unknown;

    @ManyToOne('Speciality', 'specialities')
    @JoinColumn({ name: 'speciality_id' })
    speciality: unknown;
}

