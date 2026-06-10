import { HttpError } from "@/lib/api/http-error";
import {
  findActiveLeavesByHospitalId,
  getBookedTimeSlotsForDates,
  getDoctorHospitalListings,
} from "@/lib/db/queries/availability";
import type { GetDoctorAvailableSlotsInput } from "@/lib/schemas/doctors";
import { AverageTimePerPatient } from "@/lib/db/enums/average-time-per-patient.enum";
import dayjs from "dayjs";

type TimeSlot = {
  time: string;
  timeSlot: number;
  available: boolean;
};

function parseTime(timeStr: string): [number, number] {
  if (!timeStr) return [0, 0];

  const time12HourMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (time12HourMatch) {
    let hour = parseInt(time12HourMatch[1]);
    const minute = parseInt(time12HourMatch[2]);
    const period = time12HourMatch[3].toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return [hour, minute];
  }

  const time24HourMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (time24HourMatch) {
    return [parseInt(time24HourMatch[1]), parseInt(time24HourMatch[2])];
  }
  return [0, 0];
}

function getDurationInMinutes(averageTimeId: number): number {
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

function generateTimeSlotsSync(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  avgTimePerPatient: number,
  currentDate: Date,
  bookedTimeSlots: Set<number>,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();

  const currentSlotTime = new Date(currentDate);
  currentSlotTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(currentDate);
  endTime.setHours(endHour, endMinute, 0, 0);

  while (currentSlotTime < endTime) {
    if (currentDate.toDateString() === now.toDateString() && currentSlotTime <= now) {
      currentSlotTime.setMinutes(currentSlotTime.getMinutes() + avgTimePerPatient);
      continue;
    }

    const timeSlot = currentSlotTime.getHours() * 100 + currentSlotTime.getMinutes();
    const formattedTime = currentSlotTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (!bookedTimeSlots.has(timeSlot)) {
      slots.push({ time: formattedTime, timeSlot, available: true });
    }

    currentSlotTime.setMinutes(currentSlotTime.getMinutes() + avgTimePerPatient);
  }

  return slots;
}

function deduplicateAndSortSlots(slots: TimeSlot[]): TimeSlot[] {
  const uniqueSlotsMap = new Map<number, TimeSlot>();
  slots.forEach((slot) => {
    if (!uniqueSlotsMap.has(slot.timeSlot)) {
      uniqueSlotsMap.set(slot.timeSlot, slot);
    }
  });
  return Array.from(uniqueSlotsMap.values()).sort((a, b) => a.timeSlot - b.timeSlot);
}

export async function getDoctorAvailableSlots(input: GetDoctorAvailableSlotsInput) {
  const { doctorId, hospitalId, date: startDate, days: daysCount } = input;
  const days = startDate ? 1 : daysCount || 14;

  const doctorListings = await getDoctorHospitalListings(doctorId, hospitalId);

  if (!doctorListings || doctorListings.length === 0) {
    throw new HttpError(
      404,
      `No active listings found for doctor ${doctorId} at hospital ${hospitalId}`,
    );
  }

  const doctorLeaves = await findActiveLeavesByHospitalId(doctorId, hospitalId);

  const hasOnCallListing = doctorListings.some((listing) => listing.onCall);
  if (hasOnCallListing) {
    return {
      message: "Doctor is available on call. Please call at 0311-1222398 to book an appointment.",
      availableSlots: [],
    };
  }

  const start = startDate ? dayjs(startDate) : dayjs();
  const allDates: string[] = [];
  for (let i = 0; i < days; i++) {
    allDates.push(start.add(i, "day").format("YYYY-MM-DD"));
  }

  const bookedSlotsByDate = await getBookedTimeSlotsForDates(
    doctorId,
    hospitalId,
    allDates,
  );

  const availableSlots: { date: string; dayName: string; slots: TimeSlot[] }[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = start.add(i, "day");
    const dayName = currentDate.format("dddd");
    const dayKey = dayName.toLowerCase() as
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    const dateStr = currentDate.format("YYYY-MM-DD");

    const listingsForDay = doctorListings.filter((listing) => {
      if (!listing[dayKey]) return false;

      if (listing.onLeave && listing.onLeaveFrom && listing.onLeaveTo) {
        const leaveFrom = dayjs(listing.onLeaveFrom).format("YYYY-MM-DD");
        const leaveTo = dayjs(listing.onLeaveTo).format("YYYY-MM-DD");
        if (dateStr >= leaveFrom && dateStr <= leaveTo) return false;
      }

      const isOnLeave = doctorLeaves.some((leave) => {
        const leaveFrom = dayjs(leave.leaveFrom).format("YYYY-MM-DD");
        const leaveTo = dayjs(leave.leaveTo).format("YYYY-MM-DD");
        return dateStr >= leaveFrom && dateStr <= leaveTo;
      });

      return !isOnLeave;
    });

    if (listingsForDay.length === 0) {
      if (i === 0 && startDate) return { availableSlots: [] };
      continue;
    }

    const bookedTimeSlotsForDate = bookedSlotsByDate.get(dateStr) || new Set<number>();
    const allSlotsForDay: TimeSlot[] = [];

    for (const listing of listingsForDay) {
      const [startHour, startMinute] = parseTime(listing.startTime ?? "");
      const [endHour, endMinute] = parseTime(listing.endTime ?? "");
      const avgTimePerPatient = listing.averageTimePerPatient
        ? getDurationInMinutes(Number(listing.averageTimePerPatient))
        : 15;

      allSlotsForDay.push(
        ...generateTimeSlotsSync(
          startHour,
          startMinute,
          endHour,
          endMinute,
          avgTimePerPatient,
          currentDate.toDate(),
          bookedTimeSlotsForDate,
        ),
      );
    }

    const uniqueSlots = deduplicateAndSortSlots(allSlotsForDay);

    if (uniqueSlots.length > 0) {
      availableSlots.push({ date: dateStr, dayName, slots: uniqueSlots });
    } else if (i === 0 && startDate) {
      return { availableSlots: [] };
    }
  }

  return { availableSlots };
}
