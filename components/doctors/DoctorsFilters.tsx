"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { generateTimeslotFilterOptions } from "@/lib/timeslot-filter-options";

const QUICK_CHIPS = [
  { label: "Clear Filters", key: "clear" },
  { label: "Doctors Near Me", key: "nearMe" },
  { label: "Fee Upto 500", key: "maxFee", value: "500" },
  { label: "Top Reviewed", key: "topReviewed", value: "1" },
  { label: "Online Now", key: "consultationType", value: "2" },
] as const;

const TIMESLOT_OPTIONS = generateTimeslotFilterOptions();

const DROPDOWNS = [
  {
    label: "Choose a Timeslot",
    key: "timeSlot",
    options: TIMESLOT_OPTIONS,
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

type DropdownKey = (typeof DROPDOWNS)[number]["key"];
type DropdownConfig = (typeof DROPDOWNS)[number];
type DropdownOption = DropdownConfig["options"][number];

type DoctorsFilterChipsProps = {
  city: string;
  speciality: string;
};

export function DoctorsFilterChips({ city, speciality }: DoctorsFilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const portalMenuRef = useRef<HTMLDivElement | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, minWidth: 180 });
  const [mounted, setMounted] = useState(false);

  const basePath = `/doctors/${city}/${speciality}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = useCallback((key: DropdownKey) => {
    const trigger = dropdownTriggerRefs.current[key];
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: Math.max(rect.width, 180),
    });
  }, []);

  useEffect(() => {
    if (!openDropdown) return;

    updateMenuPosition(openDropdown);

    const handleReposition = () => {
      if (openDropdown) updateMenuPosition(openDropdown);
    };

    window.addEventListener("resize", handleReposition);
    scrollRef.current?.addEventListener("scroll", handleReposition);

    return () => {
      window.removeEventListener("resize", handleReposition);
      scrollRef.current?.removeEventListener("scroll", handleReposition);
    };
  }, [openDropdown, updateMenuPosition]);

  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const trigger = openDropdown ? dropdownTriggerRefs.current[openDropdown] : null;
      if (
        trigger?.contains(target) ||
        portalMenuRef.current?.contains(target)
      ) {
        return;
      }
      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

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
    `text-[11px] md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded-md border font-medium transition-colors whitespace-nowrap ${
      active
        ? "border-[var(--color-brandblue)] bg-[var(--color-brandblue)] text-white"
        : "border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)]"
    }`;

  const isDropdownOptionSelected = (dropdown: DropdownConfig, option: DropdownOption) => {
    if (dropdown.key === "feeRange" && "minFee" in option) {
      return (
        searchParams.get("minFee") === option.minFee &&
        searchParams.get("maxFee") === option.maxFee
      );
    }
    if (dropdown.key === "timeSlot" && "value" in option) {
      return searchParams.get("timeSlot") === option.value;
    }
    if ("value" in option) {
      return searchParams.get(dropdown.key) === option.value;
    }
    return false;
  };

  const optionClass = (selected: boolean) =>
    `block w-full text-left px-3 py-2 text-xs md:text-sm transition-colors ${
      selected
        ? "bg-[var(--color-brandblue)] text-white"
        : "text-[var(--color-darknavy)] hover:bg-[var(--color-skyblue)]"
    }`;

  const handleFeeUpto500 = () => {
    const isCurrentlyActive = searchParams.get("maxFee") === "500";
    if (isCurrentlyActive) {
      navigateWithParams({ maxFee: null, minFee: null });
    } else {
      navigateWithParams({ maxFee: "500", minFee: null });
    }
  };

  const handleQuickChip = (chip: (typeof QUICK_CHIPS)[number]) => {
    if (chip.key === "clear") {
      router.push(basePath);
      return;
    }

    if (chip.key === "nearMe") {
      if (searchParams.has("lat") && searchParams.has("lng")) {
        navigateWithParams({ lat: null, lng: null });
        return;
      }
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          navigateWithParams({
            lat: String(pos.coords.latitude),
            lng: String(pos.coords.longitude),
          });
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
        },
      );
      return;
    }

    if (chip.key === "maxFee") {
      handleFeeUpto500();
      return;
    }

    if ("value" in chip && chip.value) {
      toggleParam(chip.key, chip.value);
    }
  };

  const isQuickChipActive = (chip: (typeof QUICK_CHIPS)[number]) => {
    if (chip.key === "maxFee") return isActive("maxFee", "500");
    if (chip.key === "nearMe") {
      return searchParams.has("lat") && searchParams.has("lng");
    }
    if (chip.key !== "clear" && "value" in chip && chip.value) {
      return isActive(chip.key, chip.value);
    }
    return false;
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const openDropdownConfig = DROPDOWNS.find((d) => d.key === openDropdown);

  const portalMenu =
    mounted && openDropdown && openDropdownConfig
      ? createPortal(
          <div
            ref={portalMenuRef}
            className={`fixed z-[100] rounded-md border border-[var(--color-paleblue)] bg-white shadow-lg overflow-hidden ${
              openDropdownConfig.key === "timeSlot" ? "max-h-72 flex flex-col" : ""
            }`}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              minWidth: menuPosition.minWidth,
            }}
          >
            {openDropdownConfig.key === "timeSlot" && (
              <div className="bg-[var(--color-brandblue)] px-3 py-2 text-xs md:text-sm font-medium text-white shrink-0">
                Choose a Timeslot
              </div>
            )}
            <div
              className={openDropdownConfig.key === "timeSlot" ? "overflow-y-auto py-1" : "py-1"}
            >
              {openDropdownConfig.options.map((option) => {
                const selected = isDropdownOptionSelected(openDropdownConfig, option);
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      if (openDropdownConfig.key === "feeRange" && "minFee" in option) {
                        navigateWithParams({
                          minFee: option.minFee,
                          maxFee: option.maxFee,
                        });
                      } else if (openDropdownConfig.key === "timeSlot" && "value" in option) {
                        toggleParam("timeSlot", option.value);
                      } else if ("value" in option) {
                        toggleParam(openDropdownConfig.key, option.value);
                      }
                      setOpenDropdown(null);
                    }}
                    className={optionClass(selected)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="relative z-10 bg-white border border-[var(--color-paleblue)] rounded-md p-1 md:p-2 flex items-center gap-0.5 md:gap-1">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="relative z-30 shrink-0 h-7 w-7 md:h-8 md:w-8 flex items-center justify-center rounded-full border border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)] transition-colors"
          aria-label="Scroll filters left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="relative z-0 flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-center gap-2 min-w-max">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickChip(chip)}
                className={chipClass(isQuickChipActive(chip))}
              >
                {chip.label}
              </button>
            ))}

            {DROPDOWNS.map((dropdown) => {
              const active =
                dropdown.key === "feeRange"
                  ? searchParams.has("minFee") ||
                    (searchParams.has("maxFee") && searchParams.get("maxFee") !== "500")
                  : dropdown.key === "timeSlot"
                    ? searchParams.has("timeSlot")
                    : dropdown.key === "gender"
                      ? searchParams.has("gender")
                      : searchParams.get("discounts") === "1";

              return (
                <button
                  key={dropdown.label}
                  ref={(el) => {
                    dropdownTriggerRefs.current[dropdown.key] = el;
                  }}
                  type="button"
                  onClick={() => {
                    if (openDropdown === dropdown.key) {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown(dropdown.key);
                      updateMenuPosition(dropdown.key);
                    }
                  }}
                  className={`${chipClass(active)} flex items-center gap-1`}
                >
                  {dropdown.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="relative z-30 shrink-0 h-7 w-7 md:h-8 md:w-8 flex items-center justify-center rounded-full border border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] hover:bg-[var(--color-paleblue)] transition-colors"
          aria-label="Scroll filters right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {portalMenu}
    </>
  );
}
