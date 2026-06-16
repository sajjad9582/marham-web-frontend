import {
  DOCTORS_RELATED_LINKS_BY_KEY,
  getRelatedLinksConfigKey,
  PEDIATRICIAN_DISEASES,
  TOP_PAKISTAN_CITIES,
} from "@/lib/constants/doctors-related-links";
import { formatSlug } from "@/lib/doctors-data";
import {
  buildLegacyAreaListingUrl,
  buildLegacyCitySpecialityUrl,
  buildLegacyDiseaseCityUrl,
  buildLegacyHospitalSpecialityUrl,
} from "@/lib/doctors-related-links-urls";

export type ResolvedRelatedLink = {
  label: string;
  href: string;
};

export type DoctorsRelatedLinksSections = {
  hospitals: ResolvedRelatedLink[];
  areas: ResolvedRelatedLink[];
  diseases: ResolvedRelatedLink[];
  cities: ResolvedRelatedLink[];
};

export function getDoctorsRelatedLinks(city: string, speciality: string): DoctorsRelatedLinksSections {
  const citySlug = city.toLowerCase();
  const specialitySlug = speciality.toLowerCase();
  const cityName = formatSlug(citySlug);
  const specName = formatSlug(specialitySlug);

  const configKey = getRelatedLinksConfigKey(citySlug, specialitySlug);
  const config =
    DOCTORS_RELATED_LINKS_BY_KEY[configKey] ??
    (specialitySlug === "pediatrician"
      ? DOCTORS_RELATED_LINKS_BY_KEY[getRelatedLinksConfigKey(citySlug, "pediatrician")]
      : undefined);

  const hospitals =
    config?.hospitals.map((hospital) => ({
      label: `Best ${specName}s in ${hospital.label}`,
      href: buildLegacyHospitalSpecialityUrl(
        citySlug,
        hospital.hospitalSlug,
        hospital.areaSlug,
        specialitySlug,
      ),
    })) ?? [];

  const areas =
    config?.areas.map((area) => ({
      label:
        area.label.toLowerCase() === cityName.toLowerCase()
          ? `${specName} in ${cityName}`
          : `${specName} in ${area.label}, ${cityName}`,
      href: buildLegacyAreaListingUrl(citySlug, specialitySlug, area.slug),
    })) ?? [];

  const diseases =
    specialitySlug === "pediatrician"
      ? PEDIATRICIAN_DISEASES.map((disease) => ({
          label: `Best ${disease.label} Doctor in ${cityName}`,
          href: buildLegacyDiseaseCityUrl(disease.slug, citySlug),
        }))
      : [];

  const cities = TOP_PAKISTAN_CITIES.filter((c) => c.slug !== citySlug).map((c) => ({
    label: `Best ${specName} in ${c.label}`,
    href: buildLegacyCitySpecialityUrl(c.slug, specialitySlug),
  }));

  return { hospitals, areas, diseases, cities };
}
