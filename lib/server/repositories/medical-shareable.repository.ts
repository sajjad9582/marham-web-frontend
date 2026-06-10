// @ts-nocheck
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import { selectFields } from '@/lib/server/utils/select-fields';
import { MedicalShareable } from '@/lib/server/entities';

export class MedicalShareableRepository extends BaseRepository<MedicalShareable> {
    constructor(private dataSource: DataSource) {
        super(MedicalShareable, dataSource.createEntityManager());
    }

    async findFavoriteDoctorIds(userId: number): Promise<number[]> {
        const favorites = await this.find({
            where: {
                userId,
                objectType: 'App\\Models\\Docdetail',
                type: 1
            },
            select: selectFields(['objectId'])
        });

        return favorites.map(f => f.objectId);
    }

    async isDoctorFavorited(userId: number, doctorId: number): Promise<boolean> {
        return !!(await this.findFavorite(userId, doctorId));
    }

    async findFavorite(userId: number, doctorId: number): Promise<MedicalShareable | null> {
        return this.findOne({
            where: {
                userId,
                objectId: doctorId,
                objectType: 'App\\Models\\Docdetail',
                type: 1,
            },
        });
    }

    async createFavorite(data: Partial<MedicalShareable>): Promise<MedicalShareable> {
        const favorite = this.create(data);
        return this.save(favorite);
    }
}
