// @ts-nocheck
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, RelationId, OneToOne, OneToMany } from 'typeorm';

@Entity('patient_appointments')
export class PatientAppointment {
    @PrimaryColumn({ type: 'bigint' })
    id: bigint;

    @Column({ name: 'doctor_hospital_id', type: 'int', default: 0 })
    doctorHospitalId: number;

    @Column({ name: 'speciality_id', type: 'int', default: 0 })
    specialityId: number;

    @Column({ name: 'dID', type: 'int', default: 0 })
    doctorId: number;

    @Column({ name: 'doctor_name', nullable: true })
    doctorName: string;

    @Column({ name: 'doctor_phone', nullable: true, length: 100 })
    doctorPhone: string;

    @Column({ name: 'hospitalID', type: 'int', default: 0 })
    hospitalId: number;

    @Column({ type: 'int', default: 0 })
    fee: number;

    @Column({ name: 'promo_code_id', type: 'bigint', nullable: true, unsigned: true })
    promoCodeId: string | null;

    @Column({ type: 'longtext', nullable: true })
    notes: string;

    @Column({ name: 'user_id', type: 'int', default: 0 })
    userId: number;

    @Column({ name: 'patient_name', nullable: true })
    patientName: string;

    @Column({ name: 'patient_phone', nullable: true, length: 100 })
    patientPhone: string;

    @Column({ name: 'patient_age', type: 'float', default: 0 })
    patientAge: number;

    @Column({ type: 'date', nullable: true })
    date: Date;

    @Column({ type: 'time', nullable: true })
    time: string;

    @Column({ type: 'int', default: 0 })
    token: number;

    @Column({ type: 'int', default: 0 })
    day: number;

    @Column({ type: 'int', default: 0 })
    month: number;

    @Column({ type: 'int', default: 0 })
    year: number;

    @Column({ name: 'hospital_name', nullable: true })
    hospitalName: string;

    @Column({ name: 'patientID', type: 'int', default: 0 })
    patientId: number;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    approved: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    extra: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    cancelled: boolean;

    @Column({ name: 'time_passed', type: 'tinyint', width: 1, default: 0 })
    timePassed: boolean;

    @Column({ name: 'prescription_added', type: 'tinyint', width: 3, default: 0 })
    prescriptionAdded: number;

    @Column({ name: 'prescription_added_from', type: 'tinyint', width: 3, default: 0 })
    prescriptionAddedFrom: number;

    @Column({ name: 'cancelled_by_doctor', type: 'tinyint', width: 1, default: 0 })
    cancelledByDoctor: boolean;

    @Column({ name: 'cancelled_by_patient', type: 'tinyint', width: 1, default: 0 })
    cancelledByPatient: boolean;

    @Column({ name: 'payment_received', type: 'tinyint', width: 1, default: 0 })
    paymentReceived: number;

    @Column({ name: 'patient_appointment_consultant_notes', type: 'longtext', nullable: true })
    consultantNotes: string;

    @Column({ name: 'patient_appointment_consultant_plan', type: 'longtext', nullable: true })
    consultantPlan: string;

    @Column({ name: 'patient_appointment_investigation_notes', type: 'longtext', nullable: true })
    investigationNotes: string;

    @Column({ name: 'patient_appointment_history_notes', type: 'longtext', nullable: true })
    historyNotes: string;

    @Column({ name: 'patient_appointment_treatment_plan', type: 'longtext', nullable: true })
    treatmentPlan: string;

    @Column({ name: 'patient_appointment_tests', type: 'longtext', nullable: true })
    tests: string;

    @Column({ name: 'patient_appointment_instructions', type: 'longtext', nullable: true })
    instructions: string;

    @Column({ name: 'online_appointment', type: 'tinyint', width: 1, default: 0 })
    onlineAppointment: boolean;

    @Column({ name: 'department_id', type: 'int', default: 0 })
    departmentId: number;

    @Column({ name: 'patient_appointment_title', nullable: true })
    title: string;

