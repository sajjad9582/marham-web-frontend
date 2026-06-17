import { getSpecialityIdFromSlug } from "@/lib/constants/speciality-slugs";

export const WHATSAPP_PHONE = "923111222398";

export type WhatsAppWidgetContext = {
  pageUrl?: string;
  specialityId?: number;
  doctorName?: string;
  doctorId?: string | number;
  doctorOnPanel?: boolean | number;
};

export function normalizeMarhamHomeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function getMarhamHomeUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_MARHAM_HOME_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://www.marham.pk";
  return normalizeMarhamHomeUrl(configured);
}

export function getRequestUrlFromLocation(href: string): string {
  try {
    const parsed = new URL(href);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return href.split("?")[0]?.split("#")[0] ?? href;
  }
}

export function shouldShowWhatsAppWidget(params: {
  currentHref: string;
  marhamHomeUrl: string;
  hour: number;
  doctorName?: string;
  doctorOnPanel?: boolean | number;
}): boolean {
  const { currentHref, marhamHomeUrl, hour, doctorName, doctorOnPanel } = params;
  const normalizedHome = normalizeMarhamHomeUrl(marhamHomeUrl);
  const normalizedCurrent = normalizeMarhamHomeUrl(currentHref);

  const isHomepage =
    normalizedCurrent === normalizedHome ||
    normalizedCurrent === `${normalizedHome}/`;

  if (isHomepage && hour >= 9 && hour < 23) {
    return true;
  }

  if (doctorName && doctorName !== "" && doctorOnPanel == 1) {
    return true;
  }

  if (!isHomepage) {
    return true;
  }

  return false;
}

export function buildWhatsAppChatUrl(context: WhatsAppWidgetContext, pageUrl: string): string {
  const { doctorName, doctorId, doctorOnPanel, specialityId = 0 } = context;

  if (doctorName && doctorName !== "" && doctorOnPanel == 1) {
    const text = `Hi,%0Amujhe%20${doctorName}-${doctorId}%20se%20appointment%20book%20karwani%20hai%20`;
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
  }

  const encodedPageUrl = encodeURIComponent(pageUrl);
  const text = `Hello,%20%0A%20I%20have%20a%20question%20about%20${encodedPageUrl}-${specialityId}`;
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
}

export function parseSpecialityIdFromPathname(pathname: string): number | undefined {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "doctors" || !segments[2]) {
    return undefined;
  }

  return getSpecialityIdFromSlug(segments[2]);
}
