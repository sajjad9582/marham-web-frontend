// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('doclisting')
export class DoctorListing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'dlID', default: 0 })
    doctorId: number;

    @Column({ name: 'docName', nullable: true })
    doctorName: string;

    @Column({ name: 'docPic', nullable: true })
    profilePic: string;

    @Column({ name: 'hospitalPic', nullable: true })
    hospitalPic: string;

    @Column({ name: 'docExp', type: 'float', default: 0, nullable: true })
    experience: number;

    @Column({ name: 'docFee', type: 'float', default: 0, nullable: true })
    fee: number;

    @Column({ name: 'discountFee', type: 'float', default: 0, nullable: true })
    discountFee: number;

    @Column({ name: 'docGender', nullable: true })
    doctorGenderString: string;

    @Column({ name: 'catID', default: 0, nullable: true })
    categoryId: number;

    @Column({ name: 'catName', nullable: true })
    categoryName: string;

    @Column({ name: 'spID', default: 0 })
    specialityId2: number;

    @Column({ name: 'subspID', default: 0 })
    subSpecialityId: number;

    @Column({ name: 'speciality_id', default: 0 })
    specialityId: number;

    @Column({ nullable: true })
    speciality: string;

    @Column({ name: 'subSpeciality', nullable: true })
    subSpeciality: string;

    @Column({ name: 'speciality_name', nullable: true })
    specialityName: string;

    @Column({ name: 'similar_specialities', length: 1000, nullable: true })
    similarSpecialities: string;

    @Column({ width: 1, default: 1, nullable: true, type: 'tinyint' })
    gender: number;

    @Column({ name: 'docPic1', length: 200, nullable: true })
    docPic1: string;

    @Column({ name: 'docPic2', length: 200, nullable: true })
    docPic2: string;

    @Column({ name: 'docPic3', length: 200, nullable: true })
    docPic3: string;

    @Column({ name: 'docPic4', length: 200, nullable: true })
    docPic4: string;

    @Column({ name: 'docPic5', length: 200, nullable: true })
    docPic5: string;

    @Column({ name: 'timeID', default: 0, nullable: true })
    timeId: number;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    monday: boolean;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    tuesday: boolean;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    wednesday: boolean;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    thursday: boolean;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    friday: boolean;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    saturday: boolean;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    sunday: boolean;

    @Column({ name: 'startTime', length: 100, nullable: true })
    startTime: string;

    @Column({ name: 'endTime', length: 100, nullable: true })
    endTime: string;

    @Column({ name: 'onCall', width: 1, default: 0, nullable: true, type: 'tinyint' })
    onCall: boolean;

    @Column({ name: 'apptPhone', nullable: true })
    appointmentPhone: string;

    @Column({ name: 'hospital_assistant_number', length: 50, nullable: true })
    hospitalAssistantNumber: string;

    @Column({ name: 'hospital_admin_number', nullable: true })
    hospitalAdminNumber: string;

    @Column({ name: 'historyTime', default: 1 })
    historyTime: number;

    @Column({ name: 'patientsPerHour', default: 6 })
    patientsPerHour: number;

    @Column({ name: 'averageTimePerPatient', default: 2 })
    averageTimePerPatient: number;

    @Column({ name: 'appointmentMethodID', default: 2 })
    appointmentMethodId: number;

    @Column({ name: 'appointmentMethod', default: 'Automated' })
    appointmentMethod: string;

    @Column({ name: 'consultation_timing_type', width: 1, default: 1, type: 'tinyint' })
    consultationTimingType: number;

    @Column({ name: 'consultation_patient_type', width: 1, default: 1, type: 'tinyint' })
    consultationPatientType: number;

    @Column({ name: 'nextslot', width: 1, default: 0, type: 'tinyint' })
    nextSlot: boolean;

    @Column({ name: 'hospitalID', default: 0, nullable: true })
    hospitalId: number;

    @Column({ name: 'hospitalName', nullable: true })
    hospitalName: string;

    @Column({ name: 'hospitalAddress', nullable: true })
    hospitalAddress: string;

    @Column({ name: 'hospitalCity', default: 'Lahore', nullable: true })
    hospitalCity: string;

    @Column({ nullable: true })
    lat: string;

    @Column({ nullable: true })
    lng: string;

    @Column({ name: 'hospitalArea', nullable: true })
    hospitalArea: string;

    @Column({ name: 'hospital_area_slug', nullable: true })
    hospitalAreaSlug: string;

    @CreateDateColumn({ name: 'createdDate' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedDate', nullable: true })
    updatedAt: Date;

    @Column({ name: 'doctorSoundex', nullable: true })
    doctorSoundex: string;

    @Column({ name: 'specialitySoundex', nullable: true })
    specialitySoundex: string;

    @Column({ name: 'hospitalSoundex', nullable: true })
    hospitalSoundex: string;

    @Column({ name: 'doctorSlug' })
    doctorSlug: string;

    @Column({ name: 'docDegree', length: 500, nullable: true })
    degree: string;

    @Column({ name: 'consultancy_fee_referral_on', width: 3, default: 0, type: 'tinyint' })
    consultancyFeeReferralOn: number;

    @Column({ name: 'doctor_fee_after_hospital_share', default: 0 })
    doctorFeeAfterHospitalShare: number;

    @Column({ name: 'consultancy_referral', default: 0 })
    consultancyReferral: number;

    @Column({ name: 'contract_type', width: 1, default: 1, type: 'tinyint' })
    contractType: number;

    @Column({ name: 'similar_id_1', default: 0 })
    similarId1: number;

    @Column({ name: 'similar_id_2', default: 0 })
    similarId2: number;

    @Column({ name: 'similar_id_3', default: 0 })
    similarId3: number;

    @Column({ name: 'similar_id_4', default: 0 })
    similarId4: number;

    @Column({ name: 'similar_id_5', default: 0 })
    similarId5: number;

    @Column({ name: 'hospital_type', default: 1 })
    hospitalType: number;

    @Column({ name: 'added_by_user_id', default: 0 })
    addedByUserId: number;

    @Column({ name: 'updated_by', default: 0 })
    updatedBy: number;

    @Column({ name: 'average_waiting_time', length: 50, nullable: true })
    averageWaitingTime: string;

    @Column({ name: 'average_appointment_time', length: 50, nullable: true })
    averageAppointmentTime: string;

    @Column({ name: 'diagnosis_score', default: 0, nullable: true })
    diagnosisScore: number;

    @Column({ name: 'staff_score', default: 0, nullable: true })
    staffScore: number;

    @Column({ name: 'direct_booking', width: 1, default: 0, nullable: true, type: 'tinyint' })
    directBooking: boolean;

    @Column({ name: 'direct_booking_notes', type: 'text', nullable: true })
    directBookingNotes: string;

    @Column({ name: 'on_leave', width: 1, default: 0, nullable: true, type: 'tinyint' })
    onLeave: boolean;

    @Column({ name: 'leave_notes', nullable: true })
    leaveNotes: string;

    @Column({ name: 'on_leave_from', type: 'date', nullable: true })
    onLeaveFrom: Date;

    @Column({ name: 'on_leave_to', type: 'date', nullable: true })
    onLeaveTo: Date;

    @Column({ name: 'is_online_payment_enabled', width: 1, default: 0, nullable: true, type: 'tinyint' })
    isOnlinePaymentEnabled: boolean;

    @Column({ name: 'is_online_payment_compulsory', width: 1, default: 0, type: 'tinyint' })
    isOnlinePaymentCompulsory: boolean;

    @Column({ name: 'oc_contracted_hospital_id', unsigned: true, default: 0 })
    ocContractedHospitalId: number;

    @Column({ name: 'is_scrapped', width: 3, default: 0, nullable: true, type: 'tinyint' })
    isScrapped: number;

    @Column({ name: 'odoo_id', unsigned: true, nullable: true })
    odooId: number;

    @Column({ name: 'odoo_updated_at', type: 'timestamp', nullable: true })
    odooUpdatedAt: Date;

    @Column({ name: 'active_at', type: 'timestamp', nullable: true })
    activeAt: Date;

    @Column({ name: 'inactive_at', type: 'timestamp', nullable: true })
    inactiveAt: Date;

    @Column({ name: 'is_inactive_by_non_payment', width: 1, default: 0, type: 'tinyint' })
    isInactiveByNonPayment: boolean;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date;

    @ManyToOne('Hospital', 'doctorListings')
    @JoinColumn({ name: 'hospitalID' })
    hospital: unknown;
}

