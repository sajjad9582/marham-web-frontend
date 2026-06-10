// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('docdetails')
export class Doctor {
    @PrimaryGeneratedColumn({ name: 'dlID' })
    id: number;

    @Column({ name: 'docName', nullable: true })
    name: string;

    @Column({ name: 'docEmail', nullable: true })
    email: string;

    @Column({ name: 'docPhone', nullable: true, length: 30 })
    phone: string;

    @Column({ name: 'docDetails', type: 'blob', nullable: true })
    details: any;

    @Column({ name: 'aboutMe', type: 'longtext', nullable: true })
    aboutMe: string;

    @Column({ name: 'docDegree', length: 500, nullable: true })
    degree: string;

    @Column({ name: 'docExp', type: 'float', nullable: true })
    experience: number;

    @Column({ name: 'docPic', nullable: true })
    profilePic: string;

    @Column({ name: 'catID', nullable: true })
    categoryId: number;

    @Column({ name: 'spID' })
    specialityId: number;

    @Column({ name: 'subspID' })
    subSpecialityId: number;

    @Column({ nullable: true, width: 1, type: 'tinyint' })
    physician: boolean;

    @Column({ nullable: true, width: 1, type: 'tinyint' })
    surgen: boolean;

    @Column({ name: 'reviewID', nullable: true })
    reviewId: number;

    @Column({ width: 1, default: 1, type: 'tinyint' })
    available: boolean;

    @Column({ default: 0 })
    relief: number;

    @Column({ default: 0 })
    marham: number;

    @Column({ type: 'float', default: 0 })
    ranking: number;

    @Column({ length: 100, nullable: true })
    pmdc: string;

    @Column({ nullable: true, width: 1, type: 'tinyint' })
    gender: number;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    interview: string;

    @Column({ name: 'willing_for_video_consultancy', width: 1, default: 0, type: 'tinyint' })
    willingForVideoConsultancy: boolean;

    @Column({ name: 'home_service', width: 1, default: 0, type: 'tinyint' })
    homeService: boolean;

    @Column({ name: 'video_consultation', width: 1, default: 0, type: 'tinyint' })
    videoConsultation: boolean;

    @Column({ type: 'float', default: 0 })
    points: number;

    @Column({ name: 'marham_special', type: 'float', default: 0 })
    marhamSpecial: number;

    @Column({ name: 'marham_special_2', type: 'double', precision: 8, scale: 2, default: 0 })
    marhamSpecial2: number;

    @Column({ name: 'new_points', type: 'float', default: 1000 })
    newPoints: number;

    @Column({ name: 'ra_2_points', type: 'double', default: 0 })
    ra2Points: number;

    @Column({ name: 'appointment_number', length: 50, nullable: true })
    appointmentNumber: string;

    @Column({ name: 'appointment_instructions', type: 'text', nullable: true })
    appointmentInstructions: string;

    @Column({ name: 'online_consultation_instructions', type: 'text', nullable: true })
    onlineConsultationInstructions: string;

    @Column({ name: 'fix_fee', width: 1, default: 0, type: 'tinyint' })
    fixFee: boolean;

    @Column({ name: 'appointments_booked', default: 0 })
    appointmentsBooked: number;

    @Column({ name: 'procedures_booked', default: 0 })
    proceduresBooked: number;

    @Column({ name: 'profile_views', default: 1288 })
    profileViews: number;

    @Column({ name: 'area_of_interest', type: 'longtext', nullable: true })
    areaOfInterest: string;

    @Column({ name: 'marked_red', width: 1, default: 0, nullable: true, type: 'tinyint' })
    markedRed: boolean;

    @Column({ name: 'auth_token', length: 50, nullable: true })
    authToken: string;

    @Column({ name: 'canonical_at', nullable: true })
    canonicalAt: string;

    @Column({ name: 'on_panel', width: 3, default: 0, type: 'tinyint' })
    onPanel: boolean;

    @Column({ name: 'on_panel_at', type: 'timestamp', nullable: true })
    onPanelAt: Date;

    @Column({ name: 'off_panel_at', type: 'timestamp', nullable: true })
    offPanelAt: Date;

    @Column({ name: 'on_panel_by_user_id', default: 0, nullable: true })
    onPanelByUserId: number;

    @Column({ name: 'off_panel_by', default: 0, nullable: true })
    offPanelBy: number;

    @Column({ name: 'sales_notes', type: 'text', nullable: true })
    salesNotes: string;

    @Column({ name: 'profile_not_completed', width: 3, default: 0, type: 'tinyint' })
    profileNotCompleted: number;

    @Column({ name: 'direct_booking', width: 3, default: 0, type: 'tinyint' })
    directBooking: number;

    @Column({ name: 'no_direct_booking', width: 3, type: 'tinyint' })
    noDirectBooking: number;

    @Column({ name: 'direct_booking_notes', length: 500, nullable: true })
    directBookingNotes: string;

    @Column({ name: 'added_by_user_id', default: 0 })
    addedByUserId: number;

    @Column({ name: 'on_leave', width: 3, default: 0, type: 'tinyint' })
    onLeave: number;

    @Column({ name: 'on_leave_from', type: 'date', nullable: true })
    onLeaveFrom: Date;

    @Column({ name: 'on_leave_to', type: 'date', nullable: true })
    onLeaveTo: Date;

    @Column({ name: 'completion_level', width: 1, default: 5, nullable: true, type: 'tinyint' })
    completionLevel: number;

