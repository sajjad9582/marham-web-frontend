import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patient_appointment_tests')
export class PatientAppointmentTest {
    @PrimaryGeneratedColumn({ name: 'patient_appointment_test_id' })
    id: number;

    @Column({ name: 'patient_appointment_id', type: 'bigint' })
    appointmentId: string;

    @Column({ name: 'patient_id', nullable: false, default: 0 })
    patientId: number;

    @Column({ name: 'global_test_id', nullable: false, default: 0 })
    globalTestId: number;

    @Column({ name: 'global_test_title', nullable: true })
    globalTestTitle: string;

    @Column({ name: 'laboratory_id', type: 'int', nullable: true, default: 0 })
    laboratoryId: number;

    @ManyToOne('PatientAppointment', 'testList')
    @JoinColumn({ name: 'patient_appointment_id' })
    appointment: unknown;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;
}