    @Column({ name: 'patient_appointment_blood_pressure', nullable: true, length: 50 })
    bloodPressure: string;

    @Column({ name: 'patient_appointment_blood_sugar', type: 'float', default: 0 })
    bloodSugar: number;

    @Column({ name: 'patient_appointment_height', type: 'float', default: 0 })
    height: number;

    @Column({ name: 'patient_appointment_weight', type: 'float', default: 0 })
    weight: number;

    @Column({ name: 'patient_surgeries', nullable: true })
    patientSurgeries: string;

    @Column({ name: 'patient_medications', nullable: true })
    patientMedications: string;

    @Column({ name: 'patient_conditions', nullable: true })
    patientConditions: string;

    @Column({ name: 'patient_appointment_temperature', nullable: true, length: 100 })
    temperature: string;

    @Column({ name: 'patient_appointment_heart_rate', nullable: true, length: 100 })
    heartRate: string;

    @Column({ name: 'patient_appointment_spo2', nullable: true, length: 100 })
    spo2: string;

    @Column({ name: 'patient_appointment_pefr', nullable: true, length: 100 })
    pefr: string;

    @Column({ name: 'patient_appointment_ent', nullable: true, length: 100 })
    ent: string;

    @Column({ name: 'patient_appointment_chest', nullable: true, length: 100 })
    chest: string;

    @Column({ name: 'patient_city', nullable: true, length: 100 })
    patientCity: string;

    @Column({ name: 'patient_area', nullable: true, length: 100 })
    patientArea: string;

    @Column({ name: 'patient_disease', nullable: true, length: 100 })
    patientDisease: string;

    @Column({ name: 'patient_bmi', nullable: true })
    patientBmi: string;

    @Column({ name: 'patient_preferred_way_of_weightloss', nullable: true })
    patientPreferredWayOfWeightloss: string;

    @Column({ name: 'patient_desired_weight_loss', nullable: true })
    patientDesiredWeightLoss: string;

    @Column({ name: 'patient_time_to_lose_weight', nullable: true })
    patientTimeToLoseWeight: string;

    @Column({ name: 'patient_occupation', nullable: true })
    patientOccupation: string;

    @Column({ name: 'patient_marital_status', nullable: true })
    patientMaritalStatus: string;

    @Column({ name: 'patient_personal_history', type: 'longtext', nullable: true })
    patientPersonalHistory: string;

    @Column({ name: 'patient_systematic_history', type: 'longtext', nullable: true })
    patientSystematicHistory: string;

    @Column({ name: 'patient_surgical_history', type: 'longtext', nullable: true })
    patientSurgicalHistory: string;

    @Column({ name: 'patient_gyne_and_obs_history', type: 'longtext', nullable: true })
    patientGyneAndObsHistory: string;

    @Column({ name: 'patient_weightloss_options_tried_in_past', nullable: true })
    patientWeightlossOptionsTriedInPast: string;

    @Column({ name: 'patient_weightloss_options_tried_in_past_other', type: 'longtext', nullable: true })
    patientWeightlossOptionsTriedInPastOther: string;

    @Column({ name: 'patient_ever_allergic_to_medications', type: 'tinyint', width: 3, nullable: true })
    patientEverAllergicToMedications: number;

    @Column({ name: 'patient_ever_allergic_to_medications_other', type: 'longtext', nullable: true })
    patientEverAllergicToMedicationsOther: string;

    @Column({ name: 'patient_for_which_you_struggle', nullable: true })
    patientForWhichYouStruggle: string;

    @Column({ name: 'patient_for_which_you_struggle_other', type: 'longtext', nullable: true })
    patientForWhichYouStruggleOther: string;

    @Column({ name: 'patient_interested_in_medications', type: 'tinyint', width: 3, nullable: true })
    patientInterestedInMedications: number;

    @Column({ name: 'patient_interested_in_medications_other', type: 'longtext', nullable: true })
    patientInterestedInMedicationsOther: string;

