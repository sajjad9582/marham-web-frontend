// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';

@Entity('promo_codes')
export class PromoCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    code: string;

    @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
    companyName: string;

    @Column({ type: 'int', comment: '1=Lifetime, 2=Specific Time, 3=One Time' })
    validity: number;

    @Column({ name: 'valid_from', type: 'date', nullable: true })
    validFrom: Date;

    @Column({ name: 'valid_to', type: 'date', nullable: true })
    validTo: Date;

    @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2 })
    discountPercentage: number;

    @Column({ name: 'claimed_at', type: 'datetime', nullable: true })
    claimedAt: Date;

    @Column({ name: 'applicable_on', type: 'json', nullable: true })
    applicableOn: number[];

    @Column({ name: 'usage_count', type: 'int', default: 0 })
    usageCount: number;

    @Column({ name: 'is_speciality_or_doctor', type: 'int', nullable: true, comment: '1=Speciality, 2=Doctor' })
    isSpecialityOrDoctor: number;

    @Column({ name: 'speciality_or_doctor_data', type: 'text', nullable: true })
    specialityOrDoctorData: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @OneToMany('PatientAppointment', 'promoCode')
    appointments: unknown[];
}

