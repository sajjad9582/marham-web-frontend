// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('hospitals')
export class Hospital {
    @PrimaryGeneratedColumn({ name: 'hospitalID' })
    id: number;

    @Column({ length: 500 })
    name: string;

    @Column({ length: 255, default: 'Lahore', nullable: true })
    city: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ type: 'double', nullable: true })
    lat: number;

    @Column({ type: 'double', nullable: true })
    lng: number;

    @Column({ length: 255, nullable: true })
    area: string;

    @Column({ name: 'area_slug', length: 255, nullable: true })
    areaSlug: string;

    @Column({ type: 'tinyint', width: 1, default: 1 })
    icu: boolean;

    @Column({ type: 'tinyint', width: 1, default: 1 })
    emergency: boolean;

    @Column({ type: 'tinyint', width: 1, default: 1 })
    ventilator: boolean;

    @Column({ type: 'text', nullable: true })
    phone: string;

    @Column({ name: 'admin_email', length: 255 })
    adminEmail: string;

    @Column({ name: 'assistant_email', length: 255 })
    assistantEmail: string;

    @Column({ name: 'assistant_number', length: 50, nullable: true })
    assistantNumber: string;

    @Column({ name: 'admin_number', length: 50, nullable: true, comment: 'It must be a valid Mobile Number. This number is used to send messages to Hospital Admin when an appointment is booked for doctor' })
    adminNumber: string;

    @Column({ length: 255 })
    soundex: string;

    @Column({ type: 'date', nullable: true })
    timing: Date;

    @Column({ name: '24hourservice', type: 'tinyint', width: 1, default: 1 })
    twentyFourHourService: boolean;

    @Column({ length: 2000 })
    details: string;

    @Column({ name: 'addedbyuser', default: 0 })
    addedByUserId: number;

    @Column({ name: 'start_time', length: 100, nullable: true })
    startTime: string;

    @Column({ name: 'end_time', length: 100, nullable: true })
    endTime: string;

    @Column({ name: 'complete_address', length: 255, nullable: true })
    completeAddress: string;

    @Column({ length: 255, nullable: true, comment: 'Page Title (separate for every Hospital)' })
    title: string;

    @Column({ length: 100, nullable: true })
    video: string;

    @Column({ name: 'about_us', type: 'text', nullable: true })
    aboutUs: string;

    @Column({ name: 'hospitalBanner', length: 255, nullable: true })
    hospitalBanner: string;

    @Column({ name: 'hospitalPic', length: 100, nullable: true })
    hospitalPic: string;

    @Column({ name: 'hospitalPic1', length: 100, nullable: true })
    hospitalPic1: string;

    @Column({ name: 'hospitalPic2', length: 100, nullable: true })
    hospitalPic2: string;

    @Column({ name: 'hospitalPic3', length: 100, nullable: true })
    hospitalPic3: string;

    @Column({ name: 'hospitalPic4', length: 100, nullable: true })
    hospitalPic4: string;

    @Column({ name: 'hospitalPic5', length: 100, nullable: true })
    hospitalPic5: string;

    @Column({ name: 'ext_profile', type: 'tinyint', width: 1, default: 0 })
    extProfile: boolean;

    @Column({ name: 'ext_profile_created_at', type: 'timestamp', nullable: true })
    extProfileCreatedAt: Date;

    @Column({ default: 0 })
    estimated: number;

    @Column({ length: 255, nullable: true })
    slug: string;

    @Column({ name: 'short_url', length: 100, nullable: true })
    shortUrl: string;

    @Column({ length: 50, nullable: true })
    code: string;

    @Column({ name: 'contact_email', length: 255, nullable: true })
    contactEmail: string;

    @Column({ name: 'online_appointment', type: 'tinyint', width: 3, default: 0 })
    onlineAppointment: number;

    @Column({ name: 'last_synced', type: 'timestamp', nullable: true })
    lastSynced: Date;

    @Column({ name: 'seo_h1', length: 255, nullable: true })
    seoH1: string;

    @Column({ name: 'seo_title', length: 255, nullable: true })
    seoTitle: string;

    @Column({ name: 'seo_meta_description', length: 400, nullable: true })
    seoMetaDescription: string;

    @Column({ name: 'seo_page_description', type: 'longtext', nullable: true })
    seoPageDescription: string;

    @Column({ length: 255, nullable: true })
    logo: string;

    @Column({ default: 1, comment: '1 for simple hospital, 2 for online consultation' })
    type: number;

    @Column({ length: 255, default: 'Pakistan', nullable: true })
    country: string;

    @Column({ name: 'branch_of', default: 0, nullable: true })
    branchOf: number;

    @Column({ name: 'canonical_at', length: 255, nullable: true })
    canonicalAt: string;

    @Column({ name: 'verified_address', length: 255, nullable: true })
    verifiedAddress: string;

    @Column({ name: 'verified_by', default: 0, nullable: true, comment: 'Verified by user_id' })
    verifiedBy: number;

    @Column({ name: 'map_url', length: 50, nullable: true, comment: 'Short Url of Hospital Location (Map)' })
    mapUrl: string;

    @Column({ name: 'on_panel', type: 'tinyint', width: 1, default: 0, nullable: true })
    onPanel: boolean;

    @Column({ name: 'location_verified_by', nullable: true })
    locationVerifiedBy: number;

    @Column({ name: 'total_showedups', nullable: true })
    totalShowedUps: number;

    @Column({ type: 'json', nullable: true })
    faqs: any;

    @Column({ type: 'json', nullable: true })
    actions: any;

    @Column({ name: 'is_scrapped', type: 'tinyint', width: 3, default: 0, nullable: true })
    isScrapped: number;

    @Column({ name: 'postal_code', length: 255, nullable: true })
    postalCode: string;

    @Column({ name: 'odoo_id', type: 'int', unsigned: true, nullable: true, comment: 'Odoo contact id for the hospital' })
    odooId: number;

    @Column({ name: 'odoo_updated_at', type: 'timestamp', nullable: true })
    odooUpdatedAt: Date;

    @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
    verifiedAt: Date;

    @Column({ name: 'on_panel_at', type: 'timestamp', nullable: true })
    onPanelAt: Date;

    @Column({ name: 'off_panel_at', type: 'timestamp', nullable: true })
    offPanelAt: Date;

    @Column({ name: 'location_verified_at', type: 'timestamp', nullable: true })
    locationVerifiedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    // @Column({ name: 'scrapped_id', nullable: true })
    // scrappedId: number;

    @OneToMany('DoctorListing', 'hospital')
    doctorListings: unknown[];
}

