// @ts-nocheck
export class AppointmentResponseDto {
    id: bigint;
    doctorId: number;
    userId: number;
    specialityId: number;
    patientAge: number;
    fee: number;
    appointmentType: number;
    paymentReceived: number;
    onlineConsultationId: number;
    programId: number;
    hospitalId: number;
    lat: number;
    lng: number;
    
    instructions: string;
    doctorProfilePic: string;
    doctorName: string;
    hospitalName: string;
    patientName: string;
    patientPhone: string;
    date: string;
    time: string;
    appointmentStatusTitle: string;
    appointmentSubStatusTitle: string;
    paymentReceivedStatus: string;
    investigationNotes: string;
    historyNotes: string;
    treatmentPlan: string;
    tests: string;
    
    createdAt: Date;
    
    isOnlinePaymentEnabled: boolean;
    isCommutable: boolean;
    canShowCallButton: boolean;
    isLocationVerified: boolean;
}

export class UserAppointmentsResponseDto {
    upcoming: AppointmentResponseDto[];
    previous: AppointmentResponseDto[];
    meta: {
        upcomingCount: number;
        previousCount: number;
        page: number;
        limit: number;
    };
}

export class DoctorAppointmentsResponseDto {
    appointments: AppointmentResponseDto[];
    meta: {
        page: number;
        limit: number;
    };
}