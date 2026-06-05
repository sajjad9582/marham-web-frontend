import { formatSlug } from "@/lib/doctors-data";

export function buildDoctorsListingMetadata(citySlug: string, specialitySlug: string) {
  const city = formatSlug(citySlug);
  const speciality = formatSlug(specialitySlug);
  const year = new Date().getFullYear();

  return {
    title: `Best ${speciality} in ${city} ${year} | Top ${speciality} | Marham`,
    description: `Book appointment or online video consultation with the best ${speciality.toLowerCase()} in ${city}. Top ${speciality.toLowerCase()} doctors for patients in ${city}.`,
    canonical: `/doctors/${citySlug}/${specialitySlug}`,
  };
}
