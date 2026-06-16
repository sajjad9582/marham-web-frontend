const PRODUCTION_SITE_URL = "https://www.marham.pk";

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function getConfiguredSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_MARHAM_HOME_URL?.trim();
  return configured ? normalizeUrl(configured) : PRODUCTION_SITE_URL;
}

/** Canonical public site — always www.marham.pk for links, canonical, and OG in production builds. */
export function getPublicSiteUrl(): string {
  if (isStagingHost()) {
    return normalizeUrl(
      process.env.NEXT_PUBLIC_MARHAM_HOME_URL?.trim() || PRODUCTION_SITE_URL,
    );
  }
  return PRODUCTION_SITE_URL;
}

/** Current deployment origin (devweb or www) — used for metadataBase on staging only. */
export function getAppOrigin(): string {
  return getConfiguredSiteUrl();
}

export function isStagingHost(): boolean {
  if (process.env.NEXT_PUBLIC_IS_STAGING === "true") return true;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.toLowerCase() ?? "";
  return siteUrl.includes("devweb.");
}

export function buildPublicPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteUrl()}${normalizedPath}`;
}
