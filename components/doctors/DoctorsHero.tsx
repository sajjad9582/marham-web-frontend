import { Phone, Search } from "lucide-react";
import { CITIES, SPECIALITY_QUICK_LINKS, TOTAL_COUNT, formatSlug } from "@/lib/doctors-data";

export function DoctorsHero({
  city,
  speciality,
  totalCount,
}: {
  city: string;
  speciality: string;
  totalCount?: number;
}) {
  const cityName = formatSlug(city);
  const specName = formatSlug(speciality);
  const count = totalCount ?? TOTAL_COUNT;

  return (
    <section className="bg-white border border-[var(--color-paleblue)] rounded-lg p-5 md:p-7 space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-darknavy)]">
          {count} Best {specName}s In {cityName}
        </h1>
        <nav aria-label="Breadcrumb" className="mt-2 text-xs md:text-sm">
          <ol className="flex items-center gap-2 text-[var(--color-brandblue)] flex-wrap">
            <li><a href="/" className="hover:underline">Marham</a></li>
            <li aria-hidden className="text-muted-foreground">›</li>
            <li><a href={`/doctors/${city}/${speciality}`} className="hover:underline">{specName}</a></li>
            <li aria-hidden className="text-muted-foreground">›</li>
            <li className="text-[var(--color-darknavy)]">{specName} in {cityName}</li>
          </ol>
        </nav>
    </section>
  );
}
