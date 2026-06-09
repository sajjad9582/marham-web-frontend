import type { Hospital } from "@/lib/doctors-data";
import { Percent } from "lucide-react";

type LocationPricingProps = {
  hospital: Pick<
    Hospital,
    "fee" | "originalFee" | "hasDiscount" | "discountPercentage"
  >;
  variant?: "card" | "modal";
};

function DiscountBanner({
  discountPercentage,
  className,
}: {
  discountPercentage: number;
  className?: string;
}) {
  return (
    <div
      className={`discount-offer-banner flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-white ${className ?? ""}`}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        <Percent className="h-3 w-3 shrink-0" aria-hidden />
        <span>Limited Time Offer • Save {discountPercentage}%</span>
      </span>
    </div>
  );
}

export function LocationPricing({
  hospital,
  variant = "card",
}: LocationPricingProps) {
  return (
    <div className={variant === "modal" ? "space-y-2" : "mt-1"}>
      <p className="text-sm font-bold text-[var(--color-darknavy)]">
        {hospital.hasDiscount && hospital.originalFee ? (
          <>
            <span>{hospital.fee}</span>
            <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">
              {hospital.originalFee}
            </span>
          </>
        ) : (
          <span>{hospital.fee}</span>
        )}
      </p>

      {hospital.hasDiscount && hospital.discountPercentage && variant === "modal" ? (
        <DiscountBanner
          discountPercentage={hospital.discountPercentage}
          className="rounded-md"
        />
      ) : null}
    </div>
  );
}

export function LocationDiscountBanner({
  discountPercentage,
}: {
  discountPercentage: number;
}) {
  return <DiscountBanner discountPercentage={discountPercentage} />;
}
