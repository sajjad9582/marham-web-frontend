import { v4 as uuidv4 } from 'uuid';

export class StringUtil {
    static uuid(): string {
        return uuidv4();
    }

    /**
     * Generates a 16-character random lowercase string for access tokens
     * @param length Length of the access token string to generate
     * @returns A random 16-character lowercase string
     */
    static generateAccessToken(length: number): string {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    /**
     * Generates a random alphanumeric string
     * @param length Length of the random string to generate
     * @returns A random alphanumeric string
     */
    static generateRandomString(length: number = 16): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    /**
     * Masks the user name for anonymous reviews (e.g., "John Doe" -> "J.D")
     * @param name The user name to mask
     * @returns The masked name or "Anonymous User"
     */
    static makeNameAnonymous(name: string): string {
        if (!name) return 'Anonymous User';
        
        const nameParts = name.trim().split(' ');
        const firstInitial = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() : '';
        const lastInitial = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() : '';

        if (firstInitial && lastInitial) {
            return `${firstInitial}.${lastInitial}`;
        }
        if (firstInitial) {
            return firstInitial;
        }
        if (lastInitial) {
            return lastInitial;
        }
        
        return 'Anonymous User';
    }

    /**
     * Generates a URL-friendly slug from text
     * @param text The text to convert to a slug
     * @returns A URL-friendly slug
     */
    static generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
