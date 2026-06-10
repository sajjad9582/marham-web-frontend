import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorsFilterChips } from "@/components/doctors/DoctorsFilters";
import { DoctorsHero } from "@/components/doctors/DoctorsHero";
import { DoctorsList } from "@/components/doctors/DoctorsList";
import { DoctorsRelatedLinks } from "@/components/doctors/DoctorsRelatedLinks";
import { DoctorsSearchBar } from "@/components/doctors/DoctorsSearchBar";
import { DoctorsSeoContent } from "@/components/doctors/DoctorsSeoContent";
import { formatSlug } from "@/lib/doctors-data";
import { buildDoctorsListingMetadata } from "@/lib/doctors-metadata";
import { parseDoctorsListingFilters } from "@/lib/parse-doctors-search-params";
import { getDoctorsListingPageData } from "@/lib/services/doctors-listing-page";
import type { DoctorsListingSearchParams } from "@/lib/types/doctors-listing-filters";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<DoctorsListingSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const safeSlug = slug ?? [];
  const city = safeSlug[0] ?? "lahore";
  const speciality = safeSlug[1] ?? "pediatrician";
  const { title, description, canonical } = buildDoctorsListingMetadata(city, speciality);

  return {
    title,
    description,
    alternates: { canonical },
  };
}

export default async function SpecialitiesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const safeSlug = slug ?? [];

  const city = safeSlug[0] ?? "lahore";
  const speciality = safeSlug[1] ?? "pediatrician";

  const filters = parseDoctorsListingFilters(resolvedSearchParams, { city, specialitySlug: speciality });
  const { doctors, meta } = await getDoctorsListingPageData(filters);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${formatSlug(speciality)}s in ${formatSlug(city)}`,
    itemListElement: doctors.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Physician",
        name: d.name,
        medicalSpecialty: d.specialty,
        address: {
          "@type": "PostalAddress",
          addressLocality: formatSlug(city),
        },
      },
    })),
  };

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-2 md:py-6 space-y-2 md:space-y-4">
        <DoctorsHero city={city} speciality={speciality} totalCount={meta.total} />
        <DoctorsSearchBar city={city} speciality={speciality} />
        <Suspense fallback={null}>
          <DoctorsFilterChips city={city} speciality={speciality} />
        </Suspense>
        <DoctorsList doctors={doctors} meta={meta} city={city} speciality={speciality} filters={filters} />
        <DoctorsSeoContent  />
        <DoctorsRelatedLinks city={city} speciality={speciality} />
      </div>
    </main>
  );
}
