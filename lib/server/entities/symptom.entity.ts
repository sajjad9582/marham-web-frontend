// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';

@Entity('symptoms')
export class Symptom {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ name: 'urdu_name', nullable: true })
    urduName: string;

    @Column({ nullable: true })
    icon: string;

    @Index('symptoms_slug_index')
    @Column({ nullable: true })
    slug: string;

    @Column({ type: 'longtext' })
    seo: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @Index('symptoms_deleted_at_index')
    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;

    @OneToMany('SymptomCategory', 'symptom')
    symptomCategories: unknown[];

    @OneToMany('SymptomSpeciality', 'symptom')
    specialities: unknown[];
}

