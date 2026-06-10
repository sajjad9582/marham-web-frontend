export const WAITING_TIME_MAP: Record<number, string> = {
    1: '10 min',
    2: '15 min',
    3: '20 min',
    4: '30 min',
    5: '45 min',
    6: '1 hour',
    7: 'No Waiting Time',
    8: '2 hour',
    9: '3 hour',
    10: '4 hour',
    11: '5 hour',
    12: '6 hour',
    13: 'Less Than 10 mins',
};

export const APPOINTMENT_DURATION_MAP: Record<number, string> = {
    1: '5 min',
    2: '10 min',
    3: '20 min',
    4: '30 min',
    5: '1 hour',
};

export class ReviewMapperUtil {
    static getWaitingTime(value: number): string {
        return WAITING_TIME_MAP[value] || '';
    }

    static getAppointmentDuration(value: number): string {
        return APPOINTMENT_DURATION_MAP[value] || '';
    }
}
