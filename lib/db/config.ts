export type ConfigAdapter = { get: typeof getConfig };

const config = {
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "dev_marham_doctordb",
    logging: process.env.DB_LOGGING === "true",
    timezone: process.env.DB_TIMEZONE || "+05:00",
  },
  cdn: {
    connectCdnUrl: process.env.CONNECT_CDN_URL || "https://staticconnect.marham.pk/",
    connectPicturesPath: process.env.CONNECT_PICTURES_PATH || "assets/doctors/",
    webCdnUrl: process.env.WEB_CDN_URL || "https://static.marham.pk/",
    defaultMaleImage: "assets/images/doctor-photo-male.webp",
    defaultFemaleImage: "assets/images/doctor-photo-female.webp",
    marhamUrl: process.env.MARHAM_URL || process.env.NEXT_PUBLIC_SITE_URL!,
  },
  marhamPhysicalAppointmentDiscountPercentage: Number(
    process.env.MARHAM_PHYSICAL_APPOINTMENT_DISCOUNT_PERCENTAGE || 0,
  ),
  marhamPhysicalAppointmentOnlinePaymentDiscountPercentage: Number(
    process.env.MARHAM_PHYSICAL_APPOINTMENT_ONLINE_PAYMENT_DISCOUNT_PERCENTAGE || 10,
  ),
  marhamVideoConsultationDiscountPercentage: Number(
    process.env.MARHAM_VIDEO_CONSULTATION_DISCOUNT_PERCENTAGE || 0,
  ),
} as const;

/** Minimal ConfigService-compatible getter for ported MarhamOne code. */
export function getConfig<T = string | number | undefined>(key: string): T {
  const parts = key.split(".");
  let current: unknown = config;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined as T;
    current = (current as Record<string, unknown>)[part];
  }
  return current as T;
}

export const serverConfig = config;
