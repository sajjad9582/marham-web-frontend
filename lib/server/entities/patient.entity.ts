// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ name: 'patientName', type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'int', nullable: true })
    age: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    gender: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    symptoms: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    area: string;

    @Column({ name: 'userID', type: 'int', nullable: true })
    userId: number;

    @Column({ name: 'patient_blood_pressure', type: 'varchar', length: 50, nullable: true })
    bloodPressure: string;

    @Column({ name: 'patient_blood_sugar', type: 'float', default: 0 })
    bloodSugar: number;

    @Column({ name: 'patient_height', type: 'float', default: 0 })
    height: number;

    @Column({ name: 'patient_weight', type: 'float', default: 0 })
    weight: number;

    @Column({ name: 'patient_medical_history', type: 'varchar', length: 1000, nullable: true })
    medicalHistory: string;

    @Column({ name: 'patient_family_medical_history', type: 'varchar', length: 1000, nullable: true })
    familyMedicalHistory: string;

    @Column({ name: 'patient_surgeries', type: 'varchar', length: 1000, nullable: true })
    surgeries: string;

    @Column({ name: 'patient_medications', type: 'varchar', length: 1000, nullable: true })
    medications: string;

    @Column({ name: 'patient_conditions', type: 'varchar', length: 1000, nullable: true })
    conditions: string;

    @Column({ name: 'patient_temperature', type: 'varchar', length: 100, nullable: true })
    temperature: string;

    @Column({ name: 'patient_heart_rate', type: 'varchar', length: 100, nullable: true })
    heartRate: string;

    @Column({ name: 'patient_spo2', type: 'varchar', length: 100, nullable: true })
    spo2: string;

    @Column({ name: 'patient_pefr', type: 'varchar', length: 100, nullable: true })
    pefr: string;

    @Column({ name: 'patient_ent', type: 'varchar', length: 100, nullable: true })
    ent: string;

    @Column({ name: 'patient_chest', type: 'varchar', length: 100, nullable: true })
    chest: string;

    @Column({ name: 'patient_address', type: 'varchar', length: 100, nullable: true })
    address: string;

    @Column({ name: 'patient_occupation', type: 'varchar', length: 50, nullable: true })
    occupation: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    disease: string;

    @Column({ name: 'tech_savy', type: 'tinyint', default: 0 })
    techSavy: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    bmi: string;

    @Column({ name: 'preferred_way_of_weightloss', type: 'varchar', length: 255, nullable: true })
    preferredWayOfWeightloss: string;

    @Column({ name: 'desired_weight_loss', type: 'varchar', length: 255, nullable: true })
    desiredWeightLoss: string;

    @Column({ name: 'time_to_lose_weight', type: 'varchar', length: 255, nullable: true })
    timeToLoseWeight: string;

    @Column({ name: 'marital_status', type: 'varchar', length: 255, nullable: true })
    maritalStatus: string;

    @Column({ name: 'personal_history', type: 'longtext', nullable: true })
    personalHistory: string;

    @Column({ name: 'systematic_history', type: 'longtext', nullable: true })
    systematicHistory: string;

    @Column({ name: 'surgical_history', type: 'longtext', nullable: true })
    surgicalHistory: string;

    @Column({ name: 'gyne_and_obs_history', type: 'longtext', nullable: true })
    gyneAndObsHistory: string;

    @Column({ name: 'weightloss_options_tried_in_past', type: 'varchar', length: 255, nullable: true })
    weightlossOptionsTriedInPast: string;

    @Column({ name: 'weightloss_options_tried_in_past_other', type: 'longtext', nullable: true })
    weightlossOptionsTriedInPastOther: string;

    @Column({ name: 'ever_allergic_to_medications', type: 'tinyint', nullable: true })
    everAllergicToMedications: number;

    @Column({ name: 'ever_allergic_to_medications_other', type: 'longtext', nullable: true })
    everAllergicToMedicationsOther: string;

    @Column({ name: 'for_which_you_struggle', type: 'varchar', length: 255, nullable: true })
    forWhichYouStruggle: string;

    @Column({ name: 'for_which_you_struggle_other', type: 'longtext', nullable: true })
    forWhichYouStruggleOther: string;

    @Column({ name: 'interested_in_medications', type: 'tinyint', nullable: true })
    interestedInMedications: number;

    @Column({ name: 'interested_in_medications_other', type: 'longtext', nullable: true })
    interestedInMedicationsOther: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    uuid: string;

    @Column({ name: 'visitor_source', type: 'varchar', length: 50, nullable: true })
    visitorSource: string;

    @Column({ name: 'utm_source', type: 'varchar', length: 255, nullable: true })
    utmSource: string;

    @Column({ name: 'utm_medium', type: 'varchar', length: 255, nullable: true })
    utmMedium: string;

    @Column({ name: 'utm_campaign', type: 'varchar', length: 255, nullable: true })
    utmCampaign: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;
}

