// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'socialUserID', nullable: true })
    socialUserId: string;

    @Column({ name: 'dID', default: 0 })
    doctorId: number;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    password: string;

    @Column({ name: 'password_text', nullable: true })
    passwordText: string;

    @Column({ name: 'FName', nullable: true })
    fName: string;

    @Column({ name: 'LName', nullable: true })
    lName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: 'isDoctor', width: 1, default: 0, type: 'tinyint' })
    isDoctor: boolean;

    @Column({ name: 'isAssistant', width: 1, default: 0, type: 'tinyint' })
    isAssistant: boolean;

    @Column({ name: 'is_hospital_assistant', width: 1, default: 0, type: 'tinyint' })
    isHospitalAssistant: boolean;

    @Column({ name: 'is_hospital_admin', width: 1, default: 0, type: 'tinyint' })
    isHospitalAdmin: boolean;

    @Column({ name: 'canComment', width: 1, default: 1, type: 'tinyint' })
    canComment: boolean;

    @Column({ width: 1, default: 1, type: 'tinyint' })
    approved: boolean;

    @Column({ nullable: true })
    request: string;

    @Column({ width: 1, default: 0, type: 'tinyint' })
    schedular: boolean;

    @Column({ name: 'schedularsettingschanged', width: 1, default: 0, type: 'tinyint' })
    schedularSettingsChanged: boolean;

    @Column({ name: 'wizardcompleted', width: 1, default: 0, type: 'tinyint' })
    wizardCompleted: boolean;

    @Column({ name: 'remember_token', nullable: true, length: 100 })
    rememberToken: string;

    @Column({ name: 'firstLogin', default: 1 })
    firstLogin: number;

    @Column({ width: 1, default: 0, type: 'tinyint' })
    verified: boolean;

    @Column({ width: 1, default: 1, type: 'tinyint' })
    notification: boolean;

    @Column({ name: 'extprofile', width: 1, default: 0, type: 'tinyint' })
    extProfile: boolean;

    @Column({ nullable: true, length: 1000 })
    avatar: string;

    @Column({ name: '_dtoken', nullable: true })
    dToken: string;

    @Column({ name: 'is_email_unsubscribe', width: 1, default: 0, type: 'tinyint' })
    isEmailUnsubscribe: boolean;

    @Column({ width: 1, default: 0, type: 'tinyint' })
    emr: boolean;

    @Column({ name: 'users_emr_steps', width: 1, default: 0, type: 'tinyint' })
    usersEmrSteps: boolean;

    @Column({ name: 'user_weight_loss_program', default: 0, type: 'tinyint' })
    userWeightLossProgram: number;

    @Column({ name: 'special_discount', default: 0 })
    specialDiscount: number;

    @Column({ default: 10 })
    type: number;

    @Column({ name: 'updated_by', default: '0' })
    updatedBy: string;

    @Column({ nullable: true })
    gender: number;

    @Column({ name: 'marital_status', nullable: true })
    maritalStatus: number;

    @Column({ name: 'date_of_birth', type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ name: 'access_token', nullable: true, length: 50 })
    accessToken: string;

    @Column({ type: 'longtext', nullable: true })
    rights: string;

    @Column({ type: 'longtext', nullable: true })
    wallet: string;

    @Column({ name: 'easypaisa_open_id', nullable: true })
    easypaisaOpenId: string;

    @Column({ nullable: true })
    cnic: string;

    @Column({ name: 'ext_profile_created_at', type: 'timestamp', nullable: true })
    extProfileCreatedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    get role(): string {
        if (this.isDoctor && this.doctorId) {
            return 'doctor';
        }
        return 'user';
    }
}

