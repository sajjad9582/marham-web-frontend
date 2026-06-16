import { getAppOrigin } from "@/lib/urls/site-urls";

export {
  buildPublicPath,
  getAppOrigin,
  getPublicSiteUrl,
  isStagingHost,
  shouldNoIndex,
} from "@/lib/urls/site-urls";

/** @deprecated Use getPublicSiteUrl or getAppOrigin from @/lib/urls/site-urls */
export function getSiteUrl(): string {
  return getAppOrigin();
}
