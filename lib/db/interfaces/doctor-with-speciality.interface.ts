import type { doctors } from "@/lib/db/schema";

type DoctorRow = typeof doctors.$inferSelect;

// Extended Doctor type with joined fields from doclisting
export interface DoctorWithSpeciality extends Omit<DoctorRow, "areaOfInterest"> {
    areasOfInterest?: string | string[];
    specialityName?: string;
    totalReviews?: number;
}
