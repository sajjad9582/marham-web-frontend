// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('symptom_categories')
export class SymptomCategory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'symptom_id' })
  symptomId: number;

  @Column({ name: 'global_symptom_category_id' })
  globalSymptomCategoryId: number;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne('Symptom', 'symptomCategories')
  @JoinColumn({ name: 'symptom_id' })
  symptom: unknown;
}
