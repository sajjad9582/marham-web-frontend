import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('appointment_statuses')
export class AppointmentStatus {
    // Note: The original SQL was INT(10), not BIGINT. I am keeping it as 'int' type 
    // for database accuracy, but using 'string' for the TS property name based on your example format.
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ name: 'value', type: 'int', default: 0 })
    value: number;

    @Column({ name: 'title', type: 'varchar', length: 250, nullable: true })
    title: string | null;

    @OneToMany('PatientAppointment', 'statusDetail')
    appointments: unknown[];
}
