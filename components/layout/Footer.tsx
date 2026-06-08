import { MARHAM_HOME_URL } from "@/lib/constants/navigation";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Terms & Policies", href: `${MARHAM_HOME_URL}/termsofuse-privacy` },
  { label: "About Us", href: `${MARHAM_HOME_URL}/about` },
  { label: "Doctors", href: `${MARHAM_HOME_URL}/doctors` },
  { label: "All Cities", href: `${MARHAM_HOME_URL}/doctors/cities` },
  { label: "All Doctors", href: `${MARHAM_HOME_URL}/doctors/all` },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-paleblue)] border-t border-[var(--color-mistblue)] mt-2 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 ">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm font-medium text-[var(--color-brandblue)] hover:text-[var(--color-darknavy)] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-4 text-sm text-black">
          Copyrights @ Marham Inc. All rights reserved since 2016 - {year}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
