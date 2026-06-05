export type Hospital = {
  name: string;
  availability: string;
  fee: string;
  isVideo?: boolean;
  fastConfirm?: boolean;
  discount?: string;
  discountPercentage?: number;
  address?: string;
  city?: string;
  slot?: string;
};

export type Doctor = {
  id: string;
  doctorId: number;
  slug: string;
  specialityId: number;
  specialitySlug: string;
  pageCitySlug: string;
  name: string;
  honorific?: string;
  specialty: string;
  qualifications: string;
  experience: string;
  satisfaction: string;
  reviews: number;
  rating: number;
  isPmc: boolean;
  hasVideoCall: boolean;
  services: string[];
  locations: Hospital[];
  profilePic?: string;
};

export const TOTAL_COUNT = 535;

export const CITIES = ["Lahore", "Karachi", "Islamabad", "Multan", "Peshawar", "Faisalabad", "Sargodha", "Quetta"];

export const SPECIALITY_QUICK_LINKS: { en: string; ur: string }[] = [
  { en: "Dermatologist", ur: "ماہر امراض جلد" },
  { en: "Gynecologist", ur: "ماہر امراض نسواں" },
  { en: "Urologist", ur: "نظامِ اخراج کے ماہر ڈاکٹر" },
  { en: "Gastroenterologist", ur: "معدہ کے ماہر ڈاکٹر" },
  { en: "General Practitioner", ur: "جنرل ڈاکٹر" },
  { en: "Psychiatrist", ur: "ماہر نفسیات" },
  { en: "Pediatrician", ur: "بچوں کے ماہر ڈاکٹر" },
];

export const formatSlug = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const pluralizeSpecialty = (spec: string) => `${spec}s`;
