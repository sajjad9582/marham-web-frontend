import { getConfig } from "@/lib/db/config";

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
