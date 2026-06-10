import libphonenumber from 'google-libphonenumber';

const { PhoneNumberUtil, PhoneNumberFormat } = libphonenumber;

export const formatPhoneNumber = (phone: string, defaultRegion: string = 'PK'): string => {
    const phoneUtil = PhoneNumberUtil.getInstance();
    try {
        // If the number starts with 0 (e.g. 0300...), we assume it's a local number for the default region.
        // If it starts with +, we parse it as is.
        // google-libphonenumber handles parsing well.

        // Ensure string
        let phoneToParse = phone.toString();

        // Basic cleanup (remove spaces, dashes)
        phoneToParse = phoneToParse.replace(/[\s-]/g, '');

        const number = phoneUtil.parseAndKeepRawInput(phoneToParse, defaultRegion);

        if (phoneUtil.isValidNumber(number)) {
            return phoneUtil.format(number, PhoneNumberFormat.E164);
        }

        // If invalid but we can still format it, maybe return original or throw?
        // For now, let's return the original if parsing fails, but the user wants "proper country code".
        // If it fails validation, it might be a bad number.
        return phone;
    } catch (error) {
        return phone;
    }
};

export const isInternationalNumber = (phone: string): boolean => {
    const formatted = formatPhoneNumber(phone);
    return !formatted.startsWith('+92');
};
