import { DataSource } from 'typeorm';
import { OnlineConsultation } from '@/lib/server/entities';
import { BaseRepository } from '@/lib/server/repositories/base.repository';

export class OnlineConsultationRepository extends BaseRepository<OnlineConsultation> {
    constructor(private dataSource: DataSource) {
        super(OnlineConsultation, dataSource.createEntityManager());
    }

    async getAppointmentIdByOrderId(orderId: number): Promise<bigint | undefined> {
        const result = await this.findOneComplete(orderId);
        return result?.appointmentId;
    }

    async findOneComplete(id: number): Promise<OnlineConsultation | null> {
        return this.findOne({
            where: { id }
        });
    }

    async updateById(onlineConsultationId: number, data: Partial<OnlineConsultation>): Promise<void> {
        await this.update({ id: onlineConsultationId }, data);
    }

    async updateWalletDetails(consultationId: number, walletAmount: number, walletAmountDetail: any): Promise<void> {
        await this.update(
            { id: consultationId },
            { walletAmount, walletAmountDetail }
        );
    }
}

