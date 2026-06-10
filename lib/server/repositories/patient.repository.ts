import { DataSource } from 'typeorm';
import { Patient } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class PatientRepository extends BaseRepository<Patient> {
    constructor(private dataSource: DataSource) {
        super(Patient, dataSource.createEntityManager());
    }

    async findOrCreatePatient(data: Partial<Patient>): Promise<Patient> {
        let patient = await this.findOne({
            where: {
                phone: data.phone,
                name: data.name
            }
        });

        if (!patient) {
            const newPatient = this.create({
                name: data.name,
                phone: data.phone,
                userId: data.userId,
                age: data.age,
                city: data.city,
                area: data.area,
                uuid: data.uuid,
                visitorSource: data.visitorSource,
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign
            });
            patient = await this.save(newPatient);
        }
        return patient;
    }
}

