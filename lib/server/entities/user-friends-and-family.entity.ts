// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { RelationType } from '@/lib/server/enums';

@Entity('user_friends_and_family')
export class UserFriendsAndFamily {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string; // BigInt is returned as string in JS/TS usually when using TypeORM

    @Column({ name: 'user_id', type: 'int', default: 0, comment: 'who add friend or family member' })
    userId: number;

    @Column({ name: 'relation_user_id', type: 'int', default: 0, comment: 'target friend or family member' })
    relationUserId: number;

    @Column({
        name: 'relation_type',
        type: 'enum',
        enum: RelationType,
        comment: 'Relation type'
    })
    relationType: RelationType;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date;
}

