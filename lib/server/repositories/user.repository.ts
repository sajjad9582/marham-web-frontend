// @ts-nocheck
import { DataSource, In } from 'typeorm';
import { User } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';
import { selectFields } from '@/lib/server/utils/select-fields';

export class UserRepository extends BaseRepository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.findOne({ where: { phone } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ where: { email } });
    }

    async findByEmailOrPhone(email: string, phone: string): Promise<User | null> {
        return this.findOne({
            where: [
                { email },
                { phone }
            ]
        });
    }

    async createAndSave(data: Partial<User>): Promise<User> {
        const user = this.create(data);
        return this.save(user);
    }

    async findByIds(ids: number[]): Promise<User[]> {
        return this.find({
            where: { id: In(ids) as any },
            select: selectFields(['id', 'name', 'phone', 'email', 'gender', 'dateOfBirth', 'verified']),
        });
    }
}
