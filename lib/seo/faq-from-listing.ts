import type { Doctor } from "@/lib/doctors-data";
import type { ListingSeoContext } from "@/lib/seo/listing-seo-context";
import { getSpecialitySeoConfig } from "@/lib/seo/speciality-seo-config";

export type FaqItem = {
  question: string;
  answer: string;
};

function formatDoctorList(doctors: Doctor[], count: number): string {
  return doctors
    .slice(0, count)
    .map((d, i) => `${i + 1}. ${d.name}`)
    .join("\n");
}

function formatFeeRange(feeMin: number | null, feeMax: number | null): string {
  if (feeMin !== null && feeMax !== null) {
    return `PKR ${feeMin.toLocaleString("en-PK")} to PKR ${feeMax.toLocaleString("en-PK")}`;
  }
  return "PKR 500 to PKR 4,000";
}

function buildPediatricianFaqs(context: ListingSeoContext): FaqItem[] {
  const { cityName, year, doctors } = context;

  return [
    {
      question: `Which symptoms and issues are treated by Pediatricians in ${cityName}?`,
      answer: `Pediatricians specialists in ${cityName} provide the best services and treat issues like Complete Vaccination, Detailed Newborn Examine, Emergency Treatment, Management Of Pediatric Illness, Nutrition Assessment, Short Stature`,
    },
    {
      question: `Who is the best Pediatrician in ${cityName}?`,
      answer: `Following are the best Pediatricians in ${cityName}:\n${formatDoctorList(doctors, 5)}`,
    },
    {
      question: `How to book an appointment with the best doctor in ${cityName}?`,
      answer: `You can book an appointment online by visiting the doctor's profile, or call our Marham helpline: 03111222398 to book your appointment.`,
    },
    {
      question: `How to choose a best child specialist in ${cityName}?`,
      answer: `You can choose the best child specialist based on their experience, patient reviews, services, qualification, and locations.`,
    },
    {
      question: `How much does a Paediatrician cost in ${cityName}?`,
      answer: `The fee of a Paediatrician in ${cityName} ranges from PKR 500 to PKR 4000.`,
    },
    {
      question: `Who is the top paediatrician in ${cityName} ${year}?`,
      answer: `The following are the top paediatrician in ${cityName}:\n${formatDoctorList(doctors, 10)}`,
    },
    {
      question: `How can I find a Pediatrician near me in ${cityName}?`,
      answer: `You can find the best Pediatrician near you in ${cityName} using the "Doctors Near Me" filter. It will show you the nearest Pediatricians as per your location.`,
    },
  ];
}

export function buildListingFaqs(context: ListingSeoContext): FaqItem[] {
  if (context.specialitySlug === "pediatrician") {
    return buildPediatricianFaqs(context);
  }

  const config = getSpecialitySeoConfig(context.specialitySlug);
  const feeText = formatFeeRange(context.feeMin, context.feeMax);

  const servicesAnswer =
    context.doctors[0]?.services?.slice(0, 6).join(", ") ||
    "Complete Vaccination, Detailed Newborn Examine, Emergency Treatment, Management Of Pediatric Illness, Nutrition Assessment, Short Stature";

  return [
    {
      question: `Which symptoms and issues are treated by ${config.displayName}s in ${context.cityName}?`,
      answer: `${config.displayName}s specialists in ${context.cityName} provide the best services and treat issues like ${servicesAnswer}`,
    },
    {
      question: `Who is the best ${config.displayName} in ${context.cityName}?`,
      answer: `Following are the best ${config.displayName}s in ${context.cityName}:\n${formatDoctorList(context.doctors, 5)}`,
    },
    {
      question: `How to book an appointment with the best doctor in ${context.cityName}?`,
      answer: `You can book an appointment online by visiting the doctor's profile, or call our Marham helpline: 03111222398 to book your appointment.`,
    },
    {
      question: `How to choose a best ${config.secondaryKeyword.toLowerCase()} in ${context.cityName}?`,
      answer: `You can choose the best ${config.secondaryKeyword.toLowerCase()} based on their experience, patient reviews, services, qualification, and locations.`,
    },
    {
      question: `How much does a ${config.displayName.toLowerCase()} cost in ${context.cityName}?`,
      answer: `The consultation fee of a ${config.displayName.toLowerCase()} in ${context.cityName} ranges from ${feeText}, depending on the doctor's experience and hospital.`,
    },
    {
      question: `Who is the top ${config.displayName.toLowerCase()} in ${context.cityName} ${context.year}?`,
      answer: `The following are the top ${config.displayName.toLowerCase()} in ${context.cityName}:\n${formatDoctorList(context.doctors, 10)}`,
    },
    {
      question: `How can I find a ${config.displayName} near me in ${context.cityName}?`,
      answer: `You can find the best ${config.displayName} near you in ${context.cityName} using the "Doctors Near Me" filter. It will show you the nearest ${config.displayName}s as per your location.`,
    },
  ];
}

export function buildFaqPageJsonLd(faqs: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