    @Column({ name: 'profile_self_completion_level', width: 1, default: 0, nullable: true, type: 'tinyint' })
    profileSelfCompletionLevel: number;

    @Column({ width: 1, default: 0, nullable: true, type: 'tinyint' })
    acknowledged: boolean;

    @Column({ nullable: true })
    acknowledgement: string;

    @Column({ name: 'acknowledged_from', width: 1, default: 0, nullable: true, type: 'tinyint' })
    acknowledgedFrom: number;

    @Column({ type: 'double', default: 0, nullable: true })
    rating: number;

    @Column({ name: 'first_come_first_serve', width: 3, default: 0, nullable: true, type: 'tinyint' })
    firstComeFirstServe: number;

    @Column({ name: 'is_roche_doctor', width: 1, default: 0, type: 'tinyint' })
    isRocheDoctor: boolean;

    @Column({ name: 'average_waiting_time', length: 50, nullable: true })
    averageWaitingTime: string;

    @Column({ name: 'average_appointment_time', length: 50, nullable: true })
    averageAppointmentTime: string;

    @Column({ name: 'diagnosis_score', default: 0, nullable: true })
    diagnosisScore: number;

    @Column({ name: 'staff_score', default: 0, nullable: true })
    staffScore: number;

    @Column({ name: 'bank_name', nullable: true })
    bankName: string;

    @Column({ name: 'bank_account_no', nullable: true })
    bankAccountNumber: string;

    @Column({ name: 'bank_account_title', nullable: true })
    bankAccountTitle: string;

    @Column({ name: 'partnership_company_id', default: 0, nullable: true })
    partnershipCompanyId: number;

    @Column({ name: 'hidden_by', default: 0, nullable: true })
    hiddenBy: number;

    @Column({ name: 'active_at', type: 'timestamp', nullable: true })
    activeAt: Date;

    @Column({ name: 'inactive_at', type: 'timestamp', nullable: true })
    inactiveAt: Date;

    @Column({ name: 'is_inactive_by_non_payment', width: 1, default: 0, type: 'tinyint' })
    isInactiveByNonPayment: boolean;

    @Column({ name: 'hidden_at', type: 'timestamp', nullable: true })
    hiddenAt: Date;

    @Column({ name: 'is_verified', width: 1, default: 0, type: 'tinyint' })
    isVerified: boolean;

    @Column({ name: 'onboarding_payment_status', width: 3, default: 3, type: 'tinyint' })
    onboardingPaymentStatus: number;

    @Column({ name: 'onboarding_status', nullable: true })
    onboardingStatus: number;

    @Column({ name: 'oc_points', type: 'float', default: 0 })
    ocPoints: number;

    @Column({ name: 'consultation_special', type: 'float', default: 0 })
    consultationSpecial: number;

    @Column({ name: 'consultation_city', length: 100, nullable: true })
    consultationCity: string;

    @Column({ name: 'call_my_doctor', width: 1, default: 0, nullable: true, type: 'tinyint' })
    callMyDoctor: boolean;

    @Column({ name: 'account_manager_id', default: 0, nullable: true })
    accountManagerId: number;

    @Column({ type: 'json', nullable: true })
    actions: any;

    @Column({ name: 'is_patient_chat_enabled', width: 1, default: 1, nullable: true, type: 'tinyint' })
    isPatientChatEnabled: boolean;

    @Column({ name: 'is_patient_report_sharing_enabled', width: 1, default: 1, nullable: true, type: 'tinyint' })
    isPatientReportSharingEnabled: boolean;

    @Column({ name: 'doctor_ranking_category_id', default: 0 })
    doctorRankingCategoryId: number;

    @Column({ name: 'max_monthly_impressions', default: 0 })
    maxMonthlyImpressions: number;

    @Column({ name: 'max_daily_impressions', default: 0 })
    maxDailyImpressions: number;

    @Column({ name: 'max_monthly_profile_views', default: 0 })
    maxMonthlyProfileViews: number;

    @Column({ name: 'max_daily_profile_views', default: 0 })
    maxDailyProfileViews: number;

    @Column({ name: 'impression_count_last_30_days', type: 'bigint', unsigned: true, default: 0 })
    impressionCountLast30Days: number;

    @Column({ name: 'forum_likes_count', type: 'bigint', unsigned: true, default: 0 })
    forumLikesCount: number;

    @Column({ type: 'json', nullable: true })
    seo: any;

    @Column({ name: 'odoo_id', unsigned: true, nullable: true })
    odooId: number;

    @Column({ name: 'odoo_updated_at', type: 'timestamp', nullable: true })
    odooUpdatedAt: Date;

    @Column({ name: 'published_by', default: 0 })
    publishedBy: number;

    @Column({ name: 'unpublished_by', default: 0 })
    unpublishedBy: number;

    @Column({ name: 'is_scrapped', width: 3, default: 0, nullable: true, type: 'tinyint' })
    isScrapped: number;

    @Column({ name: 'date_of_experience', type: 'date', nullable: true })
    dateOfExperience: Date;

    @CreateDateColumn({ name: 'createdDate' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @Column({ name: 'isInHouseDoctor', width: 1, default: 0, nullable: true, type: 'tinyint' })
    isInHouseDoctor: boolean;

    @OneToMany('DoctorReview', 'doctor')
    reviews: unknown[];

    @OneToMany('DoctorAreaOfInterest', 'doctor')
    doctorAreasOfInterest: unknown[];

    @OneToMany('PatientAppointment', 'doctor')
    appointments: unknown[];
}

