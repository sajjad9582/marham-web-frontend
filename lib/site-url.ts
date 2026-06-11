export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_MARHAM_HOME_URL!;
}
