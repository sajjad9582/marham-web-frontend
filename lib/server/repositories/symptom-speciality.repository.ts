// @ts-nocheck
import { DataSource } from 'typeorm';
import { SymptomSpeciality } from "@/lib/server/entities";
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import { selectFields } from '@/lib/server/utils/select-fields';

export class SymptomSpecialityRepository extends BaseRepository<SymptomSpeciality> {
    constructor(private dataSource: DataSource) {
        super(SymptomSpeciality, dataSource.createEntityManager());
    }

    /**
     * Get all speciality IDs for a given symptom
     */
    async getSpecialityIdsBySymptom(symptomId: number): Promise<number[]> {
        const results = await this.find({
            where: { symptomId },
            select: selectFields(['specialityId'])
        });

        return results.map(r => r.specialityId);
    }
}
