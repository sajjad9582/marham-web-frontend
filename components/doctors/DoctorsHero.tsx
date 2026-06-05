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
      {/* <div className="max-w-6xl mx-auto px-4 pt-6 pb-4"> */}
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-darknavy)]">
          {count} Best {specName}s In {cityName}
        </h1>
        <nav aria-label="Breadcrumb" className="mt-2 text-xs md:text-sm">
          <ol className="flex items-center gap-1.5 text-[var(--color-brandblue)] flex-wrap">
            <li><a href="/" className="hover:underline">Marham</a></li>
            <li aria-hidden className="text-muted-foreground">›</li>
            <li><a href={`/doctors/${city}/${speciality}`} className="hover:underline">{specName}</a></li>
            <li aria-hidden className="text-muted-foreground">›</li>
            <li className="text-[var(--color-darknavy)]">{specName} in {cityName}</li>
          </ol>
        </nav>
      {/* </div> */}

      {/* City pills */}
      {/* <div className="border-t border-[var(--color-paleblue)] bg-[var(--color-washblue)]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 overflow-x-auto">
          <ul className="flex items-center gap-2 min-w-max">
            {CITIES.map((c) => {
              const slug = c.toLowerCase();
              const active = slug === city.toLowerCase();
              return (
                <li key={c}>
                  <a
                    href={`/doctors/${slug}/${speciality}`}
                    className={`inline-block text-xs md:text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                      active
                        ? "bg-[var(--color-brandblue)] text-white"
                        : "bg-white text-[var(--color-brandblue)] border border-[var(--color-paleblue)] hover:bg-[var(--color-paleblue)]"
                    }`}
                  >
                    {c}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div> */}

      {/* Speciality pills with Urdu */}
      {/* <div className="border-t border-[var(--color-paleblue)]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 overflow-x-auto">
          <ul className="flex items-center gap-2 min-w-max">
            {SPECIALITY_QUICK_LINKS.map((s) => {
              const slug = s.en.toLowerCase().replace(/\s+/g, "-");
              const active = slug === speciality.toLowerCase();
              return (
                <li key={s.en}>
                  <a
                    href={`/doctors/${city}/${slug}`}
                    className={`inline-block text-xs md:text-sm px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      active
                        ? "bg-[var(--color-brandblue)] text-white"
                        : "bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)]"
                    }`}
                  >
                    {s.en} - {s.ur}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div> */}
    </section>
  );
}
