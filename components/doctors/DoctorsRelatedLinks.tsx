import { formatSlug } from "@/lib/doctors-data";

const HOSPITALS = [
  "Doctors Hospital",
  "Noor Hospital",
  "Evercare Hospital",
  "Shalamar Hospital",
  "Hameed Latif Hospital",
  "Sharif Medical City Hospital",
];

const RELATED_SPECIALITIES = [
  "gynecologist",
  "dermatologist",
  "cardiologist",
  "neurologist",
  "orthopedic-surgeon",
  "psychiatrist",
  "ent-specialist",
  "dentist",
];

const RELATED_CITIES = ["lahore", "karachi", "islamabad", "rawalpindi", "faisalabad", "multan"];

export function DoctorsRelatedLinks({ city, speciality }: { city: string; speciality: string }) {
  const cityName = formatSlug(city);
  const specName = formatSlug(speciality);

  return (
    <section className="space-y-4">
      <div className="bg-white border border-[var(--color-paleblue)] rounded-lg p-5">
        <h2 className="font-bold text-[var(--color-darknavy)] mb-3">Best {specName}s in top Hospitals of {cityName}</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {HOSPITALS.map((h) => (
            <li key={h}>
              <a href="#" className="text-[var(--color-brandblue)] hover:underline">
                Best {specName}s in {h}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-[var(--color-paleblue)] rounded-lg p-5">
          <h2 className="font-bold text-[var(--color-darknavy)] mb-3">Other specialities in {cityName}</h2>
          <ul className="flex flex-wrap gap-2">
            {RELATED_SPECIALITIES.filter((s) => s !== speciality).map((s) => (
              <li key={s}>
                <a
                  href={`/doctors/${city}/${s}`}
                  className="inline-block text-xs px-3 py-1.5 rounded-md bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)] transition-colors"
                >
                  {formatSlug(s)}s in {cityName}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-[var(--color-paleblue)] rounded-lg p-5">
          <h2 className="font-bold text-[var(--color-darknavy)] mb-3">{specName}s in other cities</h2>
          <ul className="flex flex-wrap gap-2">
            {RELATED_CITIES.filter((c) => c !== city).map((c) => (
              <li key={c}>
                <a
                  href={`/doctors/${c}/${speciality}`}
                  className="inline-block text-xs px-3 py-1.5 rounded-md bg-[var(--color-mintgreen)] text-[var(--color-darknavy)] hover:bg-[var(--color-lightgreen)] transition-colors"
                >
                  {specName}s in {formatSlug(c)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
