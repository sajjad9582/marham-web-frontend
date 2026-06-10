import { getConfig } from '@/lib/server/config';

export type ConfigAdapter = { get: typeof getConfig };
import { DataSource, Brackets } from 'typeorm';
import { Doctor, DoctorListing, DoctorReview } from '@/lib/server/entities';
import { DoctorImageUtil } from '@/lib/server/utils';
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import lodash from 'lodash';

const { trim } = lodash;
import { DoctorSearchParams } from '@/lib/server/interfaces/doctor-search-params.interface';
import { DoctorWithSpeciality } from '@/lib/server/interfaces/doctor-with-speciality.interface';

export class DoctorRepository extends BaseRepository<Doctor> {
    constructor(
        private dataSource: DataSource,
        private configService: ConfigAdapter = { get: getConfig },
    ) {
        super(Doctor, dataSource.createEntityManager());
    }

    async findById(id: number): Promise<Doctor | null> {
        return this.findOne({ where: { id } });
    }

    /**
     * Find doctors with advanced filtering and sorting
     */
    async findDoctorsWithFilters(params: DoctorSearchParams): Promise<[DoctorWithSpeciality[], number]> {
        const { specialityIds, serviceId, diseaseId, city, area, minFee, maxFee, gender, isFree, lat, lng, ids, consultationType, sortBy, sortDirection, availableToday, limit, skip, isOnPanelOnly, hospitalId } = params;

        const doctorQb = this.createQueryBuilder('doctor')
            .select([
                'doctor.id',
                'doctor.name',
                'doctor.experience',
                'doctor.profilePic',
                'doctor.gender',
                'doctor.degree',
                'doctor.firstComeFirstServe',
                'doctor.averageWaitingTime',
                'doctor.staffScore',
                'doctor.specialityId',
                'doctor.diagnosisScore',
                'doctor.rating',
                'doctor.points',
            ])
            .addSelect('listing_filter.specialityName', 'specialityName')
            .addSelect(subQb => {
                return subQb
                    .select('COUNT(r.id)', 'count')
                    .from('doctor_reviews', 'r')
                    .where('r.doctorId = doctor.id')
                    .andWhere('r.deletedAt IS NULL')
                    .andWhere('r.isPublished = 1');
            }, 'totalReviews')
            // Always join with doclisting table
            .innerJoin(
                'doclisting',
                'listing_filter',
                'listing_filter.dlID = doctor.id AND listing_filter.deletedAt IS NULL AND listing_filter.activeAt IS NOT NULL AND listing_filter.inactiveAt IS NULL'
            )
            // Doctor table checks - ensure doctor is active and not deleted
            .where('doctor.hiddenAt IS NULL')
            .andWhere('doctor.activeAt IS NOT NULL')
            .andWhere('doctor.inactiveAt IS NULL')
            .andWhere('doctor.id NOT IN (6581, 6582, 24287, 29048, 29117, 8507, 32877)');

        // Apply IDs filter
        if (ids && ids.length > 0) {
            doctorQb.andWhereInIds(ids);
        }

        // OnPanel Check
        if (isOnPanelOnly) {
            doctorQb.andWhere('doctor.onPanel = :isOnPanelOnly', { isOnPanelOnly });
        }

        // Apply hospital filter
        if (hospitalId) {
            doctorQb.andWhere('listing_filter.hospitalID = :hospitalId', { hospitalId });
        }

        // Apply speciality filter
        if (specialityIds && specialityIds.length > 0) {
            doctorQb.andWhere(new Brackets(qb => {
                qb.where('listing_filter.specialityId IN (:...specialityIds)', { specialityIds })
                    .orWhere('listing_filter.similarId1 IN (:...specialityIds)', { specialityIds })
                    .orWhere('listing_filter.similarId2 IN (:...specialityIds)', { specialityIds })
                    .orWhere('listing_filter.similarId3 IN (:...specialityIds)', { specialityIds })
                    .orWhere('listing_filter.similarId4 IN (:...specialityIds)', { specialityIds })
                    .orWhere('listing_filter.similarId5 IN (:...specialityIds)', { specialityIds });
            }));
        }

        // Apply service filter
        if (serviceId) {
            doctorQb.innerJoin('servicesdoctor', 'sd', 'sd.dID = doctor.id')
                .andWhere('sd.sID = :serviceId', { serviceId });
        }

        // Apply disease filter
        if (diseaseId) {
            doctorQb.innerJoin(
                'diseases',
                'disease',
                'disease.spID = listing_filter.specialityId AND disease.id = :diseaseId',
                { diseaseId }
            );
        }

        // Apply city/area filters
        if (city) {
            doctorQb.addSelect('listing_filter.hospitalCity', 'hospitalCity')
                .andWhere('listing_filter.hospitalCity = :city', { city });
        }

        if (area) {
            doctorQb.addSelect('listing_filter.hospitalArea', 'hospitalArea')
                .andWhere('listing_filter.hospitalArea = :area', { area });
        }

        // Apply gender filter
        if (gender && gender !== 'all') {
            const genderValue = gender === 'male' ? 1 : 0;
            doctorQb.andWhere('doctor.gender = :genderValue', { genderValue });
        }

        // Apply fee filters
        if (isFree) {
            doctorQb.andWhere('listing_filter.fee = 0');
        } else {
            if (minFee !== undefined) {
                doctorQb.andWhere('listing_filter.fee >= :minFee', { minFee });
            }
            if (maxFee !== undefined) {
                doctorQb.andWhere('listing_filter.fee <= :maxFee', { maxFee });
            }
        }

        // Apply consultationType filter
        if (consultationType) {
            doctorQb.andWhere('listing_filter.hospitalType = :consultationType', { consultationType });
        }

        // Apply availableToday filter
        if (availableToday) {
            const dayjs = require('dayjs');
            const dayOfWeek = dayjs().day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
            const dayColumns = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const todayColumn = dayColumns[dayOfWeek];

            doctorQb.andWhere(`listing_filter.${todayColumn} = 1`);
        }

        // Sort logic
        const direction = sortDirection || (sortBy === 'experience' ? 'DESC' : 'ASC');

        doctorQb.groupBy('doctor.dlID');

        if (sortBy === 'fee') {
            doctorQb.orderBy('listing_filter.fee', direction);
        } else if (sortBy === 'experience') {
            doctorQb.orderBy('doctor.experience', direction);
        } else if (lat && lng) {
            // Haversine formula for distance in kilometers
            doctorQb.addSelect(
                `( 6371 * acos( cos( radians(:lat) ) * cos( radians( listing_filter.lat ) ) * cos( radians( listing_filter.lng ) - radians(:lng) ) + sin( radians(:lat) ) * sin( radians( listing_filter.lat ) ) ) )`,
                'distance'
            )
                .setParameters({ lat, lng })
                .orderBy('distance', 'ASC');
        } else {
            doctorQb.orderBy('doctor.points', 'DESC');
        }

        doctorQb.skip(skip).take(limit);

        // Use getRawAndEntities to get both raw data and entities
        const [{ entities, raw }, count] = await Promise.all([
            doctorQb.getRawAndEntities(),
            doctorQb.getCount()
        ]);

        // Map specialityName and generate complete image URLs
        const doctorsWithSpeciality: DoctorWithSpeciality[] = entities.map((doctor, index) => ({
            ...doctor,
            specialityName: raw[index]?.specialityName || null,
            totalReviews: raw[index]?.totalReviews ? parseInt(raw[index].totalReviews, 10) : 0,
            profilePic: DoctorImageUtil.getDoctorImageUrl(
                this.configService,
                doctor.id,
                doctor.profilePic,
                doctor.gender || 1,
            ),
        }));

        // Fetch Areas of Interest for all doctors
        const doctorIds = doctorsWithSpeciality.map(d => d.id);
        const areasOfInterestMap = await this.getAreasOfInterestByDoctorIds(doctorIds);

        // Assign Areas of Interest
        doctorsWithSpeciality.forEach(doctor => {
            doctor.areasOfInterest = areasOfInterestMap.get(doctor.id) || [];
        });


        return [doctorsWithSpeciality, count];
    }

