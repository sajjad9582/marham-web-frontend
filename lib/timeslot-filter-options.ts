export type TimeslotFilterOption = {
  label: string;
  value: string;
};

function formatHourLabel(hour24: number): string {
  const period = hour24 < 12 ? "AM" : "PM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12.toString().padStart(2, "0")}:00 ${period}`;
}

function hour24ToTimeSlot(hour24: number): number {
  return hour24 * 100;
}

/** 24 hourly slots: 01:00 AM through 11:00 PM, then 12:00 AM (midnight). */
export function generateTimeslotFilterOptions(): TimeslotFilterOption[] {
  const options: TimeslotFilterOption[] = [];

  for (let hour24 = 1; hour24 <= 23; hour24++) {
    options.push({
      label: formatHourLabel(hour24),
      value: String(hour24ToTimeSlot(hour24)),
    });
  }

  options.push({ label: "12:00 AM", value: "0" });

  return options;
}

/** Convert timeSlot integer (e.g. 1000) to MySQL TIME string (e.g. "10:00:00"). */
export function timeSlotToTimeString(slot: number): string {
  const hour = Math.floor(slot / 100);
  const minute = slot % 100;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
}