    @Column({ name: 'fl_appt_id', type: 'int', default: 0 })
    flApptId: number;

    @Column({ name: 'appointment_probability', type: 'int', default: 2 })
    appointmentProbability: number;

    @Column({ name: 'appointment_status', type: 'int', default: 0 })
    appointmentStatus: number;

    @ManyToOne('AppointmentStatus', 'appointments')
    @JoinColumn({ name: 'appointment_status', referencedColumnName: 'value' })
    statusDetail: unknown;

    @Column({ name: 'appointment_sub_status', type: 'int', default: 0 })
    appointmentSubStatus: number;

    @ManyToOne('AppointmentSubStatus', 'appointments')
    @JoinColumn({ name: 'appointment_sub_status', referencedColumnName: 'value' })
    subStatusDetail: unknown;

    @Column({ name: 'message_to_patient', type: 'tinyint', width: 3, default: 0 })
    messageToPatient: number;

    @Column({ name: 'message_to_doctor', type: 'tinyint', width: 3, default: 0 })
    messageToDoctor: number;

    @Column({ name: 'message_to_assistant', type: 'tinyint', width: 3, default: 0 })
    messageToAssistant: number;

    @Column({ name: 'voice_message_to_patient', type: 'tinyint', width: 3, default: 0 })
    voiceMessageToPatient: number;

    @Column({ name: 'referral_amount', type: 'float', default: 0 })
    referralAmount: number;

    @Column({ name: 'doctor_referral_amount', type: 'int', default: 0 })
    doctorReferralAmount: number;

    @Column({ name: 'consultancy_referral', type: 'int', default: 0 })
    consultancyReferral: number;

    @Column({ name: 'consultancy_fee_referral_on', type: 'int', default: 1 })
    consultancyFeeReferralOn: number;

    @Column({ name: 'doctor_fee', type: 'int', default: 0 })
    doctorFee: number;

    @Column({ name: 'doctor_fee_after_hospital_share', type: 'int', default: 0 })
    doctorFeeAfterHospitalShare: number;

    @Column({ name: 'referred_share_percentage', type: 'int', default: 0 })
    referredSharePercentage: number;

    @Column({ name: 'referred_share_amount', type: 'int', default: 0 })
    referredShareAmount: number;

    @Column({ name: 'referred_speciality_id', type: 'int', default: 0 })
    referredSpecialityId: number;

    @Column({ name: 'corrected_referral_amount', type: 'decimal', precision: 10, scale: 0, default: 0 })
    correctedReferralAmount: number;

    @Column({ name: 'wallet_amount', type: 'int', default: 0 })
    walletAmount: number;

    @Column({ name: 'wallet_amount_detail', type: 'json', nullable: true })
    walletAmountDetail: any;

    @Column({ type: 'float', default: 0 })
    discount: number;

    @Column({ name: 'discount_percentage', type: 'int', default: 0 })
    discountPercentage: number;

    @Column({ name: 'follow_up', type: 'tinyint', width: 1, default: 0 })
    followUp: boolean;

    @Column({ name: 'follow_up_for', type: 'bigint', default: 0 })
    followUpFor: bigint;

    @Column({ name: 'appointment_type', type: 'tinyint', width: 1, default: 1 })
    appointmentType: number;

    @Column({ name: 'away_from_city', type: 'tinyint', width: 1, default: 0 })
    awayFromCity: boolean;

    @Column({ name: 'payment_id', type: 'int', default: 0 })
    paymentId: number;

    @Column({ name: 'payment_evidence', nullable: true })
    paymentEvidence: string;

    @Column({ name: 'payment_method_id', type: 'int', default: 0 })
    paymentMethodId: number;

    @Column({ name: 'paid_to_doctor', type: 'tinyint', width: 1, default: 0 })
    paidToDoctor: boolean;

    @Column({ name: 'app_type', type: 'tinyint', width: 1, default: 0 })
    appType: number;

