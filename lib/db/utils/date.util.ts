import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Register the plugin (mandatory for custom strings)
dayjs.extend(customParseFormat);

export class DateUtil {
    static now(): Date {
        return dayjs().toDate();
    }

    /**
     * Format a Date or date string to a specified format
     * @param date - Date object or date string to format (defaults to current date)
     * @param format - Format string (defaults to 'MMM DD, YYYY')
     * 
     * Common formats:
     * - 'MM/DD/YYYY' - e.g., "12/23/2025"
     * - 'DD/MM/YYYY' - e.g., "23/12/2025"
     * - 'YYYY-MM-DD' - e.g., "2025-12-23"
     * - 'MMM DD, YYYY' - e.g., "Dec 23, 2025"
     * - 'DD MMM YYYY' - e.g., "23 Dec 2025"
     * 
     * @returns Formatted date string
     */
    static formatDate(date?: Date | string, format?: string): string {
        const targetDate = date || new Date();
        return dayjs(targetDate).format(format || 'MMM DD, YYYY');
    }

    /**
     * Format a time string "HH:mm:ss" or Date to "HH:mm AM/PM" e.g., "06:30 AM"
     */
    static formatTime(time: string | Date, format?: string): string {
        if (typeof time === 'string') {
            // Assume "HH:mm:ss"
            const [hours, minutes] = time.split(':').map(Number);
            const date = dayjs().hour(hours).minute(minutes).second(0);
            return date.format('hh:mm A'); // 12-hour with leading zero
        }
        return dayjs(time).format('hh:mm A');
    }

    /**
     * Get current Unix timestamp
     * @returns Unix timestamp
     */
    static getUnixTimestamp(): number {
        return Math.floor(this.getUnixTimestampInMilliseconds() / 1000);
    }

    static getUnixTimestampInMilliseconds(): number {
        return Date.now();
    }

    /**
     * Convert date string to compact "YYYYMMDDHHmmss" format
     * @param dateTimeString - Optional: Date string, Date object, or timestamp (defaults to current datetime)
     * @param inputFormat - Optional: Specify exact input format if known
     * @returns Formatted string in "YYYYMMDDHHmmss" format (e.g., "20251223160400")
     * 
     * Supported input formats (auto-detected if inputFormat not specified):
     * - 'DD/MM/YYYY hh:mm A' - e.g., "23/12/2025 04:04 PM"
     * - 'MM/DD/YYYY hh:mm A' - e.g., "12/23/2025 04:04 PM"
     * - 'YYYY-MM-DD HH:mm:ss' - e.g., "2025-12-23 16:04:00"
     * - 'DD/MM/YYYY HH:mm:ss' - e.g., "23/12/2025 16:04:00"
     * - 'MM/DD/YYYY HH:mm:ss' - e.g., "12/23/2025 16:04:00"
     * - 'YYYY-MM-DD HH:mm' - e.g., "2025-12-23 16:04"
     * - ISO 8601 format
     * - Date objects
     * - Unix timestamps (milliseconds)
     * 
     * @example
     * DateUtil.convertToCompactDateTime() // Returns: current datetime in "YYYYMMDDHHmmss" format
     * DateUtil.convertToCompactDateTime("23/12/2025 04:04 PM") // Returns: "20251223160400"
     * DateUtil.convertToCompactDateTime("2025-12-23 16:04:00") // Returns: "20251223160400"
     * DateUtil.convertToCompactDateTime("12/23/2025 04:04 PM") // Returns: "20251223160400"
     * DateUtil.convertToCompactDateTime("23/12/2025 04:04 PM", "DD/MM/YYYY hh:mm A") // Returns: "20251223160400"
     * DateUtil.convertToCompactDateTime(new Date()) // Returns: current datetime in compact format
     * DateUtil.convertToCompactDateTime(1703347440000) // Returns: timestamp converted to compact format
     */
    static convertToCompactDateTime(dateTimeString?: string | Date | number): string {
        if (!dateTimeString) {
            return dayjs().format('YYYYMMDDHHmmss');
        }

        // Handle Unix timestamps
        if (/^\d{10}$/.test(String(dateTimeString))) {
            return dayjs.unix(Number(dateTimeString)).format('YYYYMMDDHHmmss');
        }

        if (/^\d{13}$/.test(String(dateTimeString))) {
            return dayjs(Number(dateTimeString)).format('YYYYMMDDHHmmss');
        }
        const formats = [
            'DD/MM/YYYY hh:mm A',
            'DD/MM/YYYY HH:mm',
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DDTHH:mm:ss',
            'YYYY/MM/DD HH:mm',
            'YYYYMMDDHHmmss'
        ];

        const parsed = dayjs(dateTimeString, formats, true); // strict parsing

        if (!parsed.isValid()) {
            throw new Error(`Invalid date format: ${dateTimeString}`);
        }

        return parsed.format('YYYYMMDDHHmmss');
    }

    /**
     * Convert time string "hh:mm A" to minutes from midnight
     */
    static timeToMinutes(timeStr: string): number {
        if (!timeStr) return 0;
        const formats = ['hh:mm A', 'HH:mm:ss', 'HH:mm'];
        const time = dayjs(timeStr, formats);
        if (!time.isValid()) return 0;
        return time.hour() * 60 + time.minute();
    }

    /**
     * Convert '0000-00-00' or '0000-00-00 00:00:00' date strings to null
     * @param obj - Object or array of objects to normalize
     * @returns Normalized object(s) with null instead of zero dates
     */
    static normalizeDates(obj: any): any {
        if (!obj) return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this.normalizeDates(item));
        }
        if (typeof obj === 'object') {
            const normalized = { ...obj };
            for (const key in normalized) {
                if (normalized.hasOwnProperty(key) && typeof normalized[key] === 'string') {
                    if (normalized[key] === '0000-00-00' || normalized[key] === '0000-00-00 00:00:00') {
                        normalized[key] = null;
                    }
                }
            }
            return normalized;
        }
        return obj;
    }
}
