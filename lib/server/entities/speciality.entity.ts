// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('specialities')
export class Speciality {
    @PrimaryGeneratedColumn({ name: 'spID' })
    id: number;

    @Index('speciality')
    @Column({ name: 'speciality', nullable: true })
    name: string;

    @Column({ name: 'speciality_image', nullable: true })
    image: string;

    @Column({ nullable: true })
    title: string;

    @Column({ name: 'title_2', nullable: true })
    title2: string;

    @Index('speciality_slug')
    @Column({ nullable: true })
    slug: string;

    @Column({ nullable: true })
    detail: string;

    @Column({ nullable: true })
    causes: string;

    @Index('specialitySoundex')
    @Column({ name: 'specialitySoundex', nullable: true })
    specialitySoundex: string;

    @Column({ name: 'urdu_name', length: 1000, nullable: true })
    urduName: string;

    @Index('parent')
    @Column({ default: 0 })
    parent: number;

    @Index('parent_slug')
    @Column({ name: 'parent_slug', nullable: true })
    parentSlug: string;

    @Column({ name: 'seo_h1', nullable: true })
    seoH1: string;

    @Column({ name: 'seo_h2', nullable: true })
    seoH2: string;

    @Column({ name: 'seo_title', nullable: true })
    seoTitle: string;

    @Column({ name: 'seo_meta_description', length: 500, nullable: true })
    seoMetaDescription: string;

    @Column({ name: 'seo_page_description', type: 'mediumtext', nullable: true })
    seoPageDescription: string;

    @Column({ name: 'seo_keywords', nullable: true })
    seoKeywords: string;

    @Column({ name: 'online_consultation_video', nullable: true })
    onlineConsultationVideo: string;

    @Column({ default: 100, nullable: true })
    position: number;

    @Index('redirect_to')
    @Column({ name: 'redirect_to', nullable: true })
    redirectTo: string;

    @Column({ type: 'longtext', nullable: true })
    faqs: string;

    @Column({ type: 'json', nullable: true })
    actions: any;

    @Column({ name: 'algo_status', type: 'tinyint', width: 1, default: 0 })
    algoStatus: number;

    @Column({ name: 'algo_updated_at', type: 'datetime', nullable: true })
    algoUpdatedAt: Date;

    @Index('specialities_algo_updated_by_foreign')
    @Column({ name: 'algo_updated_by', nullable: true })
    algoUpdatedBy: number;

    @Column({ name: 'seo_content', type: 'json', nullable: true })
    seoContent: any;

    @Column({ name: 'about_us_content', type: 'longtext' })
    aboutUsContent: string;

    @Column({ name: 'banner_info', type: 'json', nullable: true })
    bannerInfo: any;

    @Column({ name: 'is_scrapped', type: 'tinyint', width: 3, default: 0, nullable: true })
    isScrapped: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
    updatedAt: Date;

    @OneToMany('SymptomSpeciality', 'speciality')
    specialities: unknown[];
}

