export type GetDoctorAvailableSlotsDto = {
  doctorId: number;
  hospitalId: number;
  date?: string;
  days?: number;
};
