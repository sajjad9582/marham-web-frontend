/** Convert text to URL slug (city, speciality, doctor name). */
export function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Build doctor profile slug from display name (e.g. asst-prof-dr-muhammad-zafar-iqbal). */
export function doctorNameToSlug(name: string): string {
  return toSlug(name);
}
