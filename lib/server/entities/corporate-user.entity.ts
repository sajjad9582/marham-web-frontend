// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('corporate_users')
export class CorporateUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int', default: 0 })
    userId: number;

    @Column({ name: 'corporate_id', default: 0 })
    corporateId: number;

    @Column({ type: 'varchar', nullable: true })
    code: string | null;

    @Column({ type: 'varchar', nullable: true })
    department: string | null;

    @Column({ type: 'varchar', nullable: true })
    designation: string | null;

    @Column({ name: 'payment_mode', default: 0 })
    paymentMode: number;

    @Column({ name: 'booking_process', default: 0 })
    bookingProcess: number;

    @Column({ default: 0 })
    appointment: number;

    @Column({ name: 'appointment_discount_percentage', default: 0 })
    appointmentDiscountPercentage: number;

    @Column({ name: 'video_consultation', default: 0 })
    videoConsultation: number;

    @Column({ name: 'video_consultation_discount_percentage', default: 0 })
    videoConsultationDiscountPercentage: number;

    @Column({ name: 'call_now', default: 0 })
    callNow: number;

    @Column({ name: 'call_now_discount_percentage', default: 0 })
    callNowDiscountPercentage: number;

    @Column({ name: 'lab_portal', default: 0 })
    labPortal: number;

    @Column({ name: 'lab_portal_discount_percentage', default: 0 })
    labPortalDiscountPercentage: number;

    @Column({ name: 'medicine_portal', default: 0 })
    medicinePortal: number;

    @Column({ name: 'medicine_portal_discount_percentage', default: 0 })
    medicinePortalDiscountPercentage: number;

    @Column({ default: 0 })
    surgery: number;

    @Column({ name: 'surgery_discount_percentage', default: 0 })
    surgeryDiscountPercentage: number;

    @Column({ default: 0 })
    hospital: number;

    @Column({ name: 'hospital_discount_percentage', default: 0 })
    hospitalDiscountPercentage: number;

    @Column({ name: 'max_limit', type: 'float', default: 0 })
    maxLimit: number;

    @Column({ name: 'opd_max_limit', default: 0 })
    opdMaxLimit: number;

    @Column({ name: 'corporate_package_id', default: 0 })
    corporatePackageId: number;

    @Column({ name: 'is_subscription_mode', default: 0 })
    isSubscriptionMode: number;

    @Column({ name: 'is_active', default: 0 })
    isActive: number;

    @Column({ name: 'remaining_consultations', default: 0 })
    remainingConsultations: number;

    @Column({ name: 'no_of_consultations', default: 0 })
    noOfConsultations: number;

    @Column({ name: 'package_name', nullable: true })
    packageName: string;

    @Column({ name: 'insurance_code', nullable: true })
    insuranceCode: string;

    @Column({ name: 'updated_by', default: 0 })
    updatedBy: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}

