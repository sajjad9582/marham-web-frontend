import { getAppOrigin } from "@/lib/urls/site-urls";

export {
  buildPublicPath,
  getAppOrigin,
  getPublicSiteUrl,
} from "@/lib/urls/site-urls";

/** @deprecated Use getPublicSiteUrl or getAppOrigin from @/lib/urls/site-urls */
export function getSiteUrl(): string {
  return getAppOrigin();
}
