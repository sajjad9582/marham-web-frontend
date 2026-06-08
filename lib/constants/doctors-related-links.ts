import {
  PEDIATRICIAN_GEO_BY_CITY,
  type HospitalLinkSeed,
  type PediatricianGeoConfig,
  type RelatedLinkSeed,
} from "@/lib/constants/pediatrician-geo-by-city";

export type { HospitalLinkSeed, PediatricianGeoConfig, RelatedLinkSeed };

export type DoctorsRelatedLinksConfig = PediatricianGeoConfig;

export const PEDIATRICIAN_DISEASES: RelatedLinkSeed[] = [
  { label: "Meningitis", slug: "meningitis" },
  { label: "Mumps", slug: "mumps" },
  { label: "Hydrocephalus", slug: "hydrocephalus" },
  { label: "Malnutrition", slug: "malnutrition" },
  {
    label: "Attention Deficit Hyperactivity Disorder (Adhd)",
    slug: "attention-deficit-hyperactivity-disorder-adhd",
  },
  { label: "Bedwetting", slug: "bedwetting" },
  { label: "Birth Defects", slug: "birth-defects" },
];

export const TOP_PAKISTAN_CITIES: RelatedLinkSeed[] = [
  { label: "Karachi", slug: "karachi" },
  { label: "Islamabad", slug: "islamabad" },
  { label: "Rawalpindi", slug: "rawalpindi" },
  { label: "Faisalabad", slug: "faisalabad" },
  { label: "Peshawar", slug: "peshawar" },
  { label: "Multan", slug: "multan" },
  { label: "Quetta", slug: "quetta" },
  { label: "Gujranwala", slug: "gujranwala" },
  { label: "Sargodha", slug: "sargodha" },
  { label: "Lahore", slug: "lahore" },
];

export const DOCTORS_RELATED_LINKS_BY_KEY: Record<string, DoctorsRelatedLinksConfig> =
  Object.fromEntries(
    Object.entries(PEDIATRICIAN_GEO_BY_CITY).map(([citySlug, geo]) => [
      `${citySlug}/pediatrician`,
      geo,
    ]),
  );

export function getRelatedLinksConfigKey(citySlug: string, specialitySlug: string): string {
  return `${citySlug.toLowerCase()}/${specialitySlug.toLowerCase()}`;
}
