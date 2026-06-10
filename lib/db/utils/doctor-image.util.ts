import { getConfig } from '@/lib/db/config';

export type ConfigAdapter = { get: typeof getConfig };

/**
 * Utility class for generating doctor image URLs
 */
export class DoctorImageUtil {
    /**
     * Get doctor image URL with optional dimensions
     * @param configService - NestJS ConfigAdapter instance
     * @param doctorId - Doctor ID (dlID)
     * @param profilePic - Profile picture filename (slug)
     * @param gender - Doctor gender (1 = male, 2 = female)
     * @param width - Image width (optional)
     * @param height - Image height (optional)
     * @returns Complete image URL
     */
    static getDoctorImageUrl(
        configService: ConfigAdapter,
        doctorId: number,
        profilePic: string | null,
        gender: number,
        width?: number,
        height?: number,
    ): string {
        if (!profilePic) {
            return this.getDoctorDefaultImage(configService, gender);
        }

        const connectCdnUrl = configService.get<string>('cdn.connectCdnUrl');
        const connectPicturesPath = configService.get<string>('cdn.connectPicturesPath');
        const connectUrl = `${connectCdnUrl}${connectPicturesPath}${doctorId}/`;

        // If dimensions are provided, modify the filename
        if (width && height) {
            const modifiedPic = profilePic.replace('.', `_${width}X${height}.`);
            return `${connectUrl}${modifiedPic}`;
        }

        return `${connectUrl}${profilePic}`;
    }

    /**
     * Get default doctor image based on gender
     * @param configService - NestJS ConfigAdapter instance
     * @param gender - Doctor gender (1 = male, 2 = female)
     * @returns Default image URL
     */
    static getDoctorDefaultImage(
        configService: ConfigAdapter,
        gender: number,
    ): string {
        const webCdnUrl = configService.get<string>('cdn.webCdnUrl');
        const defaultImage = gender === 1
            ? configService.get<string>('cdn.defaultMaleImage')
            : configService.get<string>('cdn.defaultFemaleImage');

        return `${webCdnUrl}${defaultImage}`;
    }
}
