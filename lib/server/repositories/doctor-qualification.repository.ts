import { DataSource, Not, IsNull } from 'typeorm';
import { DoctorQualification } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class DoctorQualificationRepository extends BaseRepository<DoctorQualification> {
    constructor(private dataSource: DataSource) {
        super(DoctorQualification, dataSource.createEntityManager());
    }

    /**
     * Find hospital listings for doctors
     */
    async getDoctorQualifications(doctorId: number): Promise<DoctorQualification[]> {
        const experienceQb = this.createQueryBuilder('qualification')
            .select([
                'qualification.id',
                'qualification.doctorId',
                'qualification.qualification',
                'qualification.institute',
                'qualification.yearFrom',
                'qualification.yearTo',
                'qualification.status',
                // 'qualification.document',
            ])
            .where('qualification.doctorId = :doctorId', { doctorId });

        experienceQb.orderBy('qualification.yearFrom', 'DESC');

        return await experienceQb.getMany();
    }
}
