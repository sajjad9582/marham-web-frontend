"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

const QUICK_CHIPS = [
  { label: "Clear Filters", key: "clear" },
  { label: "Doctors Near Me", key: "nearMe" },
  { label: "Fee Upto 500", key: "maxFee", value: "500" },
  { label: "Top Reviewed", key: "topReviewed", value: "1" },
  { label: "Online Now", key: "consultationType", value: "2" },
] as const;

const DROPDOWNS = [
  {
    label: "Choose a Timeslot",
    key: "availableToday",
    options: [{ label: "Available Today", value: "true" }],
  },
  {
    label: "Fee Range",
    key: "feeRange",
    options: [
      { label: "Below Rs. 1,000", minFee: "0", maxFee: "1000" },
      { label: "Rs. 1,000 - Rs. 2,000", minFee: "1000", maxFee: "2000" },
      { label: "Rs. 2,000 - Rs. 3,000", minFee: "2000", maxFee: "3000" },
      { label: "Rs. 3,000 - Rs. 5,000", minFee: "3000", maxFee: "5000" },
    ],
  },
  {
    label: "Gender",
    key: "gender",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  {
    label: "Discounts",
    key: "discounts",
    options: [{ label: "Get Flat 10% Off", value: "1" }],
  },
] as const;

type DoctorsFilterChipsProps = {
  city: string;
  speciality: string;
};

export function DoctorsFilterChips({ city, speciality }: DoctorsFilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const basePath = `/doctors/${city}/${speciality}`;

  const navigateWithParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  const toggleParam = (key: string, value: string) => {
    const current = searchParams.get(key);
    navigateWithParams({ [key]: current === value ? null : value });
  };

  const isActive = (key: string, value?: string) => {
    if (key === "clear") return false;
    const current = searchParams.get(key);
    if (value !== undefined) return current === value;
    return current !== null;
  };

  const chipClass = (active: boolean) =>
    `text-xs md:text-sm px-3 py-1.5 rounded-md border font-medium transition-colors whitespace-nowrap ${
      active
        ? "border-[var(--color-brandblue)] bg-[var(--color-brandblue)] text-white"
        : "border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)]"
    }`;

  const handleQuickChip = (chip: (typeof QUICK_CHIPS)[number]) => {
    if (chip.key === "clear") {
      router.push(basePath);
      return;
    }

    if (chip.key === "nearMe") {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          navigateWithParams({
            lat: String(pos.coords.latitude),
            lng: String(pos.coords.longitude),
          });
        },
        () => {},
      );
      return;
    }

    if ("value" in chip && chip.value) {
      toggleParam(chip.key, chip.value);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="bg-white border border-[var(--color-paleblue)] rounded-md p-2 flex items-center gap-1">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)] transition-colors"
        aria-label="Scroll filters left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-2 min-w-max">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className={chipClass(
                chip.key !== "clear" && "value" in chip && chip.value
                  ? isActive(chip.key, chip.value)
                  : false,
              )}
            >
              {chip.label}
            </button>
          ))}

          {DROPDOWNS.map((dropdown) => {
            const active =
              dropdown.key === "feeRange"
                ? searchParams.has("minFee") || searchParams.has("maxFee")
                : dropdown.key === "availableToday"
                  ? searchParams.get("availableToday") === "true"
                  : dropdown.key === "gender"
                    ? searchParams.has("gender")
                    : searchParams.get("discounts") === "1";

            return (
              <div key={dropdown.label} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === dropdown.key ? null : dropdown.key)
                  }
                  className={`${chipClass(active)} flex items-center gap-1`}
                >
                  {dropdown.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {openDropdown === dropdown.key && (
                  <div className="absolute top-full left-0 z-20 mt-1 min-w-[180px] rounded-md border border-[var(--color-paleblue)] bg-white shadow-lg py-1">
                    {dropdown.options.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          if (dropdown.key === "feeRange" && "minFee" in option) {
                            navigateWithParams({
                              minFee: option.minFee,
                              maxFee: option.maxFee,
                            });
                          } else if ("value" in option) {
                            toggleParam(dropdown.key, option.value);
                          }
                          setOpenDropdown(null);
                        }}
                        className="block w-full text-left px-3 py-2 text-xs md:text-sm text-[var(--color-darknavy)] hover:bg-[var(--color-skyblue)]"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)] transition-colors"
        aria-label="Scroll filters right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
