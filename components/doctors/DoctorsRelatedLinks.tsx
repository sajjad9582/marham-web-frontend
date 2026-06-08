import { formatSlug } from "@/lib/doctors-data";
import { getDoctorsRelatedLinks } from "@/lib/get-doctors-related-links";
import type { ResolvedRelatedLink } from "@/lib/get-doctors-related-links";

function RelatedLinksSection({
  title,
  links,
}: {
  title: string;
  links: ResolvedRelatedLink[];
}) {
  if (links.length === 0) return null;

  return (
    <div className="bg-white border border-[var(--color-paleblue)] rounded-lg p-5">
      <h2 className="font-bold text-[var(--color-darknavy)] mb-3">{title}</h2>
      <ul className="grid sm:grid-cols-2 gap-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              rel="noopener noreferrer"
              className="text-[var(--color-brandblue)] hover:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DoctorsRelatedLinks({ city, speciality }: { city: string; speciality: string }) {
  const cityName = formatSlug(city);
  const specName = formatSlug(speciality);
  const { hospitals, areas, diseases, cities } = getDoctorsRelatedLinks(city, speciality);

  return (
    <section className="space-y-4">
      <RelatedLinksSection
        title={`Best ${specName}s in top Hospitals of ${cityName}`}
        links={hospitals}
      />
      <RelatedLinksSection title={`${specName} Near You`} links={areas} />
      <RelatedLinksSection title={`${specName} Related Diseases`} links={diseases} />
      <RelatedLinksSection
        title={`Best ${specName} in other cities of Pakistan`}
        links={cities}
      />
    </section>
  );
}
