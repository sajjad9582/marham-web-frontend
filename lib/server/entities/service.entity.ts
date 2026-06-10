// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn({ name: 'sID' })
    id: number;

    @Column({ name: 'service' })
    name: string;

    @Column({ name: 'spID', default: 0 })
    specialityId: number;

    @ManyToOne('Speciality')
    @JoinColumn({ name: 'spID' })
    speciality: unknown;

    @Column({ nullable: true })
    slug: string;

    @OneToMany('DoctorService', 'service')
    doctorServices: unknown[];
}
