import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patient_appointment_record_images')
export class PatientRecordFile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'patient_id', type: 'int', nullable: false, default: 0 })
    patientId: number;

    @Column({ name: 'patient_appointment_id', type: 'bigint', nullable: false, default: 0 })
    appointmentId: bigint;

    @Column({ name: 'doctor_id', type: 'int', nullable: false, default: 0 })
    doctorId: number;

    @Column({ name: 'uploaded_by', type: 'int', nullable: false, default: 0 })
    uploadedBy: number;

    @Column({ name: 'ext', nullable: false, length: 10 })
    ext: string;

    @Column({ name: 'nameWithoutExt', nullable: false })
    nameWithoutExt: string;

    @Column({ name: 'attachment', nullable: false })
    attachment: string;

    @ManyToOne('PatientAppointment', 'fileList')
    @JoinColumn({ name: 'patient_appointment_id', referencedColumnName: 'id' })
    appointment: unknown;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;
}