    /**
     * Find doctor by ID with specific fields
     */
    async findDoctorProfile(doctorId: number) {
        const queryBuilder = this.createQueryBuilder('doctor')
            .select([
                'doctor.id',
                'doctor.name',
                'doctor.aboutMe',
                'doctor.degree',
                'doctor.experience',
                'doctor.gender',
                'doctor.profilePic',
                'doctor.interview',
                'doctor.onPanel',
                'doctor.averageWaitingTime',
                'doctor.averageAppointmentTime',
                'doctor.diagnosisScore',
                'doctor.staffScore',
                'doctor.rating',
                'doctor.categoryId'
            ])
            .where('doctor.id = :doctorId', { doctorId })
            .andWhere('doctor.activeAt IS NOT NULL')
            .andWhere('doctor.inactiveAt IS NULL');

        // Add reviewsCount using the reusable withCountEntity method
        this.withCountEntity(
            queryBuilder,
            DoctorReview,
            'reviewsCount',
            (qb) => {
                qb.where('review.doctorId = doctor.id')
                    .andWhere('review.deletedAt IS NULL')
                    .andWhere('review.isPublished = :isPublished', { isPublished: 1 });
            },
            'review'
        );

        const doctor = await queryBuilder.getRawAndEntities();

        if (!doctor.entities[0]) {
            return null;
        }

        const entity = doctor.entities[0];
        const raw = doctor.raw[0];

        const result: any = {
            ...entity,
            reviewsCount: parseInt(raw.reviewsCount, 10) || 0,
            profilePic: DoctorImageUtil.getDoctorImageUrl(
                this.configService,
                entity.id,
                entity.profilePic,
                entity.gender || 1,
            ),
            doctorId: entity.id,
            doctorName: entity.name
        };

        // Fetch Areas of Interest
        const areasMap = await this.getAreasOfInterestByDoctorIds([entity.id]);
        result.areasOfInterest = areasMap.get(entity.id) || [];

        return result;
    }

