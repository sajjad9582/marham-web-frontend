/** Slug → specialityId map. Extend as new listing routes are added. */
export const SPECIALITY_SLUG_TO_ID: Record<string, number> = {
  pediatrician: 29,
  dermatologist: 12,
  gynecologist: 3,
  psychiatrist: 5,
  psychologist: 6,
  urologist: 8,
  "general-physician": 1,
  gastroenterologist: 11,
  "general-practitioner": 2,
  nutritionist: 7,
};

export const DEFAULT_SPECIALITY_ID = 29;
export const DEFAULT_SPECIALITY_SLUG = "pediatrician";

export function getSpecialityIdFromSlug(slug: string): number {
  return SPECIALITY_SLUG_TO_ID[slug.toLowerCase()] ?? DEFAULT_SPECIALITY_ID;
}

export function slugifySpecialityName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
