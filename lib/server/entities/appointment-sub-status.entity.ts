import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('appointment_sub_statuses')
export class AppointmentSubStatus {
    // Note: The original SQL was INT(10), not BIGINT.
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ name: 'value', type: 'int', default: 0 })
    value: number;

    @Column({ name: 'title', type: 'varchar', length: 50, nullable: true })
    title: string | null;

    @Column({ name: 'text', type: 'varchar', length: 255, nullable: true })
    text: string | null;

    @Column({ name: 'button_text', type: 'varchar', length: 255, nullable: true })
    buttonText: string | null; // Renamed to buttonText (camelCase) for TS style consistency

    @OneToMany('PatientAppointment', 'subStatusDetail')
    appointments: unknown[];
}
