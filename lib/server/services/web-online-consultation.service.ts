import { HttpError } from '@/lib/server/http-error';
import { getConfig } from '@/lib/server/config';

export type ConfigAdapter = { get: typeof getConfig };
import libphonenumber from 'google-libphonenumber';
import { AppType, DeviceType, Program, UserType } from '@/lib/server/enums';

const { PhoneNumberUtil } = libphonenumber;
import { formatPhoneNumber } from '@/lib/server/utils';
import { UsersService } from '@/lib/server/services/users.service';
import { OnlineConsultationService } from './online-consultation.service';
import { CreateOnlineConsultationDto } from '@/lib/server/dto/create-online-consultation.dto';
import { WebBookOnlineConsultationDto } from '@/lib/server/dto/web-book-online-consultation.dto';

export interface WebBookOnlineConsultationResult {
    onlineConsultationId: number;
    programId: number;
    paymentUrl: string;
}

export class WebOnlineConsultationService {
    constructor(
        private readonly usersService: UsersService,
        private readonly onlineConsultationService: OnlineConsultationService,
        private readonly configService: ConfigAdapter = { get: getConfig },
    ) { }

    async bookFromWeb(dto: WebBookOnlineConsultationDto): Promise<WebBookOnlineConsultationResult> {
        const formattedPhone = this.validatePhone(dto.patientPhone);
        const user = await this.resolvePatientUser(formattedPhone, dto.patientName);

        const createDto = new CreateOnlineConsultationDto();
        createDto.doctorId = dto.doctorId;
        createDto.date = dto.date;
        createDto.time = dto.time;
        createDto.userId = user.id;
        createDto.appType = dto.appType ?? AppType.MARHAM;
        createDto.deviceType = dto.deviceType ?? DeviceType.WEB;
        createDto.promoCode = dto.promoCode?.trim() || undefined;

        const result = await this.onlineConsultationService.create(createDto, user);
        const onlineConsultationId = result.onlineConsultationId;

        if (!onlineConsultationId) {
            throw new HttpError(400, 'Failed to create online consultation.');
        }

        return {
            onlineConsultationId,
            programId: Program.ONLINE_CONSULTATION,
            paymentUrl: this.buildPaymentUrl(onlineConsultationId),
        };
    }

    private validatePhone(phone: string): string {
        const formattedPhone = formatPhoneNumber(phone);
        const phoneUtil = PhoneNumberUtil.getInstance();

        try {
            const number = phoneUtil.parseAndKeepRawInput(formattedPhone, 'PK');
            if (!phoneUtil.isValidNumber(number)) {
                throw new HttpError(400, 'Phone Number is Invalid!');
            }
            return formattedPhone;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(400, 'Phone Number is Invalid!');
        }
    }

    private async resolvePatientUser(phone: string, patientName: string) {
        const trimmedName = patientName.trim();
        let user = await this.usersService.findByPhone(phone);

        if (!user) {
            user = await this.usersService.createWithPhone(phone, {
                name: trimmedName,
                type: UserType.SIMPLE_USER,
            });
            return user;
        }

        if (trimmedName && user.name !== trimmedName) {
            await this.usersService.updateProfile(user.id, { name: trimmedName });
            user.name = trimmedName;
        }

        return user;
    }

    private buildPaymentUrl(onlineConsultationId: number): string {
    const baseUrl =
      String(this.configService.get("MARHAM_URL") || this.configService.get("cdn.marhamUrl") || "https://www.marham.pk/");
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        return `${normalizedBase}payment/methods/${Program.ONLINE_CONSULTATION}/${onlineConsultationId}?version=v1`;
    }
}
