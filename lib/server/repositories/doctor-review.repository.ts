import { DataSource, Not, IsNull } from 'typeorm';
import { DoctorReview } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class DoctorReviewRepository extends BaseRepository<DoctorReview> {
    
    constructor(private dataSource: DataSource) {
        super(DoctorReview, dataSource.createEntityManager());
    }

    /**
     * Find hospital listings for doctors
     */
    async getDoctorReviews(doctorId: number, skip: number, limit: number, isPublished?: number, overallExperience?: number): Promise<DoctorReview[]> {
        const reviewQuery = this.createQueryBuilder('reviews')
            .select([
                'reviews.id',
                'reviews.doctorId',
                'reviews.experience',
                'reviews.overallExperience',
                'reviews.userName',
                'reviews.waitingTime',
                'reviews.staffBehaviour',
                'reviews.hospitalEnvironment',
                'reviews.appointmentDuration',
                'reviews.appointmentId',
                'reviews.heading',
                'reviews.type',
                'reviews.isPinned',
                'reviews.createdAt'
            ])
            .addSelect(subQuery => {
                return subQuery
                    .select('pa.hospital_name')
                    .from('patient_appointments', 'pa')
                    .where('pa.id = reviews.appointment_id')
            }, 'appointmentHospitalName')
            .where('reviews.doctorId = :doctorId', { doctorId })
            .andWhere('reviews.deletedAt IS NULL');

        if (isPublished) {
            reviewQuery.andWhere('reviews.isPublished = :isPublished', { isPublished });
        }

        if (overallExperience) {
            reviewQuery.andWhere('reviews.overallExperience = :overallExperience', { overallExperience });
        }

        reviewQuery.groupBy('reviews.id')
            .orderBy('reviews.isPinned', 'DESC')
            .addOrderBy('reviews.experience', 'DESC')
            .addOrderBy('reviews.id', 'DESC')
            .offset(skip)
            .limit(limit);

        return await reviewQuery.getMany();
    }

    async getDoctorReviewStats(doctorId: number): Promise<any> {
        const stats = await this.createQueryBuilder('reviews')
            .select(`IFNULL(ROUND((
                COUNT(CASE WHEN reviews.publishedByDoctor = 1 AND reviews.hospital_type = 1 AND reviews.overall_experience = 1 THEN 1 END)
                /
                NULLIF(COUNT(CASE WHEN reviews.publishedByDoctor = 1 AND reviews.hospital_type = 1 THEN 1 END), 0)
            ) * 5, 1), 0)`, 'inclinic_score')
            .addSelect(`ROUND( (COUNT(IF(reviews.overall_experience = 1, id, NULL)) / COUNT(*)) * 100) as positive_satisfaction_score`)
            .where('reviews.dID = :doctorId', { doctorId })
            .andWhere('reviews.deleted_at IS NULL')
            .limit(1)
            .getRawOne();
        return stats;
    }

    async getDoctorReviewsCount(doctorId: number) {
        return await this.createQueryBuilder('reviews')
            .where('reviews.doctorId = :doctorId', { doctorId })
            .getCount();
    }

    async getDoctorPublishedReviewsCount(doctorId: number) {
        return await this.createQueryBuilder('reviews')
            .where('reviews.doctorId = :doctorId', { doctorId })
            .andWhere('reviews.isPublished = 1')
            .getCount();
    }
    async getDoctorReviewStatsByCategory(doctorId: number): Promise<{
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
        totalCount: number;
    }> {
        const stats = await this.createQueryBuilder('reviews')
            .select([
                'COUNT(CASE WHEN reviews.satisfied = 1 THEN 1 END) as positiveCount',
                'COUNT(CASE WHEN reviews.satisfied = 2 THEN 1 END) as negativeCount',
                'COUNT(CASE WHEN reviews.satisfied = 0 OR reviews.satisfied IS NULL THEN 1 END) as neutralCount',
                'COUNT(*) as totalCount'
            ])
            .where('reviews.doctorId = :doctorId', { doctorId })
            .andWhere('reviews.deletedAt IS NULL')
            .andWhere('reviews.isPublished = 1')
            .getRawOne();

        return {
            positiveCount: parseInt(stats.positiveCount) || 0,
            neutralCount: parseInt(stats.neutralCount) || 0,
            negativeCount: parseInt(stats.negativeCount) || 0,
            totalCount: parseInt(stats.totalCount) || 0
        };
    }

    /**
     * Get filtered doctor reviews with pagination and sorting
     */
    async getFilteredDoctorReviews(
        doctorId: number,
        filter: 'positive' | 'negative' | 'unanswered' | 'all',
        sortBy: 'newest' | 'oldest' | 'rating',
        skip: number,
        limit: number
    ): Promise<{ reviews: DoctorReview[]; total: number }> {
        const reviewQuery = this.createQueryBuilder('reviews')
            .select([
                'reviews.id',
                'reviews.doctorId',
                'reviews.experience',
                'reviews.overallExperience',
                'reviews.userName',
                'reviews.waitingTime',
                'reviews.staffBehaviour',
                'reviews.hospitalEnvironment',
                'reviews.appointmentDuration',
                'reviews.appointmentId',
                'reviews.heading',
                'reviews.type',
                'reviews.isPinned',
                'reviews.satisfied',
                'reviews.recommandation',
                'reviews.createdAt',
                'reviews.positiveFeedback',
                'reviews.negativeFeedback',
                'reviews.resolutionStatus'
            ])
            .addSelect(subQuery => {
                return subQuery
                    .select('pa.hospital_name')
                    .from('patient_appointments', 'pa')
                    .where('pa.id = reviews.appointment_id')
            }, 'appointmentHospitalName')
            .where('reviews.doctorId = :doctorId', { doctorId })
            .andWhere('reviews.deletedAt IS NULL')
            .andWhere('reviews.isPublished = 1');

        // Apply filters
        switch (filter) {
            case 'positive':
                reviewQuery.andWhere('reviews.satisfied = 1');
                break;
            case 'negative':
                reviewQuery.andWhere('reviews.satisfied = 2');
                break;
            case 'unanswered':
                reviewQuery.andWhere('reviews.resolutionStatus = 0 OR reviews.resolutionStatus = 1');
                break;
            // 'all' case - no additional filter needed
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                reviewQuery.orderBy('reviews.isPinned', 'DESC')
                    .addOrderBy('reviews.createdAt', 'DESC');
                break;
            case 'oldest':
                reviewQuery.orderBy('reviews.isPinned', 'DESC')
                    .addOrderBy('reviews.createdAt', 'ASC');
                break;
            case 'rating':
                reviewQuery.orderBy('reviews.isPinned', 'DESC')
                    .addOrderBy('reviews.recommandation', 'DESC')
                    .addOrderBy('reviews.createdAt', 'DESC');
                break;
        }

        // Get total count for pagination
        const total = await reviewQuery.getCount();

        // Apply pagination
        const reviews = await reviewQuery
            .offset(skip)
            .limit(limit)
            .getMany();

        return { reviews, total };
    }
}
