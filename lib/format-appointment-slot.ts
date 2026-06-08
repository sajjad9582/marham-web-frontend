export function parseDisplayTimeTo24Hour(displayTime: string): string {
  const match = displayTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return displayTime.trim();
  }

  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

export function formatBookedSlotDisplay(date: string, displayTime: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  const day = parsed.getDate().toString().padStart(2, "0");
  const month = parsed.toLocaleString("en-US", { month: "short" });
  return `${day} ${month} - ${displayTime}`;
}
