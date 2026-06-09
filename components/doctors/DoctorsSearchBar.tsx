"use client";

import { Activity, MapPin, Search, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  SearchAutocomplete,
  type SearchSuggestion,
} from "@/components/doctors/SearchAutocomplete";
import { slugifySpecialityName } from "@/lib/constants/speciality-slugs";
import { CITIES, DOCTOR_SEARCH_ITEMS } from "@/lib/doctors-data";
import { buildLegacyDiseaseCityUrl } from "@/lib/doctors-related-links-urls";
import { toSlug } from "@/lib/slugify";

const specialityIcon = (
  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-mistblue)]">
    <Stethoscope className="h-3.5 w-3.5 text-[var(--color-steelblue)]" aria-hidden />
  </span>
);

const diseaseIcon = (
  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-mistblue)]">
    <Activity className="h-3.5 w-3.5 text-[var(--color-steelblue)]" aria-hidden />
  </span>
);

const citySuggestions: SearchSuggestion[] = CITIES.map((city) => ({
  id: city,
  label: city,
  value: city,
}));

function buildDoctorSuggestions(): SearchSuggestion[] {
  return DOCTOR_SEARCH_ITEMS.map((item) => {
    if (item.kind === "speciality") {
      return {
        id: `speciality-${item.en}`,
        label: `${item.en} - ${item.ur}`,
        value: item.en,
        icon: specialityIcon,
        meta: { kind: "speciality" },
      };
    }

    return {
      id: `disease-${item.slug}`,
      label: item.label,
      value: item.label,
      icon: diseaseIcon,
      meta: { kind: "disease", slug: item.slug },
    };
  });
}

export function DoctorsSearchBar({ city, speciality }: { city: string; speciality: string }) {
  const router = useRouter();
  const [cityInput, setCityInput] = useState(city.replace(/-/g, " "));
  const [specialityInput, setSpecialityInput] = useState(speciality.replace(/-/g, " "));
  const doctorSuggestions = useMemo(() => buildDoctorSuggestions(), []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const citySlug = toSlug(cityInput) || city;
    const specialitySlug = slugifySpecialityName(specialityInput) || speciality;
    router.push(`/doctors/${citySlug}/${specialitySlug}`);
  };

  const handleDoctorSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.meta?.kind !== "disease" || !suggestion.meta.slug) return;
    const citySlug = toSlug(cityInput) || city;
    window.location.href = buildLegacyDiseaseCityUrl(suggestion.meta.slug, citySlug);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="bg-white border border-[var(--color-paleblue)] rounded-md p-2 flex items-stretch gap-2"
    >
      <SearchAutocomplete
        value={cityInput}
        onChange={setCityInput}
        suggestions={citySuggestions}
        placeholder="Enter City"
        ariaLabel="City"
        leadingIcon={<MapPin className="h-4 w-4 shrink-0 text-[var(--color-brandblue)]" aria-hidden />}
      />
      <SearchAutocomplete
        value={specialityInput}
        onChange={setSpecialityInput}
        onSelect={handleDoctorSelect}
        suggestions={doctorSuggestions}
        placeholder="Search by Doctors"
        ariaLabel="Search doctors"
        leadingIcon={<Search className="h-4 w-4 shrink-0 text-[var(--color-brandblue)]" aria-hidden />}
        containerClassName="flex-[2]"
      />
      <button
        type="submit"
        aria-label="Search"
        className="bg-[var(--color-brandblue)] hover:bg-[var(--color-darknavy)] text-white rounded-md px-5 transition-colors flex items-center justify-center"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
