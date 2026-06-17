import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorsFilterChips } from "@/components/doctors/DoctorsFilters";
import { DoctorsHero } from "@/components/doctors/DoctorsHero";
import { DoctorsList } from "@/components/doctors/DoctorsList";
import { DoctorsRelatedLinks } from "@/components/doctors/DoctorsRelatedLinks";
import { DoctorsSearchBar } from "@/components/doctors/DoctorsSearchBar";
import { DoctorsSeoContent } from "@/components/doctors/DoctorsSeoContent";
import { WhatsAppWidgetConfig } from "@/components/whatsapp";
import { getDoctorsRelatedLinks } from "@/lib/get-doctors-related-links";
import { buildDoctorsListingCanonical } from "@/lib/doctors-metadata";
import { buildDoctorsListingJsonLd } from "@/lib/seo/build-doctors-listing-json-ld";
import { buildDoctorsListingMetadataFromContext } from "@/lib/seo/build-doctors-listing-metadata";
import { buildListingSeoContext } from "@/lib/seo/listing-seo-context";
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

  const filters = parseDoctorsListingFilters({}, { city, specialitySlug: speciality });
  const { doctors, meta } = await getDoctorsListingPageData(filters);
  const related = getDoctorsRelatedLinks(city, speciality);
  const canonicalUrl = buildDoctorsListingCanonical(city, speciality);

  const context = buildListingSeoContext({
    citySlug: city,
    specialitySlug: speciality,
    doctors,
    meta,
    topAreas: related.areas.map((a) => a.label),
    canonicalUrl,
  });

  return buildDoctorsListingMetadataFromContext(context);
}

export default async function SpecialitiesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const safeSlug = slug ?? [];

  const city = safeSlug[0] ?? "lahore";
  const speciality = safeSlug[1] ?? "pediatrician";

  const filters = parseDoctorsListingFilters(resolvedSearchParams, { city, specialitySlug: speciality });
  const { doctors, meta } = await getDoctorsListingPageData(filters);
  const related = getDoctorsRelatedLinks(city, speciality);
  const canonicalUrl = buildDoctorsListingCanonical(city, speciality);

  const context = buildListingSeoContext({
    citySlug: city,
    specialitySlug: speciality,
    doctors,
    meta,
    topAreas: related.areas.map((a) => a.label),
    canonicalUrl,
  });

  const jsonLdBlocks = buildDoctorsListingJsonLd(context);

  return (
    <main className="bg-white min-h-screen">
      <WhatsAppWidgetConfig
        specialityId={filters.specialityId ?? 0}
        pageUrl={canonicalUrl}
      />
      {jsonLdBlocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-2 md:py-6 space-y-2 md:space-y-4">
        <DoctorsHero context={context} />
        <DoctorsSearchBar city={city} speciality={speciality} />
        <Suspense fallback={null}>
          <DoctorsFilterChips city={city} speciality={speciality} />
        </Suspense>
        <DoctorsList
          doctors={doctors}
          meta={meta}
          city={city}
          speciality={speciality}
          filters={filters}
          specName={context.specName}
          cityName={context.cityName}
        />
        <DoctorsSeoContent context={context} />
        <DoctorsRelatedLinks city={city} speciality={speciality} />
      </div>
    </main>
  );
}
