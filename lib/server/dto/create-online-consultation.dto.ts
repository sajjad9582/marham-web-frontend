export class CreateOnlineConsultationDto {
  id?: number;
  doctorId!: number;
  date!: string;
  time!: string;
  userId!: number;
  appType!: number;
  deviceType!: number;
  agreedForBooking?: string;
  area?: string;
  city?: string;
  country?: string;
  patientName?: string;
  promoCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  visitorSource?: string;
}
