import dayjs from "dayjs";

type AppointmentResponse = {
  date: string;
  time?: string;
};

export class AppointmentUtil {

  /**
   * Sort appointments by date descending, then time descending
   * Used for displaying previous appointments in reverse chronological order
   */
  static sortByDateTimeDesc(appointments: AppointmentResponse[]): AppointmentResponse[] {
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateB - dateA; // Date descending
      }

      // If dates are equal, sort by time descending
      const timeA = a.time ? dayjs(a.time, 'HH:mm').valueOf() : 0;
      const timeB = b.time ? dayjs(b.time, 'HH:mm').valueOf() : 0;
      return timeB - timeA; // Time descending
    });
  }

  static sortByDateTimeAsc(appointments: AppointmentResponse[]): AppointmentResponse[] {
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateA - dateB; // Date ascending
      }

      // If dates are equal, sort by time ascending
      const timeA = a.time ? dayjs(a.time, 'HH:mm').valueOf() : 0;
      const timeB = b.time ? dayjs(b.time, 'HH:mm').valueOf() : 0;
      return timeA - timeB; // Time ascending
    });
  }

}
