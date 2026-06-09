"use client";

import type { Hospital } from "@/lib/doctors-data";
import { Video } from "lucide-react";
import { LocationDiscountBanner, LocationPricing } from "./LocationPricing";

type LocationBoxProps = {
  hospital: Hospital;
  onSelect: () => void;
};

function FastConfirmBadge() {
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-lightgreen)] text-[var(--color-maingreen)] whitespace-nowrap shrink-0"
      title="Doctor confirms immediately after booking."
    >
      Fast Confirm
    </span>
  );
}

export function LocationBox({ hospital: h, onSelect }: LocationBoxProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border cursor-pointer text-left w-56 flex-shrink-0 snap-start sm:w-full sm:flex-shrink transition-colors hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brandblue)]/40 flex flex-col overflow-hidden ${
        h.isVideo
          ? "border-[var(--color-brandteal)] bg-white hover:bg-[var(--color-skyblue)]/50"
          : "border-[var(--color-paleblue)] bg-white hover:border-[var(--color-brandblue)]"
      }`}
    >
      <div className="px-3 pt-2.5 pb-2 flex-1">
        <div className="flex items-start justify-between gap-1.5">
          <p
            className={`text-xs font-bold flex items-center gap-1 min-w-0 ${
              h.isVideo
                ? "text-[var(--color-brandblue)]"
                : "text-[var(--color-darknavy)]"
            }`}
          >
            {h.isVideo && <Video className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            <span className="line-clamp-2">{h.name}</span>
          </p>
          {h.fastConfirm && <FastConfirmBadge />}
        </div>

        <p className="text-[11px] text-muted-foreground mt-1">{h.availability}</p>

        <LocationPricing hospital={h} variant="card" />
      </div>

      {h.hasDiscount && h.discountPercentage ? (
        <LocationDiscountBanner discountPercentage={h.discountPercentage} />
      ) : null}
    </button>
  );
}
