import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patient_appointment_medicines')
export class PatientAppointmentMedicine {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'appt_id', type: 'bigint', default: 0 })
    appointmentId: string;

    @Column({ name: 'patient_id', type: 'int', default: 0 })
    patientId: number;

    @Column({ name: 'patient_record_id', type: 'int', default: 0 })
    patientRecordId: number;

    @Column({ name: 'medicine_id', type: 'int', default: 0 })
    medicineId: number;

    @Column({ name: 'medicine_title', nullable: true })
    medicineTitle: string;

    @Column({ name: 'time', nullable: true })
    time: string;

    @Column({ name: 'quantity', nullable: true })
    quantity: string;

    @Column({ name: 'instructions', nullable: true, type: 'text' })
    instructions: string;

    @ManyToOne('PatientAppointment', 'medicineList')
    @JoinColumn({ name: 'appt_id', referencedColumnName: 'id' })
    appointment: unknown;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;
}
