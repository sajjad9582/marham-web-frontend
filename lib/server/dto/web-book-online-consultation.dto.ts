export class WebBookOnlineConsultationDto {
  doctorId!: number;
  doctorHospitalId?: number;
  date!: string;
  time!: string;
  patientPhone!: string;
  patientName!: string;
  promoCode?: string;
  appType!: number;
  deviceType!: number;
}