    async getAreasOfInterestByDoctorIds(doctorIds: number[]): Promise<Map<number, string[]>> {
        if (!doctorIds.length) {
            return new Map();
        }

        const rawResults = await this.dataSource.createQueryBuilder()
            .select(['gaoi.title as title', 'daoi.doctor_id as doctorId'])
            .from('global_areas_of_interest', 'gaoi')
            .innerJoin('doctor_areas_of_interest', 'daoi', 'daoi.area_of_interest_id = gaoi.id')
            .where('daoi.doctor_id IN (:...doctorIds)', { doctorIds })
            .andWhere('gaoi.deleted_at IS NULL')
            .getRawMany();

        const map = new Map<number, string[]>();

        rawResults.forEach(row => {
            const doctorId = row.doctorId;
            const title = trim(row.title);
            if (!map.has(doctorId)) {
                map.set(doctorId, []);
            }
            map.get(doctorId)?.push(title);
        });

        return map;
    }

    async getDoctorServices(doctorId: number) {
        return this.dataSource.createQueryBuilder()
            .select(['s.sID as id', 's.service as name'])
            .from('services', 's')
            .innerJoin('servicesdoctor', 'sd', 'sd.sID = s.sID')
            .where('sd.dID = :doctorId', { doctorId })
            .getRawMany();
    }

    async getDoctorDiseases(specialityId: number, limit: number = 10) {
        return this.dataSource.createQueryBuilder()
            .select(['d.id as id', 'd.disease as name'])
            .from('diseases', 'd')
            .where('d.spID = :specialityId', { specialityId })
            .limit(limit)
            .getRawMany();
    }

    async getCategoryName(categoryId: number) {
        if (!categoryId) return null;
        const result = await this.dataSource.query('SELECT catName as name FROM categories WHERE catID = ?', [categoryId]);
        return result.length ? result[0].name : null;
    }

    async getDoctorById(doctorId: number) {
        return await this.findOne({
            where: {
                id: doctorId
            }
        });
    }

    /**
     * Update doctor status
     */
    async updateStatus(doctorId: number, inactiveAt: Date | null): Promise<void> {
        await this.update(doctorId, {
            inactiveAt: inactiveAt,
        });
    }

    async getDoctorDetailsByUserIds(userIds: number[]) {
        if (userIds.length === 0) {
            return [];
        }

        const query = this.dataSource.createQueryBuilder()
            .select([
                'doctor.dlID as id',
                'u.id as userId',
                'doctor.docName as name',
                'doctor.docDegree as degree',
                'doctor.docPic as profilePic',
                'doctor.gender as gender',
                'speciality.name as specialityName',
                'doctor.consultation_city as city',
                'COUNT(DISTINCT review.id) as totalPublishedReviews',
                'COALESCE(doctor.rating, 0) as rating'
            ])
            .from('docdetails', 'doctor')
            .leftJoin('specialities', 'speciality', 'speciality.id = IF(doctor.subspID, doctor.subspID, doctor.spID)')
            .leftJoin('users', 'u', 'u.dID = doctor.dlID')
            .leftJoin('doctor_reviews', 'review', 'review.dID = doctor.dlID AND review.approved_at IS NOT NULL AND review.deleted_at IS NULL')
            .where('u.id IN (:...userIds)', { userIds })
            .groupBy('doctor.dlID');

        return query.getRawMany();
    }

}
