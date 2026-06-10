import { Doctor } from '@/lib/server/entities';

// Extended Doctor type with joined fields from doclisting
export interface DoctorWithSpeciality extends Omit<Doctor, 'areaOfInterest'> {
    areasOfInterest?: string | string[];
    specialityName?: string;
    totalReviews?: number;
}