    @Column({ name: 'device_type', type: 'tinyint', width: 1, default: 0 })
    deviceType: number;

    @Column({ name: 'access_token', nullable: true })
    accessToken: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({ name: 'payment_status', type: 'int', default: 1 })
    paymentStatus: number;

    @Column({ name: 'harmony_status', type: 'int', default: 1 })
    harmonyStatus: number;

    @Column({ name: 'call_center_audio_url', nullable: true, length: 150 })
    callCenterAudioUrl: string;

    @Column({ name: 'call_center_notes', type: 'text', nullable: true })
    callCenterNotes: string;

    @Column({ name: 'is_procedure', type: 'tinyint', width: 3, default: 0 })
    isProcedure: boolean;

    @Column({ name: 'record_exists', type: 'tinyint', width: 3, default: 0 })
    recordExists: boolean;

    @Column({ name: 'is_free', type: 'tinyint', width: 3, default: 0 })
    isFree: boolean;

    @Column({ name: 'is_dialer', type: 'tinyint', width: 3, default: 0 })
    isDialer: boolean;

    @Column({ name: 'is_direct_booking', type: 'tinyint', width: 3, default: 0 })
    isDirectBooking: boolean;

    @Column({ name: 'is_referred', type: 'tinyint', width: 1, default: 0 })
    isReferred: boolean;

    @Column({ name: 'last_update_by_user_id', type: 'int', nullable: true, default: 0 })
    updatedBy: number;

    @Column({ name: 'added_by', type: 'int', default: 0 })
    addedBy: number;

    @Column({ name: 'referred_by', type: 'int', nullable: true, default: 0 })
    referredBy: number;

    @Column({ name: 'referred_from', type: 'int', default: 0 })
    referredFrom: number;

    @Column({ name: 'referred_to', type: 'int', nullable: true, default: 0 })
    referredTo: number;

    @Column({ name: 'lead_source_id', type: 'int', nullable: true, default: 0 })
    leadSourceId: number;

    @Column({ name: 'corporate_id', type: 'int', nullable: true, default: 0 })
    corporateId: number;

    @Column({ name: 'corporate_payment_mode', type: 'tinyint', width: 1, nullable: true, default: 0 })
    corporatePaymentMode: number;

    @Column({ name: 'is_agent_special', type: 'tinyint', width: 3, unsigned: true, default: 0 })
    isAgentSpecial: boolean;

    @Column({ name: 'contract_type', type: 'tinyint', width: 3, nullable: true, default: 1 })
    contractType: number;

    @Column({ name: 'is_personal_appointment', type: 'tinyint', width: 3, nullable: true, default: 0 })
    isPersonalAppointment: boolean;

    @Column({ name: 'is_promotion_available', type: 'tinyint', width: 3, nullable: true, default: 0 })
    isPromotionAvailable: boolean;

    @Column({ name: 'is_promotional', type: 'tinyint', width: 3, nullable: true, default: 0 })
    isPromotional: boolean;

    @Column({ name: 'promotional_for', type: 'bigint', nullable: true, default: 0 })
    promotionalFor: string;

    @Column({ name: 'is_call_my_doctor', type: 'tinyint', width: 1, nullable: true, default: 0 })
    isCallMyDoctor: boolean;

    @Column({ name: 'is_commutable', type: 'tinyint', width: 1, nullable: true, default: 1 })
    isCommutable: boolean;

    @Column({ name: 'assigned_to', type: 'int', unsigned: true, default: 0 })
    assignedTo: number;

    @Column({ name: 'in_process_schedule_assign', type: 'int', unsigned: true, default: 0 })
    inProcessScheduleAssign: number;

    @Column({ name: 'schedule_showedup_assign', type: 'int', unsigned: true, default: 0 })
    scheduleShowedupAssign: number;

    @Column({ name: 'is_marham_appointment', type: 'tinyint', width: 1, nullable: true, default: 1 })
    isMarhamAppointment: boolean;

