import { formatSlug } from "@/lib/doctors-data";

export type SpecialitySeoConfig = {
  displayName: string;
  secondaryKeyword: string;
  medicalSpecialty: string;
  urduBlurb: string;
  ogImagePath?: string;
  reviewerName: string;
  reviewerCredentials: string;
};

const DEFAULT_REVIEWER = {
  reviewerName: "Dr. Marham Medical Team",
  reviewerCredentials: "MBBS",
};

const SPECIALITY_SEO: Record<string, SpecialitySeoConfig> = {
  pediatrician: {
    displayName: "Pediatrician",
    secondaryKeyword: "Child Specialist",
    medicalSpecialty: "Pediatrics",
    urduBlurb:
      "لاہور میں بہترین ماہرِ اطفال سے رابطے کے لیے مرہم پر اپائنٹمنٹ بک کریں۔ آپ کلینک میں یا آن لائن ویڈیو مشاورت کے ذریعے بچوں کے ڈاکٹر سے مشورہ لے سکتے ہیں۔",
    ogImagePath: "/assets/og/pediatrician-lahore-1200x630.jpg",
    ...DEFAULT_REVIEWER,
  },
  dermatologist: {
    displayName: "Dermatologist",
    secondaryKeyword: "Skin Specialist",
    medicalSpecialty: "Dermatology",
    urduBlurb: "مرہم پر بہترین ماہر امراض جلد سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  gynecologist: {
    displayName: "Gynecologist",
    secondaryKeyword: "Women's Health Specialist",
    medicalSpecialty: "Gynecology",
    urduBlurb: "مرہم پر بہترین ماہر امراض نسواں سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  psychiatrist: {
    displayName: "Psychiatrist",
    secondaryKeyword: "Mental Health Specialist",
    medicalSpecialty: "Psychiatry",
    urduBlurb: "مرہم پر بہترین ماہر نفسیات سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  psychologist: {
    displayName: "Psychologist",
    secondaryKeyword: "Mental Health Counselor",
    medicalSpecialty: "Psychology",
    urduBlurb: "مرہم پر بہترین ماہر نفسیات سے مشاورت بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  urologist: {
    displayName: "Urologist",
    secondaryKeyword: "Urology Specialist",
    medicalSpecialty: "Urology",
    urduBlurb: "مرہم پر بہترین ماہر امریاض بول سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  "general-physician": {
    displayName: "General Physician",
    secondaryKeyword: "Family Doctor",
    medicalSpecialty: "General Practice",
    urduBlurb: "مرہم پر بہترین جنرل فزیشن سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  gastroenterologist: {
    displayName: "Gastroenterologist",
    secondaryKeyword: "Stomach Specialist",
    medicalSpecialty: "Gastroenterology",
    urduBlurb: "مرہم پر بہترین معدے کے ماہر ڈاکٹر سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  "general-practitioner": {
    displayName: "General Practitioner",
    secondaryKeyword: "GP Doctor",
    medicalSpecialty: "General Practice",
    urduBlurb: "مرہم پر بہترین جنرل ڈاکٹر سے اپائنٹمنٹ بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
  nutritionist: {
    displayName: "Nutritionist",
    secondaryKeyword: "Diet Specialist",
    medicalSpecialty: "Nutrition",
    urduBlurb: "مرہم پر بہترین نیوٹریشنسٹ سے مشاورت بک کریں۔",
    ...DEFAULT_REVIEWER,
  },
};

export const MARHAM_ORG = {
  name: "Marham",
  url: "https://www.marham.pk",
  logo: "https://www.marham.pk/assets/images/marham-logo.png",
};


export function getSpecialitySeoConfig(specialitySlug: string): SpecialitySeoConfig {
  const key = specialitySlug.toLowerCase();
  const fallbackName = formatSlug(key);
  return (
    SPECIALITY_SEO[key] ?? {
      displayName: fallbackName,
      secondaryKeyword: fallbackName,
      medicalSpecialty: fallbackName,
      urduBlurb: `مرہم پر بہترین ${fallbackName} سے اپائنٹمنٹ بک کریں۔`,
      ...DEFAULT_REVIEWER,
    }
  );
}

export function getOgImageUrl(specialitySlug: string, citySlug: string): string {
  const config = getSpecialitySeoConfig(specialitySlug);
  const path =
    config.ogImagePath ?? `/assets/og/${specialitySlug}-${citySlug}-1200x630.jpg`;
  return `https://www.marham.pk${path.startsWith("/") ? path : `/${path}`}`;
}
