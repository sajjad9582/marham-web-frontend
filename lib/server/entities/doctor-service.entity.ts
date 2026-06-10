// @ts-nocheck
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity('servicesdoctor')
export class DoctorService {
    @Index()
    @Column({ name: 'dID' })
    doctorId: number;

    @Index()
    @Column({ name: 'sID' })
    serviceId: number;

    @Column({ primary: true, select: false, insert: false, update: false, nullable: true })
    _dummy_id: number;

    @ManyToOne('Service', 'doctorServices')
    @JoinColumn({ name: 'sID' })
    service: unknown;
}
