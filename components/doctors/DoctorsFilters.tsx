"use client"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const QUICK_CHIPS = ["Clear Filters", "Doctors Near Me", "Fee Upto 500", "Top Reviewed", "Online Now"];
const DROPDOWNS = ["Choose a Timeslot", "Fee Range", "Gender", "Discounts"];

export function DoctorsFilterChips() {
  const scrollRef = useRef<HTMLDivElement>(null);

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
          {QUICK_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] font-medium hover:bg-[var(--color-paleblue)] transition-colors whitespace-nowrap"
            >
              {c}
            </button>
          ))}
          {DROPDOWNS.map((d) => (
            <button
              key={d}
              type="button"
              className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-[var(--color-paleblue)] bg-[var(--color-mistblue)] text-[var(--color-brandblue)] font-medium hover:bg-[var(--color-paleblue)] transition-colors whitespace-nowrap flex items-center gap-1"
            >
              {d}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          ))}
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