import { HttpError } from "@/lib/server/http-error";
import { DoctorListingRepository } from "@/lib/server/repositories/doctor-listing.repository";
import { AppointmentRepository } from "@/lib/server/repositories/appointment.repository";
import { DoctorLeaveRepository } from "@/lib/server/repositories/doctor-leave.repository";
import dayjs from "dayjs";
import { AverageTimePerPatient } from "@/lib/server/enums/average-time-per-patient.enum";

export class DoctorAvailabilityService {
    constructor(
        private readonly doctorListingRepository: DoctorListingRepository,
        private readonly appointmentRepository: AppointmentRepository,
        private readonly doctorLeaveRepository: DoctorLeaveRepository,
    ) { }

    async getDoctorAvailableSlots(doctorId: number, hospitalId: number, startDate?: string, daysCount?: number) {
        // If a specific date is provided, only show slots for that date (days = 1)
        // Otherwise, show slots for the next N days (default 14)
        const days = startDate ? 1 : (daysCount || 14);

        // Get ALL doctor hospital listings (a doctor can have multiple schedules at same hospital)
        const doctorListings = await this.doctorListingRepository.getDoctorHospitalListings(doctorId, hospitalId);

        if (!doctorListings || doctorListings.length === 0) {
            throw new HttpError(404, `No active listings found for doctor ${doctorId} at hospital ${hospitalId}`);
        }

        // Fetch all leaves for this doctor and hospital (MEGA OPTIMIZATION!)
        const doctorLeaves = await this.doctorLeaveRepository.findActiveLeavesByHospitalId(doctorId, hospitalId);

        // Check if ANY listing is on-call
        const hasOnCallListing = doctorListings.some(listing => listing.onCall);
        if (hasOnCallListing) {
            return {
                message: 'Doctor is available on call. Please call at 0311-1222398 to book an appointment.',
                availableSlots: []
            };
        }

        // Calculate slots for next N days
        const start = startDate ? dayjs(startDate) : dayjs();

        // Pre-calculate all dates we'll be checking
        const allDates: string[] = [];
        for (let i = 0; i < days; i++) {
            const currentDate = start.add(i, 'day');
            allDates.push(currentDate.format('YYYY-MM-DD'));
        }

        // Fetch all booked appointments for ALL dates at once (MEGA OPTIMIZATION!)
        const bookedSlotsByDate = await this.appointmentRepository.getBookedTimeSlotsForDates(
            doctorId,
            hospitalId,
            allDates
        );

        const availableSlots = [];

        for (let i = 0; i < days; i++) {
            // Ensure we work with the start of the day for date string generation to avoid timezone shifts
            const currentDate = start.add(i, 'day');

            const dayName = currentDate.format('dddd');
            const dayKey = dayName.toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
            const dateStr = currentDate.format('YYYY-MM-DD');

            // Find all listings that work on this day
            const listingsForDay = doctorListings.filter(listing => {
                // Check if doctor works on this day
                if (!listing[dayKey]) {
                    return false;
                }

                // 1. Check if doctor is on leave from doclisting (Legacy Sync support)
                if (listing.onLeave && listing.onLeaveFrom && listing.onLeaveTo) {
                    const leaveFrom = dayjs(listing.onLeaveFrom).format('YYYY-MM-DD');
                    const leaveTo = dayjs(listing.onLeaveTo).format('YYYY-MM-DD');

                    if (dateStr >= leaveFrom && dateStr <= leaveTo) {
                        return false;
                    }
                }

                // 2. Check if doctor has any leave in doctor_leaves table (Multiple leaves support)
                const isOnLeave = doctorLeaves.some(leave => {
                    const leaveFrom = dayjs(leave.leaveFrom).format('YYYY-MM-DD');
                    const leaveTo = dayjs(leave.leaveTo).format('YYYY-MM-DD');
                    return dateStr >= leaveFrom && dateStr <= leaveTo;
                });

                if (isOnLeave) {
                    return false;
                }

                return true;
            });

            // Skip this day if no listings are available
            if (listingsForDay.length === 0) {
                // If specific start date requested and no listings found for it, return empty
                if (i === 0 && startDate) {
                    return { availableSlots: [] };
                }
                continue;
            }

            // Get booked slots for this date (already fetched!)
            const bookedTimeSlotsForDate = bookedSlotsByDate.get(dateStr) || new Set<number>();

            // Generate slots for all listings on this day
            const allSlotsForDay = [];

            for (const listing of listingsForDay) {
                // Parse start and end times
                const [startHour, startMinute] = this.parseTime(listing.startTime);
                const [endHour, endMinute] = this.parseTime(listing.endTime);

                // Calculate average time per patient (default 15 minutes if not set)
                const avgTimePerPatient = listing.averageTimePerPatient
                    ? this.getDurationInMinutes(listing.averageTimePerPatient)
                    : 15;

                // Generate time slots for this listing (passing pre-fetched booked slots)
                const slots = this.generateTimeSlotsSync(
                    dateStr,
                    startHour,
                    startMinute,
                    endHour,
                    endMinute,
                    avgTimePerPatient,
                    currentDate.toDate(),
                    bookedTimeSlotsForDate
                );

                allSlotsForDay.push(...slots);
            }

            // Remove duplicate slots and sort by time
            const uniqueSlots = this.deduplicateAndSortSlots(allSlotsForDay);

            if (uniqueSlots.length > 0) {
                availableSlots.push({
                    date: dateStr,
                    dayName,
                    slots: uniqueSlots
                });
            } else if (i === 0 && startDate) {
                // If specific start date requested and no slots generated, return empty
                return { availableSlots: [] };
            }
        }

        return {
            availableSlots
        };
    }

