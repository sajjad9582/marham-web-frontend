// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('medical_shareables')
export class MedicalShareable {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ name: 'user_id', type: 'int', default: 0 })
    userId: number;

    @Column({ name: 'shared_by', type: 'int', default: 0 })
    sharedBy: number;

    @Column({ name: 'object_id', type: 'int', nullable: true })
    objectId: number;

    @Column({ name: 'object_type', type: 'varchar', length: 255, nullable: true })
    objectType: string;

    @Column({ name: 'type', type: 'int', default: 0 })
    type: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}

