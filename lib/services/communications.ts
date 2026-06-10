import { getConfig } from "@/lib/db/config";
import { AppointmentStatus } from "@/lib/db/enums";
import { AppointmentType } from "@/lib/db/enums/appointment-type.enum";

export function sendOnlineConsultationCommunication(params: {
  id: number;
  isConsultationUpdated?: number;
  isPaymentReceived?: number;
  toPatient?: number;
  toDoctor?: number;
  isPrescribed?: number;
}): void {
  const marhamUrl = getConfig("cdn.marhamUrl") as string;
  const url = `${marhamUrl}api/online-consultation/communication`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch((err) => {
    console.error("Communication API failed", err);
  });
}

export function sendAppointmentCommunication(params: {
  id: string | number;
  isAppointmentUpdated?: number;
  isPaymentReceived?: number;
  isDoctor?: number;
  toPatient?: number;
  toDoctor?: number;
  toAssistant?: number;
  voiceMessageToPatient?: number;
  isPrescribed?: number;
}): void {
  const marhamUrl = getConfig("cdn.marhamUrl") as string;
  const url = `${marhamUrl}api/appointment/communication`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch((err) => {
    console.error("Appointment communication API failed", err);
  });
}

export function notifyPhysicalAppointmentCreated(appointment: {
  id: bigint | string | number;
  appointmentType: number;
  appointmentStatus: number;
}): void {
  if (Number(appointment.appointmentType) !== AppointmentType.PHYSICAL) {
    return;
  }

  const id = String(appointment.id);

  if (appointment.appointmentStatus === AppointmentStatus.IN_PROCESS) {
    sendAppointmentCommunication({
      id,
      isAppointmentUpdated: 1,
      isDoctor: 0,
      toPatient: 1,
      toDoctor: 1,
      toAssistant: 1,
      voiceMessageToPatient: 0,
    });
    return;
  }

  if (appointment.appointmentStatus === AppointmentStatus.SCHEDULED) {
    sendAppointmentCommunication({
      id,
      isAppointmentUpdated: 1,
      isDoctor: 1,
      toPatient: 1,
      toDoctor: 1,
      toAssistant: 1,
      voiceMessageToPatient: 0,
    });
  }
}
