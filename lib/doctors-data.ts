export type Hospital = {
  name: string;
  availability: string;
  fee: string;
  isVideo?: boolean;
  fastConfirm?: boolean;
  discount?: string;
};

export type Doctor = {
  id: string;
  name: string;
  honorific?: string;
  specialty: string;
  qualifications: string;
  experience: string;
  satisfaction: string;
  reviews: number;
  isPmc: boolean;
  hasVideoCall: boolean;
  services: string[];
  locations: Hospital[];
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

export const getDoctors = (city: string, _speciality: string): Doctor[] => {
  const cityName = formatSlug(city);
  return [
    {
      id: "1",
      name: "Asst. Prof. Dr. Muhammad Zafar Iqbal",
      specialty: "Pediatrician",
      qualifications: "MBBS, FCPS (Paedetrics, Gastroenterologist and hepatologist)",
      experience: "16 Yrs",
      satisfaction: "97%",
      reviews: 111,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care", "Childhood Nutrition", "Childhood Growth & Development", "Nutrition Assessment"],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 2,000", isVideo: true },
        { name: "Children care hospital, Sialkot Road, Gujranwala", availability: "Available from Jun 07", fee: "Rs. 2,000" },
        { name: `Shalamar Hospital, MughalPura, ${cityName}`, availability: "Available Today", fee: "Rs. 2,500" },
        { name: "Khawaja Arshad Hospital, Satellite Town, Sargodha", availability: "Available from Jun 07", fee: "Rs. 2,000" },
        
   ],
    },
    {
      id: "2",
      name: "Dr. Faiza Kaifee",
      specialty: "Pediatrician, Family Medicine",
      qualifications: "MBBS, MCPS (Pediatrics), MCPS (Family Medicine)",
      experience: "25 Yrs",
      satisfaction: "100%",
      reviews: 122,
      isPmc: true,
      hasVideoCall: true,
      services: [],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 2,000", isVideo: true, fastConfirm: true },
        { name: `Dr Faiza Kaifee, DHA, ${cityName}`, availability: "Available Today", fee: "Rs. 3,000", fastConfirm: true },
      ],
    },
    {
      id: "3",
      name: "Prof. Dr. Brig R Lutfullah Goheer",
      specialty: "Pediatrician",
      qualifications: "MBBS, FCPS Paediatrics, MCPS Paediatrics, PGPN, CHPE",
      experience: "30 Yrs",
      satisfaction: "100%",
      reviews: 20,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care", "Childhood Growth & Development", "Neonatology", "Children Infections"],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 2,000", isVideo: true },
        { name: `Pak Clinic, Barki Road, ${cityName}`, availability: "Available Today", fee: "Rs. 2,000" },
      ],
    },
    {
      id: "4",
      name: "Prof. Dr. Hassan Suleman Malik",
      specialty: "Pediatric Gastroenterologist, Pediatrician",
      qualifications: "MBBS, FCPS (Pediatrics), MCPS (Pediatrics), FCPS (Pediatric Gastroenterology & Hepatology)",
      experience: "20 Yrs",
      satisfaction: "95%",
      reviews: 971,
      isPmc: true,
      hasVideoCall: true,
      services: ["Pediatric Gastroentologist"],
      locations: [
        { name: "Video Consultation", availability: "Available Tomorrow", fee: "Rs. 2,000", isVideo: true, fastConfirm: true, discount: "Save 10%" },
        { name: `Childrens Clinic 1, Garden Town, ${cityName}`, availability: "Available Today", fee: "Rs. 4,000", fastConfirm: true },
      ],
    },
    {
      id: "5",
      name: "Dr. Muhammad Shazaib Akhtar",
      specialty: "Pediatrician",
      qualifications: "MBBS, MD Pediatrics",
      experience: "6 Yrs",
      satisfaction: "100%",
      reviews: 102,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care", "Childhood Nutrition", "Childhood Growth & Development", "Nutrition Assessment"],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 500", isVideo: true },
      ],
    },
    {
      id: "6",
      name: "Assoc. Prof. Dr. Haji Gul Afridi",
      specialty: "Pediatrician",
      qualifications: "MBBS, FCPS Paediatrics, CHPE",
      experience: "9 Yrs",
      satisfaction: "92%",
      reviews: 10,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care", "Childhood Growth & Development"],
      locations: [
        { name: "Video Consultation", availability: "Available Tomorrow", fee: "Rs. 1,000", isVideo: true },
        { name: "Khyber Medical Center, Jahangir Road, Swabi", availability: "Available Today", fee: "Rs. 700" },
      ],
    },
    {
      id: "7",
      name: "Prof. Dr. Shabir Ahmad",
      specialty: "Pediatrician",
      qualifications: "MBBS, MCPS, FCPS",
      experience: "15 Yrs",
      satisfaction: "98%",
      reviews: 271,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care"],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 2,000", isVideo: true },
        { name: `Sehat medical complex, Lake City, ${cityName}`, availability: "Available Today", fee: "Rs. 3,000", fastConfirm: true },
        { name: `Hameedah Memorial Hospital, Valencia Housing Society, ${cityName}`, availability: "Available Today", fee: "Rs. 3,000", fastConfirm: true },
      ],
    },
    {
      id: "8",
      name: "Dr. Muhammad Shoaib Rasool",
      specialty: "Pediatrician",
      qualifications: "MBBS, FCPS (Pediatrics), MRCP",
      experience: "11 Yrs",
      satisfaction: "94%",
      reviews: 18,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care", "Childhood Growth & Development", "Children Infections", "Vaccination"],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 1,200", isVideo: true },
        { name: `Sardar Bibi Hospital, GT Road, ${cityName}`, availability: "Available Today", fee: "Rs. 2,000" },
      ],
    },
    {
      id: "9",
      name: "Dr. Fatima Farooq",
      specialty: "Pediatrician",
      qualifications: "MBBS, FCPS (Paediatrics)",
      experience: "7 Yrs",
      satisfaction: "95%",
      reviews: 22,
      isPmc: true,
      hasVideoCall: true,
      services: ["General Pediatric Care", "Childhood Growth & Development", "Children Infections", "Fever In Children"],
      locations: [
        { name: "Video Consultation", availability: "Available Today", fee: "Rs. 1,000", isVideo: true, fastConfirm: true },
        { name: `Sharif Medical City Hospital, Jati Umrah, ${cityName}`, availability: "Available from Jun 06", fee: "Rs. 1,000" },
        { name: "Liaqat Family Clinic, Punjab, Faisalabad", availability: "Available Today", fee: "Rs. 1,000" },
      ],
    },
    {
      id: "10",
      name: "Dr. Shahid Aslam",
      specialty: "Pediatrician, Pediatrician",
      qualifications: "MBBS, MRCP(PAED) (UK), MRCPCH (UK)",
      experience: "30 Yrs",
      satisfaction: "97%",
      reviews: 173,
      isPmc: true,
      hasVideoCall: false,
      services: ["General Pediatric Care", "Childhood Nutrition", "Childhood Growth & Development", "Neonatology"],
      locations: [
        { name: `Doctors Hospital, Johar Town, ${cityName}`, availability: "Available Today", fee: "Rs. 3,000" },
      ],
    },
  ];
};
