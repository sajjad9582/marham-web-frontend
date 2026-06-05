import { DoctorsFilterChips } from "@/components/doctors/DoctorsFilters";
import { DoctorsHero } from "@/components/doctors/DoctorsHero";
import { DoctorsList } from "@/components/doctors/DoctorsList";
import { DoctorsRelatedLinks } from "@/components/doctors/DoctorsRelatedLinks";
import { DoctorsSearchBar } from "@/components/doctors/DoctorsSearchBar";
import { DoctorsSeoContent } from "@/components/doctors/DoctorsSeoContent";
import { formatSlug } from "@/lib/doctors-data";
import { fetchDoctorsListing } from "@/lib/marham-api";
type PageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function SpecialitiesPage({ params }: PageProps) {
  const { slug } = await params
  const safeSlug = slug ?? []

  // console.log("slug", safeSlug)

  const city = safeSlug[0] ?? ""
  const speciality = safeSlug[1] ?? ""

  const { doctors, meta } = await fetchDoctorsListing({ page: 1 })

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
  }

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-6 space-y-4">
      <DoctorsHero city={city} speciality={speciality} totalCount={meta.total} />
        <DoctorsSearchBar city={city} speciality={speciality} />
        <DoctorsFilterChips />
        <DoctorsList doctors={doctors} meta={meta} />
        <DoctorsSeoContent city={city} speciality={speciality} />
        <DoctorsRelatedLinks city={city} speciality={speciality} />
      </div>
    </main>
  )
}