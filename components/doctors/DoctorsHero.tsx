import { TOTAL_COUNT, formatSlug } from "@/lib/doctors-data";

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
    <section className="bg-white border border-[var(--color-paleblue)] rounded-lg px-3 py-2.5 md:p-7 md:space-y-2">
      <h1 className="text-base leading-snug md:text-2xl font-bold text-black">
        {count} Best {specName}s In {cityName}
      </h1>
      <nav aria-label="Breadcrumb" className="mt-1 text-[10px] md:mt-2 md:text-sm">
        <ol className="flex items-center gap-1 md:gap-2 text-[var(--color-brandblue)] truncate">
          <li className="shrink-0"><a href="/" className="hover:underline">Marham</a></li>
          <li aria-hidden className="text-muted-foreground shrink-0">›</li>
          <li className="shrink-0"><a href={`/doctors/${city}/${speciality}`} className="hover:underline">{specName}</a></li>
          <li aria-hidden className="text-muted-foreground shrink-0">›</li>
          <li className="text-[var(--color-darknavy)] truncate">{specName} in {cityName}</li>
        </ol>
      </nav>
    </section>
  );
}
