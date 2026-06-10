// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('diseases')
export class Disease {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  disease: string;

  @Column({ nullable: true })
  detail: string;

  @Column({ name: 'spID', default: 0 })
  spId: number;

  @ManyToOne('Speciality')
  @JoinColumn({ name: 'spID' })
  specialityRelation: unknown;

  @Column({ nullable: true })
  speciality: string;


  @Column({ name: 'diseaseSoundex', nullable: true })
  diseaseSoundex: string;

  @Column({ name: 'dID', default: 0 })
  dId: number;

  @Column({ type: 'float', default: 0 })
  priority: number;

  @Column({ name: 'page_h1', nullable: true })
  pageH1: string;

  @Column({ name: 'listing_h1', nullable: true })
  listingH1: string;

  @Column({ name: 'page_title', nullable: true })
  pageTitle: string;

  @Column({ name: 'listing_title', nullable: true })
  listingTitle: string;

  @Column({ name: 'page_meta_description', nullable: true })
  pageMetaDescription: string;

  @Column({ name: 'listing_meta_description', nullable: true, length: 400 })
  listingMetaDescription: string;

  @Column({ name: 'page_description_urdu', type: 'longtext', nullable: true })
  pageDescriptionUrdu: string;

  @Column({ name: 'page_description_english', type: 'longtext', nullable: true })
  pageDescriptionEnglish: string;

  @Column({ type: 'longtext', nullable: true })
  slug: string;

  @Column({ nullable: true })
  video: string;

  @Column({ type: 'longtext', nullable: true })
  symptoms: string;

  @Column({ type: 'longtext', nullable: true })
  causes: string;

  @Column({ name: 'risk_factors', type: 'longtext', nullable: true })
  riskFactors: string;

  @Column({ name: 'preventive_measures', type: 'longtext', nullable: true })
  preventiveMeasures: string;

  @Column({ type: 'longtext', nullable: true })
  types: string;

  @Column({ name: 'page_faqs', type: 'json', nullable: true })
  pageFaqs: any;

  @Column({ type: 'longtext', nullable: true })
  diagnosis: string;

  @Column({ type: 'longtext', nullable: true })
  treatment: string;

  @Column({ type: 'longtext', nullable: true })
  complication: string;

  @Column({ name: 'medical_check', type: 'longtext', nullable: true })
  medicalCheck: string;

  @Column({ name: 'expert_advice', type: 'longtext', nullable: true })
  expertAdvice: string;

  @Column({ type: 'longtext', nullable: true })
  disclaimer: string;

  @Column({ nullable: true })
  image: string;

  @Column({ name: 'urdu_name', nullable: true })
  urduName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}


