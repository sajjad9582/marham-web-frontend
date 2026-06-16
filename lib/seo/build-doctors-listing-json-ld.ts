import type { Doctor } from "@/lib/doctors-data";
import { buildDoctorProfileUrlFromSlug } from "@/lib/doctors-urls";
import { buildListingFaqs, buildFaqPageJsonLd } from "@/lib/seo/faq-from-listing";
import type { ListingSeoContext } from "@/lib/seo/listing-seo-context";
import { getSpecialitySeoConfig, MARHAM_ORG } from "@/lib/seo/speciality-seo-config";
import { buildPublicPath } from "@/lib/urls/site-urls";

const SCHEMA_PHYSICIAN_LIMIT = 12;

function getPhysicalLocation(doctor: Doctor) {
  return doctor.locations.find((l) => !l.isVideo) ?? doctor.locations[0];
}

function buildPhysicianSchema(doctor: Doctor, cityName: string, medicalSpecialty: string) {
  const location = getPhysicalLocation(doctor);
  const profileUrl = buildDoctorProfileUrlFromSlug(doctor.slug);

  const schema: Record<string, unknown> = {
    "@type": "Physician",
    name: doctor.name,
    url: profileUrl,
    medicalSpecialty,
    address: {
      "@type": "PostalAddress",
      addressLocality: location?.city || cityName,
      addressCountry: "PK",
    },
  };

  if (doctor.profilePic) {
    schema.image = doctor.profilePic;
  }

  if (location?.feeAmount) {
    schema.priceRange = `PKR ${location.feeAmount.toLocaleString("en-PK")}`;
  }

  if (doctor.rating > 0 && doctor.reviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(doctor.rating),
      reviewCount: String(doctor.reviews),
    };
  }

  if (location && !location.isVideo && location.name) {
    schema.hospitalAffiliation = {
      "@type": "Hospital",
      name: location.name.split(",")[0]?.trim() || location.name,
    };
  }

  if (doctor.hasVideoCall) {
    schema.availableService = {
      "@type": "MedicalProcedure",
      name: "Online Video Consultation",
    };
  }

  return schema;
}

function buildHospitalSchemas(doctors: Doctor[], cityName: string): Record<string, unknown>[] {
  const seen = new Set<string>();
  const hospitals: Record<string, unknown>[] = [];

  for (const doctor of doctors.slice(0, SCHEMA_PHYSICIAN_LIMIT)) {
    const location = getPhysicalLocation(doctor);
    if (!location || location.isVideo) continue;

    const hospitalName = location.name.split(",")[0]?.trim();
    if (!hospitalName || seen.has(hospitalName)) continue;
    seen.add(hospitalName);

    hospitals.push({
      "@context": "https://schema.org",
      "@type": "Hospital",
      name: hospitalName,
      address: {
        "@type": "PostalAddress",
        addressLocality: location.city || cityName,
        addressCountry: "PK",
      },
    });
  }

  return hospitals;
}

export function buildDoctorsListingJsonLd(context: ListingSeoContext): Record<string, unknown>[] {
  const config = getSpecialitySeoConfig(context.specialitySlug);
  const faqs = buildListingFaqs(context);
  const topDoctors = context.doctors.slice(0, SCHEMA_PHYSICIAN_LIMIT);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: MARHAM_ORG.name,
    url: MARHAM_ORG.url,
    logo: MARHAM_ORG.logo,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Marham",
        item: MARHAM_ORG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Doctors in ${context.cityName}`,
        item: buildPublicPath(`/doctors/${context.citySlug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: config.displayName,
        item: context.canonicalUrl,
      },
    ],
  };

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `Best ${config.displayName} in ${context.cityName}`,
    url: context.canonicalUrl,
    dateModified: context.dateModified,
    author: {
      "@type": "Organization",
      name: MARHAM_ORG.name,
    },
    reviewedBy: {
      "@type": "Physician",
      name: config.reviewerName,
      medicalSpecialty: config.medicalSpecialty,
    },
  };

  const faqPage = buildFaqPageJsonLd(faqs);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${config.displayName}s in ${context.cityName}`,
    numberOfItems: context.meta.total,
    itemListElement: topDoctors.map((doctor, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildPhysicianSchema(doctor, context.cityName, config.medicalSpecialty),
    })),
  };

  const physicianBlocks = topDoctors.map((doctor) => ({
    "@context": "https://schema.org",
    ...buildPhysicianSchema(doctor, context.cityName, config.medicalSpecialty),
  }));

  const hospitalBlocks = buildHospitalSchemas(topDoctors, context.cityName);

  return [organization, breadcrumb, medicalWebPage, faqPage, itemList, ...physicianBlocks, ...hospitalBlocks];
}
