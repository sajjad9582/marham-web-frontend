import { and, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctorLeaves, doctorListings, patientAppointments } from "@/lib/db/schema";
import { AppointmentStatus } from "@/lib/db/enums/appointment-status.enum";

export type DoctorListingRow = typeof doctorListings.$inferSelect;
export type DoctorLeaveRow = typeof doctorLeaves.$inferSelect;

const ACTIVE_STATUSES = [
  AppointmentStatus.IN_PROCESS,
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.SHOWED_UP,
];

export async function getDoctorHospitalListings(
  doctorId: number,
  hospitalId: number,
): Promise<DoctorListingRow[]> {
  return db
    .select()
    .from(doctorListings)
    .where(
      and(
        eq(doctorListings.doctorId, String(doctorId)),
        eq(doctorListings.hospitalId, String(hospitalId)),
        isNull(doctorListings.deletedAt),
        isNotNull(doctorListings.activeAt),
        isNull(doctorListings.inactiveAt),
      ),
    )
    .orderBy(doctorListings.startTime);
}

export async function findActiveLeavesByHospitalId(
  doctorId: number,
  hospitalId: number,
): Promise<DoctorLeaveRow[]> {
  return db
    .select()
    .from(doctorLeaves)
    .where(
      and(
        eq(doctorLeaves.doctorId, String(doctorId)),
        eq(doctorLeaves.hospitalId, String(hospitalId)),
      ),
    )
    .orderBy(doctorLeaves.leaveFrom);
}

export async function getBookedTimeSlotsForDates(
  doctorId: number,
  hospitalId: number,
  dates: string[],
): Promise<Map<string, Set<number>>> {
  const bookedSlotsByDate = new Map<string, Set<number>>();
  dates.forEach((date) => bookedSlotsByDate.set(date, new Set<number>()));

  if (dates.length === 0) return bookedSlotsByDate;

  const appointments = await db
    .select({ date: patientAppointments.date, time: patientAppointments.time })
    .from(patientAppointments)
    .where(
      and(
        eq(patientAppointments.doctorId, doctorId),
        eq(patientAppointments.hospitalId, hospitalId),
        sql`${patientAppointments.date} IN (${sql.join(
          dates.map((d) => sql`${d}`),
          sql`, `,
        )})`,
        inArray(patientAppointments.appointmentStatus, ACTIVE_STATUSES),
      ),
    );

  for (const appointment of appointments) {
    if (!appointment.date || !appointment.time) continue;

    const dateStr =
      typeof appointment.date === "string"
        ? appointment.date
        : appointment.date.toISOString().split("T")[0];

    const timeStr = String(appointment.time);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const timeSlot = hours * 100 + minutes;

    const slotsForDate = bookedSlotsByDate.get(dateStr);
    if (slotsForDate) slotsForDate.add(timeSlot);
  }

  return bookedSlotsByDate;
}