    /**
     * Remove duplicate time slots and sort them chronologically
     */
    private deduplicateAndSortSlots(slots: any[]): any[] {
        const uniqueSlotsMap = new Map<number, any>();

        slots.forEach(slot => {
            if (!uniqueSlotsMap.has(slot.timeSlot)) {
                uniqueSlotsMap.set(slot.timeSlot, slot);
            }
        });

        return Array.from(uniqueSlotsMap.values()).sort((a, b) => a.timeSlot - b.timeSlot);
    }

    private parseTime(timeStr: string): [number, number] {
        if (!timeStr) return [0, 0];

        // Handle both 12-hour and 24-hour formats
        const time12HourMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (time12HourMatch) {
            let hour = parseInt(time12HourMatch[1]);
            const minute = parseInt(time12HourMatch[2]);
            const period = time12HourMatch[3].toUpperCase();

            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;

            return [hour, minute];
        }

        // 24-hour format
        const time24HourMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (time24HourMatch) {
            return [parseInt(time24HourMatch[1]), parseInt(time24HourMatch[2])];
        }
        return [0, 0];
    }

    private generateTimeSlotsSync(
        date: string,
        startHour: number,
        startMinute: number,
        endHour: number,
        endMinute: number,
        avgTimePerPatient: number,
        currentDate: Date,
        bookedTimeSlots: Set<number>
    ): any[] {
        const slots = [];
        const now = new Date();

        let currentSlotTime = new Date(currentDate);
        currentSlotTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (currentSlotTime < endTime) {
            // Skip past time slots for today
            if (currentDate.toDateString() === now.toDateString() && currentSlotTime <= now) {
                currentSlotTime.setMinutes(currentSlotTime.getMinutes() + avgTimePerPatient);
                continue;
            }

            const timeSlot = currentSlotTime.getHours() * 100 + currentSlotTime.getMinutes();
            const formattedTime = currentSlotTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Check if slot is already booked (using the pre-fetched Set)
            const isBooked = bookedTimeSlots.has(timeSlot);

            // Only add slot if it's not already booked
            if (!isBooked) {
                slots.push({
                    time: formattedTime,
                    timeSlot,
                    available: true
                });
            }

            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + avgTimePerPatient);
        }

        return slots;
    }

    private getDurationInMinutes(averageTimeId: number): number {
        const mapping: Record<number, number> = {
            [AverageTimePerPatient.FIVE_MIN]: 5,
            [AverageTimePerPatient.TEN_MIN]: 10,
            [AverageTimePerPatient.FIFTEEN_MIN]: 15,
            [AverageTimePerPatient.TWENTY_MIN]: 20,
            [AverageTimePerPatient.TWENTY_FIVE_MIN]: 25,
            [AverageTimePerPatient.THIRTY_MIN]: 30,
            [AverageTimePerPatient.THIRTY_MIN_ALT]: 30,
        };
        return mapping[averageTimeId] || 15;
    }
}
