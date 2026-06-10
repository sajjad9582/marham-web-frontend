import { DataSource } from 'typeorm';
import { UserFriendsAndFamily } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class UserFriendsAndFamilyRepository extends BaseRepository<UserFriendsAndFamily> {
    constructor(private dataSource: DataSource) {
        super(UserFriendsAndFamily, dataSource.createEntityManager());
    }

    async findByUserIdAndRelationUserId(userId: number, relationUserId: number): Promise<UserFriendsAndFamily | null> {
        return this.findOne({
            where: {
                userId,
                relationUserId,
            },
        });
    }

    async createRelation(data: Partial<UserFriendsAndFamily>): Promise<UserFriendsAndFamily> {
        const record = this.create(data);
        return this.save(record);
    }

    async findByIdAndUserId(id: any, userId: number): Promise<UserFriendsAndFamily | null> {
        return this.findOne({
            where: {
                id,
                userId,
            },
        });
    }

    async findAllByUserId(userId: number): Promise<UserFriendsAndFamily[]> {
        return this.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
}
