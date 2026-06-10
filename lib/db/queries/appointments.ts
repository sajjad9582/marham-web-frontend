// @ts-nocheck
import { and, between, count, desc, eq, gt, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appointmentStatuses,
  appointmentSubStatuses,
  doctorListings,
  doctors,
  hospitals,
  onlineConsultations,
  patientAppointments,
} from "@/lib/db/schema";
import { AppointmentStatus } from "@/lib/db/enums/appointment-status.enum";

export type PatientAppointmentRow = typeof patientAppointments.$inferSelect;

const ACTIVE_STATUSES = [
  AppointmentStatus.IN_PROCESS,
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.SHOWED_UP,
];

export async function isFollowUpPatient(
  phone: string,
  doctorId: number,
  startDate: Date,
  endDate: Date,
): Promise<boolean> {
  const result = await db
    .select({ value: count() })
    .from(patientAppointments)
    .where(
      and(
        eq(patientAppointments.patientPhone, phone),
        eq(patientAppointments.doctorId, doctorId),
        inArray(patientAppointments.appointmentStatus, [
          AppointmentStatus.SCHEDULED,
          AppointmentStatus.SHOWED_UP,
        ]),
        between(
          patientAppointments.date,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        ),
      ),
    );
  return (result[0]?.value ?? 0) > 0;
}

export async function getLastFlApptId(hospitalId: number): Promise<number> {
  const rows = await db
    .select({ flApptId: patientAppointments.flApptId })
    .from(patientAppointments)
    .where(eq(patientAppointments.hospitalId, hospitalId))
    .orderBy(desc(patientAppointments.flApptId))
    .limit(1);
  return rows[0]?.flApptId ?? 0;
}

export async function hasDuplicateProcessAppointment(
  phone: string,
  doctorId: number,
  _date: string,
): Promise<boolean> {
  const result = await db
    .select({ value: count() })
    .from(patientAppointments)
    .where(
      and(
        eq(patientAppointments.patientPhone, phone),
        eq(patientAppointments.doctorId, doctorId),
        eq(patientAppointments.appointmentStatus, AppointmentStatus.IN_PROCESS),
        sql`CONCAT(${patientAppointments.date}, " ", ${patientAppointments.time}) > NOW()`,
      ),
    );
  return (result[0]?.value ?? 0) >= 2;
}

export async function createAppointment(
  data: Record<string, unknown>,
): Promise<PatientAppointmentRow> {
  const now = new Date();
  await db.insert(patientAppointments).values({
    ...data,
    createdAt: now,
    updatedAt: now,
  } as typeof patientAppointments.$inferInsert);

  const rows = await db
    .select()
    .from(patientAppointments)
    .where(eq(patientAppointments.id, data.id as bigint))
    .limit(1);
  return rows[0]!;
}

async function loadAppointmentRelations(appointment: PatientAppointmentRow) {
  const [statusRows, subStatusRows, ocRows, doctorRows, hospitalRows, listingRows] =
    await Promise.all([
      db
        .select()
        .from(appointmentStatuses)
        .where(eq(appointmentStatuses.value, appointment.appointmentStatus))
        .limit(1),
      db
        .select()
        .from(appointmentSubStatuses)
        .where(eq(appointmentSubStatuses.value, appointment.appointmentSubStatus))
        .limit(1),
      db
        .select()
        .from(onlineConsultations)
        .where(eq(onlineConsultations.appointmentId, appointment.id))
        .limit(1),
      db
        .select()
        .from(doctors)
        .where(eq(doctors.id, appointment.doctorId))
        .limit(1),
      db
        .select()
        .from(hospitals)
        .where(eq(hospitals.id, appointment.hospitalId))
        .limit(1),
      db
        .select()
        .from(doctorListings)
        .where(eq(doctorListings.id, appointment.doctorHospitalId))
        .limit(1),
    ]);

  return {
    ...appointment,
    statusDetail: statusRows[0] ?? null,
    subStatusDetail: subStatusRows[0] ?? null,
    onlineConsultation: ocRows[0] ?? null,
    doctor: doctorRows[0] ?? null,
    hospital: hospitalRows[0] ?? null,
    doctorListing: listingRows[0] ?? null,
  };
}

export async function findAppointmentDetailed(id: bigint) {
  const rows = await db
    .select()
    .from(patientAppointments)
    .where(eq(patientAppointments.id, id))
    .limit(1);
  if (!rows[0]) return null;
  return loadAppointmentRelations(rows[0]);
}

export async function findAppointmentComplete(id: bigint) {
  return findAppointmentDetailed(id);
}

export async function countAppointmentsByPromoCode(promoCodeId: bigint): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(patientAppointments)
    .where(eq(patientAppointments.promoCodeId, promoCodeId));
  return result[0]?.value ?? 0;
}
