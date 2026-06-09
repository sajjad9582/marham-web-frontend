"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Doctor } from "@/lib/doctors-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OnlineDoctorCard } from "./OnlineDoctorCard";

type OnlineDoctorsSliderProps = {
  doctors: Doctor[];
};

export function OnlineDoctorsSlider({ doctors }: OnlineDoctorsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScrollLeft > 4 && el.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [doctors, updateScrollState]);

  const scrollByCards = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>(".online-doctor-card");
    const gap = 12;
    const amount = (card?.offsetWidth ?? 280) + gap;

    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (doctors.length === 0) return null;

  return (
    <section
      className="rounded-lg border border-[var(--color-paleblue)] bg-white p-3 md:p-4 shadow-sm"
      aria-label="Online doctors"
    >

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="hidden md:flex absolute left-4 top-1/2 z-10 -translate-y-1/2
             -translate-x-1/2 h-9 w-9 items-center justify-center rounded-full
             
               bg-transparent text-white  hover:bg-[var(--color-skyblue)] hover:text-black transition-colors"
            aria-label="Scroll online doctors left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="hidden md:flex absolute right-4 top-1/2 z-10 -translate-y-1/2 
            translate-x-1/2 h-9 w-9 items-center justify-center rounded-full 
            bg-transparent text-white  hover:bg-[var(--color-skyblue)] hover:text-black transition-colors"
            aria-label="Scroll online doctors right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-3 px-1 pb-1 scrollbar-hide md:px-8"
        >
          {doctors.map((doctor) => (
            <OnlineDoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}
