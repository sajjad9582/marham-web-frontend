import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('doctor_review_replies')
export class DoctorReviewReply {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'review_id' })
    reviewId: number;

    @ManyToOne('DoctorReview', 'replies')
    @JoinColumn({ name: 'review_id' })
    review: unknown;

    @Column({ name: 'user_id', type: 'text', nullable: true, comment: 'ID of the replier (doctor id or patient user id)' })
    userId: string;

    @Column({ name: 'replier_type', type: 'tinyint', comment: '1: DOCTOR, 2: PATIENT, 3: ADMIN' })
    replierType: number;

    @Column({ name: 'reply', type: 'text' })
    reply: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}
