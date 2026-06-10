// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('online_consultations')
export class OnlineConsultation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'appointment_id', type: 'bigint' })
    appointmentId: bigint;

    @OneToOne('PatientAppointment')
    @JoinColumn({ name: 'appointment_id', referencedColumnName: 'id' })
    appointment: unknown;

    @Column({ name: 'appointment_date', type: 'date', nullable: true })
    appointmentDate: Date;

    @Column({ name: 'appointment_time', type: 'time', nullable: true })
    appointmentTime: string;

    @Column({ name: 'user_id', type: 'int', default: 0 })
    userId: number;

    @Column({ name: 'patient_id', type: 'int', default: 0 })
    patientId: number;

    @Column({ name: 'patient_name', nullable: true })
    patientName: string;

    @Column({ name: 'patient_email', nullable: true })
    patientEmail: string;

    @Column({ name: 'patient_phone', nullable: true })
    patientPhone: string;

    @Column({ name: 'doctor_id', type: 'int', default: 0 })
    doctorId: number;

    @Column({ name: 'doctor_name', nullable: true })
    doctorName: string;

    @Column({ name: 'doctor_email', nullable: true })
    doctorEmail: string;

    @Column({ name: 'doctor_phone', nullable: true })
    doctorPhone: string;

    @Column({ name: 'requested_speciality_id', type: 'int', default: 0 })
    requestedSpecialityId: number;

    @Column({ type: 'longtext', nullable: true })
    problem: string;

    @Column({ type: 'longtext', nullable: true })
    notes: string;

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    @Column({ name: 'program_id', type: 'int', default: 0 })
    programId: number;

    @Column({ name: 'payment_id', type: 'int', default: 0 })
    paymentId: number;

    @Column({ name: 'payment_method_id', type: 'tinyint', width: 1, default: 0 })
    paymentMethodId: number;

    @Column({ name: 'payment_status', type: 'tinyint', width: 1, default: 0 })
    paymentStatus: number;

    @Column({ name: 'payment_evidence', length: 50, nullable: true })
    paymentEvidence: string;

    @Column({ name: 'payment_evidence_message', type: 'text', nullable: true })
    paymentEvidenceMessage: string;

    @Column({ name: 'amount', type: 'float', default: 0 })
    fee: number;

    @Column({ name: 'appointment_status', type: 'int', default: 1 })
    appointmentStatus: number;

    @Column({ name: 'appointment_sub_status', type: 'int', default: 1 })
    appointmentSubStatus: number;

    @Column({ name: 'patient_arrived_at', type: 'timestamp', nullable: true })
    patientArrivedAt: Date;

    @Column({ name: 'doctor_arrived_at', type: 'timestamp', nullable: true })
    doctorArrivedAt: Date;

    @Column({ name: 'app_type', type: 'tinyint', width: 1, default: 0 })
    appType: number;

    @Column({ name: 'device_type', type: 'tinyint', width: 1, default: 0 })
    deviceType: number;

    @Column({ name: 'patient_last_seen_at', type: 'timestamp', nullable: true })
    patientLastSeenAt: Date;

    @Column({ name: 'patient_live_stream_last_seen_at', type: 'timestamp', nullable: true })
    patientLiveStreamLastSeenAt: Date;

    @Column({ name: 'doctor_last_seen_at', type: 'timestamp', nullable: true })
    doctorLastSeenAt: Date;

    @Column({ name: 'doctor_live_stream_last_seen_at', type: 'timestamp', nullable: true })
    doctorLiveStreamLastSeenAt: Date;

    @Column({ name: 'prescription_sent_at', type: 'timestamp', nullable: true })
    prescriptionSentAt: Date;

    @Column({ name: 'promo_code', type: 'varchar', length: 50, nullable: true })
    promoCode: string | null;

    @Column({ name: 'is_free', type: 'tinyint', width: 1, default: 0 })
    isFree: boolean;

    @Column({ name: 'is_referred', type: 'tinyint', width: 1, default: 0 })
    isReferred: boolean;

    @Column({ name: 'is_promotional', type: 'tinyint', width: 1, default: 0 })
    isPromotional: boolean;

    @Column({ name: 'promotional_for', type: 'bigint', default: 0 })
    promotionalFor: string;

    @Column({ name: 'referred_by', type: 'int', default: 0 })
    referredBy: number;

    @Column({ name: 'referred_to', type: 'int', default: 0 })
    referredTo: number;

    @Column({ name: 'referred_speciality_id', type: 'int', default: 0 })
    referredSpecialityId: number;

    @Column({ name: 'lead_source_id', type: 'int', default: 1 })
    leadSourceId: number;

    @Column({ length: 50, nullable: true })
    uuid: string;

    @Column({ name: 'visitor_source', nullable: true })
    visitorSource: string;

    @Column({ name: 'utm_source', nullable: true })
    utmSource: string;

    @Column({ name: 'utm_medium', nullable: true })
    utmMedium: string;

    @Column({ name: 'utm_campaign', nullable: true })
    utmCampaign: string;

    @Column({ name: 'ip_address', length: 50, nullable: true })
    ipAddress: string;

    @Column({ name: 'added_by', type: 'int', default: 0 })
    addedBy: number;

    @Column({ name: 'showed_up_via', type: 'tinyint', width: 1, default: 0 })
    showedUpVia: number;

    @Column({ name: 'is_call_my_doctor', type: 'tinyint', width: 1, default: 0 })
    isCallMyDoctor: boolean;

    @Column({ name: 'is_roche_appointment', type: 'tinyint', width: 1, default: 0 })
    isRocheAppointment: boolean;

    @Column({ name: 'roche_questionnaire', type: 'longtext', nullable: true })
    rocheQuestionnaire: string;

    @Column({ name: 'is_obesity_clinic_request', type: 'tinyint', default: 0 })
    isObesityClinicRequest: number;

    @Column({ name: 'payment_pending_marked_at', type: 'timestamp', nullable: true })
    paymentPendingMarkedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}