    @Column({ name: 'appointment_user_type', type: 'tinyint', width: 1, nullable: true, default: 4 })
    appointmentUserType: number;

    @Column({ name: 'uuid', nullable: true, length: 50 })
    uuid: string;

    @Column({ name: 'visitor_source', nullable: true, length: 50 })
    visitorSource: string;

    @Column({ name: 'utm_source', nullable: true })
    utmSource: string;

    @Column({ name: 'utm_medium', nullable: true })
    utmMedium: string;

    @Column({ name: 'utm_campaign', nullable: true })
    utmCampaign: string;

    @Column({ name: 'ip_address', nullable: true, length: 50 })
    ipAddress: string;

    @Column({ name: 'online_payment', type: 'tinyint', width: 1, nullable: true, default: 0 })
    onlinePayment: boolean;

    @Column({ name: 'payment_timestamps', type: 'json', nullable: true })
    paymentTimestamps: any;

    @Column({ name: 'cancelled_assign_to', type: 'int', unsigned: true, nullable: true })
    cancelledAssignTo: number;

    @Column({ name: 'is_roche_appointment', type: 'tinyint', width: 1, default: 0 })
    isRocheAppointment: boolean;

    @Column({ name: 'harmony_assign_to', type: 'int', nullable: true })
    harmonyAssignTo: number;

    @Column({ name: 'oc_contracted_hospital_id', type: 'int', unsigned: true, default: 0 })
    ocContractedHospitalId: number;

    @Column({ name: 'wallet_transaction_id', type: 'int', default: 0 })
    walletTransactionId: number;

    @Column({ name: 'subscription_id', type: 'int', nullable: true })
    subscriptionId: number;

    @Column({ name: 'subscription_batch_id', type: 'int', nullable: true })
    subscriptionBatchId: number;

    @Column({ name: 'online_clinic_id', type: 'int', nullable: true })
    onlineClinicId: number;

    @Column({ name: 'evidence_transaction_id', nullable: true })
    evidenceTransactionId: string;

    @Column({ name: 'evidence_amount', type: 'double', precision: 8, scale: 2, nullable: true })
    evidenceAmount: number;

    @Column({ name: 'evidence_payment_date', type: 'date', nullable: true })
    evidencePaymentDate: Date;

    @Column({ name: 'moengage_uuid', nullable: true, length: 50 })
    moengageUuid: string;

    @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
    scheduledAt: Date;

    @Column({ name: 'cancelled_assign_at', type: 'datetime', nullable: true })
    cancelledAssignAt: Date;

    @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
    cancelledAt: Date;

    @Column({ name: 'harmony_assign_at', type: 'timestamp', nullable: true })
    harmonyAssignAt: Date;

    @Column({ name: 'showedup_at', type: 'timestamp', nullable: true })
    showedupAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'created_date', type: 'date', nullable: true })
    createdDate: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @OneToOne('OnlineConsultation')
    @JoinColumn({ name: 'id', referencedColumnName: 'appointmentId' })
    onlineConsultation: unknown;

    @ManyToOne('Hospital')
    @JoinColumn({ name: 'hospitalID', referencedColumnName: 'id' })
    hospital: unknown;

    @OneToMany('PatientAppointmentMedicine', 'appointment')
    medicineList: unknown[];

    @OneToMany('PatientAppointmentTest', 'appointment')
    testList: unknown[];

    @OneToMany('PatientRecordFile', 'appointment')
    fileList: unknown[];

    @OneToOne('Doctor')
    @JoinColumn({ name: 'dID', referencedColumnName: 'id' })
    doctor: unknown;

    @ManyToOne('DoctorListing')
    @JoinColumn({ name: 'doctor_hospital_id', referencedColumnName: 'id' })
    doctorListing: unknown;

    @ManyToOne('PromoCode', 'appointments')
    @JoinColumn({ name: 'promo_code_id' })
    promoCode: unknown;
}

