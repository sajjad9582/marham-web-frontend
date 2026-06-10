// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';

@Entity('doctor_reviews')
export class DoctorReview {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'dID', default: 0 })
    doctorId: number;

    @ManyToOne('Doctor', 'reviews')
    @JoinColumn({ name: 'dID', referencedColumnName: 'id' })
    doctor: unknown;

    @Column({ name: 'docFeedback', type: 'tinyint', width: 1, default: 0 })
    feedback: boolean;

    @Column({ name: 'experience', type: 'longtext', nullable: true })
    experience: string;

    @Column({ name: 'userID', type: 'text', nullable: true })
    userId: string;

    @Column({ name: 'userEmail', nullable: true })
    userEmail: string;

    @Column({ name: 'name', nullable: true })
    userName: string;

    @Column({ name: 'profile_link', nullable: true })
    profileLink: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    locale: string;

    @Column({ length: 1000, nullable: true })
    picture: string;

    @Column({ length: 1000, nullable: true })
    heading: string;

    @Column({ name: 'easy_to_use', type: 'tinyint', width: 1, default: 0 })
    easyToUse: boolean;

    @Column({ name: 'receive_prescription', type: 'tinyint', width: 1, default: 0 })
    receivePrescription: boolean;

    @Column({ name: 'publishedByDoctor', type: 'tinyint', width: 1, default: 0 })
    isPublished: boolean;

    @Column({ type: 'tinyint', width: 3, default: 0, comment: '(1 - 5), 1 Bad, 5 Good' })
    timming: number;

    @Column({ type: 'tinyint', width: 3, default: 0, comment: '(1 - 5), 1 Bad, 5 Good' })
    diagnosis: number;

    @Column({ name: 'appointment_booking', type: 'tinyint', width: 3, default: 0, comment: '(1 - 5), 1 Bad, 5 Good' })
    appointmentBooking: number;

    @Column({ name: 'book_again', length: 50, nullable: true, comment: 'yes, no, maybe' })
    bookAgain: string;

    @Column({ type: 'text', nullable: true })
    problem: string;

    @Column({ name: 'appointment_id', type: 'bigint', default: 0 })
    appointmentId: number;

    @Column({ type: 'tinyint', width: 3, default: 1, comment: '1 for user entered review, 2 for callcenter review' })
    type: number;

    @Column({ name: 'hospital_type', type: 'tinyint', width: 1, default: 1 })
    hospitalType: number;

    @Column({ name: 'positive_feedback', type: 'longtext', nullable: true })
    positiveFeedback: string;

    @Column({ name: 'negative_feedback', type: 'longtext', nullable: true })
    negativeFeedback: string;

    @Column({ name: 'call_center_audio_url', length: 250, nullable: true })
    callCenterAudioUrl: string;

    @Column({ name: 'audio_quality', type: 'tinyint', width: 1, nullable: true, default: 0 })
    audioQuality: number;

    @Column({ name: 'video_quality', type: 'tinyint', width: 1, nullable: true, default: 0 })
    videoQuality: number;

    @Column({ name: 'consultation_end_status', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '1 for Completed Successfully, 2 for Lost Connection' })
    consultationEndStatus: number;

    @Column({ name: 'doctor_showed_up', type: 'tinyint', width: 1, nullable: true, default: 1, comment: '1 for Yes, 0 for No' })
    doctorShowedUp: boolean;

    @Column({ name: 'doctor_behaviour', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '(1 -5), 1 Bad, 5 Good' })
    doctorBehaviour: number;

    @Column({ name: 'visited_doctor', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '(1 - 5), 1 = Yes, 2 = didnt get time, 3 = did not get confirmation message, 4 = unable to find clinic, 5 = I forgot' })
    visitedDoctor: number;

    @Column({ name: 'recommend_doctor', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '(1 - 5), 1 Bad, 5 Good' })
    recommendDoctor: number;

    @Column({ name: 'doctor_asked_for', length: 50, nullable: true, comment: 'recommend surgery, recommend medicine, recommend therapy, asked for test' })
    doctorAskedFor: string;

    @Column({ name: 'patient_suggestions', type: 'text', nullable: true })
    patientSuggestions: string;

    @Column({ length: 50, nullable: true })
    city: string;

    @Column({ length: 255, nullable: true })
    area: string;

    @Column({ name: 'waiting_time', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '1 - 10 min, 2 - 15 min, 3 - 20 min, 4 - 30 min, 5 - 45 min, 6 - 1 hour' })
    waitingTime: number;

    @Column({ name: 'appointment_duration', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '1 - 5 min, 2 - 10 min, 3 - 20 min, 4 - 30 min, 5 - 1 hour' })
    appointmentDuration: number;

    @Column({ name: 'hospital_environment', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '0/1' })
    hospitalEnvironment: boolean;

    @Column({ name: 'staff_behaviour', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '0/1' })
    staffBehaviour: boolean;

    @Column({ type: 'tinyint', width: 1, nullable: true, default: 0, comment: '1 for positive/2 for negative' })
    satisfied: number;

    @Column({ name: 'overall_experience', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '0/1' })
    overallExperience: boolean;

    @Column({ type: 'int', nullable: true, default: 0, comment: '1 to 10 patient recommandation 1 for bad 10 for happy' })
    recommandation: number;

    @Column({ name: 'notes_for_management', type: 'text', nullable: true })
    notesForManagement: string;

    @Column({ name: 'resolution_status', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '0 - Unresolved, 1 - Unresolved - Show to Doctor, 2 - Resolved by Doctor, 3 - Resolved by Marham, 4 - Cannot be Resolved' })
    resolutionStatus: number;

    @Column({ name: 'resolution_suggestion', type: 'text', nullable: true })
    resolutionSuggestion: string;

    @Column({ name: 'resolution_suggestion_id', type: 'tinyint', width: 1, nullable: true, default: 0, comment: '1 - Offer free visit, 2 - Refund Fee, 3 - Others' })
    resolutionSuggestionId: number;

    @Column({ name: 'is_pinned', type: 'tinyint', width: 1, default: 0 })
    isPinned: boolean;

    @Column({ name: 'app_type', type: 'tinyint', width: 1, default: 0 })
    appType: number;

    @Column({ name: 'device_type', type: 'tinyint', width: 1, default: 0 })
    deviceType: number;

    @Column({ type: 'longtext', nullable: true })
    actions: string;

    @Column({ name: 'review_sent_to_doctor_at', type: 'timestamp', nullable: true })
    reviewSentToDoctorAt: Date;

    @Column({ name: 'review_resolved_by_doctor_at', type: 'timestamp', nullable: true })
    reviewResolvedByDoctorAt: Date;

    @Column({ name: 'review_resolved_by_marham_at', type: 'timestamp', nullable: true })
    reviewResolvedByMarhamAt: Date;

    @Column({ name: 'review_cant_be_resolved_at', type: 'timestamp', nullable: true })
    reviewCantBeResolvedAt: Date;

    @Column({ name: 'is_anonymous', type: 'int', nullable: true, default: 0 })
    isAnonymous: number;

    @Column({ name: 'approved_by', type: 'int', nullable: true })
    approvedBy: number;

    @Column({ name: 'unapproved_by', type: 'int', nullable: true })
    unapprovedBy: number;

    @Column({ name: 'deleted_by', type: 'int', nullable: true })
    deletedBy: number;

    @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
    approvedAt: Date;

    @Column({ name: 'unapproved_at', type: 'timestamp', nullable: true })
    unapprovedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;

    @OneToOne('PatientAppointment')
    @JoinColumn({ name: 'appointment_id' })
    appointment: unknown;

    @OneToMany('DoctorReviewReply', 'review')
    replies: unknown[];
}

