import type { ListingSeoContext } from "@/lib/seo/listing-seo-context";
import { getSpecialitySeoConfig } from "@/lib/seo/speciality-seo-config";
import { buildPublicPath } from "@/lib/urls/site-urls";

type DoctorsHeroProps = {
  context: ListingSeoContext;
};

export function DoctorsHero({ context }: DoctorsHeroProps) {
  const homeUrl = buildPublicPath("/");
  const cityDoctorsUrl = buildPublicPath(`/doctors/${context.citySlug}`);

  return (
    <section className="bg-white border border-[var(--color-paleblue)] rounded-lg px-3 py-2.5 md:p-7 md:space-y-2">
      <h1 className="text-base leading-snug md:text-2xl font-bold text-black">
        {context.meta.total} Best {context.specName}s In {context.cityName}
      </h1>
     
      <nav aria-label="Breadcrumb" className="mt-1 text-[10px] md:mt-2 md:text-sm">
        <ol className="flex items-center gap-1 md:gap-2 text-[var(--color-brandblue)] truncate">
          <li className="shrink-0">
            <a href={homeUrl} className="hover:underline">
              Marham
            </a>
          </li>
          <li aria-hidden className="text-muted-foreground shrink-0">
            ›
          </li>
          <li className="shrink-0">
            <a href={cityDoctorsUrl} className="hover:underline">
              Doctors in {context.cityName}
            </a>
          </li>
          <li aria-hidden className="text-muted-foreground shrink-0">
            ›
          </li>
          <li className="text-[var(--color-darknavy)] truncate">{context.specName}</li>
        </ol>
      </nav>
    </section>
  );
}
