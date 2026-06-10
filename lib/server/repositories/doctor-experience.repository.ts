import { DataSource, Not, IsNull } from 'typeorm';
import { DoctorExperience } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class DoctorExperienceRepository extends BaseRepository<DoctorExperience> {
    constructor(private dataSource: DataSource) {
        super(DoctorExperience, dataSource.createEntityManager());
    }

    /**
     * Find hospital listings for doctors
     */
    async getDoctorExperiences(doctorId: number): Promise<DoctorExperience[]> {
        const experienceQb = this.createQueryBuilder('experience')
            .select([
                'experience.id',
                'experience.doctorId',
                'experience.designation',
                'experience.institute',
                'experience.yearFrom',
                'experience.yearTo',
                'experience.years',
            ])
            .where('experience.doctorId = :doctorId', { doctorId });

        experienceQb.orderBy('experience.yearFrom', 'DESC');

        return await experienceQb.getMany();
    }
}
