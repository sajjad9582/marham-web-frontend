"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Doctor, Hospital } from "@/lib/doctors-data";
import { buildCallcenterBookingUrl, buildCallcenterUrl, buildVideoPaymentUrl } from "@/lib/doctors-urls";
import {
  bookVideoConsultation,
  fetchFirstAvailableSlot,
  validatePromoCode,
} from "@/lib/marham-api";
import { formatBookedSlotDisplay } from "@/lib/format-appointment-slot";
import type { BookedVideoSlot } from "@/lib/types/marham-api";
import {
  toE164PakistanPhone,
  validatePakistanPhone,
} from "@/lib/validate-pakistan-phone";
import { cn } from "@/lib/utils";

type LocationDetails = {
  hospitalName: string;
  address: string;
  city: string;
  slot: string;
};

function parseLocationDetails(
  hospital: Hospital,
  bookedSlot: BookedVideoSlot | null,
): LocationDetails {
  if (hospital.isVideo) {
    return {
      hospitalName: "Video Consultation",
      address: "Online",
      city: hospital.city ?? "",
      slot: bookedSlot
        ? formatBookedSlotDisplay(bookedSlot.date, bookedSlot.displayTime)
        : "Loading availability...",
    };
  }

  if (hospital.address) {
    const parts = hospital.address.split(",").map((p) => p.trim());
    const city = hospital.city ?? parts[parts.length - 1] ?? "";
    return {
      hospitalName: hospital.name,
      address: parts.join(", "),
      city,
      slot: formatSlot(hospital),
    };
  }

  const parts = hospital.name.split(",").map((p) => p.trim());
  const hospitalName = parts[0] ?? hospital.name;
  const address = parts.slice(1).join(", ");
  const city = hospital.city ?? parts[parts.length - 1] ?? "";

  return {
    hospitalName,
    address,
    city,
    slot: formatSlot(hospital),
  };
}

function formatSlot(hospital: Hospital): string {
  if (hospital.slot) return hospital.slot;

  const availability = hospital.availability.toLowerCase();
  const now = new Date();

  if (availability.includes("today")) {
    return `${formatDate(now)} - 03:00 PM`;
  }

  if (availability.includes("tomorrow")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${formatDate(tomorrow)} - 03:00 PM`;
  }

  const match = hospital.availability.match(/(?:from\s+)?([A-Za-z]{3})\s+(\d{1,2})/i);
  if (match) {
    const month = match[1];
    const day = match[2].padStart(2, "0");
    return `${day} ${month} - 03:00 PM`;
  }

  return hospital.availability;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}`;
}

function resetVideoFormState(setters: {
  setPhone: (value: string) => void;
  setPatientName: (value: string) => void;
  setPromoCode: (value: string) => void;
  setFormError: (value: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  setBookedSlot: (value: BookedVideoSlot | null) => void;
  setBookingFromOutside: (value: boolean) => void;
}) {
  setters.setPhone("");
  setters.setPatientName("");
  setters.setPromoCode("");
  setters.setFormError(null);
  setters.setIsSubmitting(false);
  setters.setBookedSlot(null);
  setters.setBookingFromOutside(false);
}

type BookAppointmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor;
  hospital: Hospital | null;
};

export function BookAppointmentModal({
  open,
  onOpenChange,
  doctor,
  hospital,
}: BookAppointmentModalProps) {
  const [phone, setPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<BookedVideoSlot | null>(null);
  const [bookingFromOutside, setBookingFromOutside] = useState(false);

  const isVideo = hospital?.isVideo ?? false;

  useEffect(() => {
    if (!open || !isVideo) {
      return;
    }

    // if (!hospital?.hospitalId) {
    //   setFormError("Video consultation is not available for this doctor.");
    //   return;
    // }

    let cancelled = false;

    const loadSlot = async () => {
      setFormError(null);
      setBookedSlot(null);

      const slot = await fetchFirstAvailableSlot(doctor.doctorId, hospital.hospitalId!);

      if (cancelled) return;

      // if (!slot) {
      //   setFormError("No available slots found for video consultation.");
      //   return;
      // }

      setBookedSlot(slot);
    };

    void loadSlot();

    return () => {
      cancelled = true;
    };
  }, [open, isVideo, hospital?.hospitalId, doctor.doctorId]);

  if (!hospital) return null;

  const { hospitalName, address, city, slot } = parseLocationDetails(hospital, bookedSlot);

  const callcenterUrl = buildCallcenterUrl({
    doctorId: doctor.doctorId,
    doctorName: doctor.name,
    specialityId: doctor.specialityId,
    specialitySlug: doctor.specialitySlug,
    citySlug: doctor.pageCitySlug,
    hospitalCitySlug: hospital.city ?? city,
  });

  const doctorCallcenterUrl = buildCallcenterBookingUrl({
    doctorId: doctor.doctorId,
    doctorName: doctor.name,
    specialityId: doctor.specialityId,
    specialitySlug: doctor.specialitySlug,
    citySlug: doctor.pageCitySlug,
    hospitalId: hospital.hospitalId,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetVideoFormState({
        setPhone,
        setPatientName,
        setPromoCode,
        setFormError,
        setIsSubmitting,
        setBookedSlot,
        setBookingFromOutside,
      });
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isVideo) {
      if (!patientName.trim()) {
        setFormError("Please enter patient name.");
        return;
      }

      const phoneValidation = validatePakistanPhone(phone);
      if (!phoneValidation.valid || !phoneValidation.normalized) {
        setFormError(phoneValidation.error ?? "Phone Number is Invalid!");
        return;
      }

      if (!bookedSlot) {
        setFormError("No available slots found for video consultation.");
        return;
      }

      setIsSubmitting(true);

      try {
        if (promoCode.trim()) {
          const promoResult = await validatePromoCode({
            promoCode: promoCode.trim(),
            doctorId: doctor.doctorId,
            specialityId: doctor.specialityId,
          });

          if (!promoResult.success) {
            setFormError(promoResult.message || "Invalid Promocode");
            return;
          }
        }

        const bookingResult = await bookVideoConsultation({
          doctorId: doctor.doctorId,
          doctorHospitalId: hospital.doctorHospitalId,
          date: bookedSlot.date,
          time: bookedSlot.time,
          patientPhone: toE164PakistanPhone(phoneValidation.normalized),
          patientName: patientName.trim(),
          promoCode: promoCode.trim() || undefined,
        });

        if (!bookingResult.success || !bookingResult.data?.onlineConsultationId) {
          setFormError(bookingResult.message || "Unable to complete booking. Please try again.");
          return;
        }

        const paymentUrl =
          bookingResult.data.paymentUrl ||
          buildVideoPaymentUrl(bookingResult.data.onlineConsultationId);

        window.location.href = paymentUrl;
      } catch {
        setFormError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    window.location.href = callcenterUrl;
  };

  const videoSubmitDisabled = isVideo && (!bookedSlot || isSubmitting);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-[var(--color-paleblue)] bg-white p-5 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "focus:outline-none max-h-[91vh] overflow-y-auto"
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <Dialog.Title className="text-lg font-bold text-[var(--color-darknavy)]">
              Book Appointment Now
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:text-[var(--color-darknavy)] hover:bg-[var(--color-skyblue)] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="rounded-md border border-[var(--color-paleblue)] bg-[var(--color-frostblue)] p-3.5 space-y-2">
          
           
            {isVideo ? (
              <p className="text-sm font-bold text-[var(--color-brandblue)] underline underline-offset-2">
                {hospitalName}
              </p>
            ) : (
              <a
                href={callcenterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[var(--color-brandblue)] underline underline-offset-2 hover:text-[var(--color-darknavy)]"
              >
                {hospitalName}
              </a>
            )}
            {address && (
              <p className="text-xs text-muted-foreground">{address}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-darknavy)]">
              <span className="font-semibold">{slot}</span>
              {!isVideo && (
                <>
                  <span className="text-[var(--color-paleblue)]" aria-hidden>
                    |
                  </span>
                  <a
                    href={doctorCallcenterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--color-brandblue)] hover:underline"
                  >
                    Change Date &amp; Time
                  </a>
                </>
              )}
              {isVideo && bookedSlot && (
                <>
                  <span className="text-[var(--color-paleblue)]" aria-hidden>
                    |
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-brandblue)]">
                    Change Date &amp; Time
                  </span>
                </>
              )}
            </div>
            <p className="text-sm font-bold text-[var(--color-darknavy)]">
              {hospital.fee}
              {hospital.discount && (
                <span className="ml-1.5 text-xs font-medium text-[var(--color-mainred)]">
                  • {hospital.discount}
                </span>
              )}
            </p>
            {hospital.fastConfirm && (
              <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-lightgreen)] text-[var(--color-maingreen)]">
                Fast Confirm
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {formError && (
              <div
                className="rounded-md border border-[var(--color-mainred)]/30 bg-[#fde8e8] px-3 py-2.5 text-sm text-[var(--color-darknavy)]"
                role="alert"
              >
                {formError}
              </div>
            )}

            <div className="flex rounded-md border border-[var(--color-paleblue)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-brandblue)]/30">
              <div className="flex items-center gap-1.5 border-r border-[var(--color-paleblue)] bg-[var(--color-skyblue)] px-2.5 text-sm text-[var(--color-darknavy)] shrink-0">
                <span aria-hidden>🇵🇰</span>
                <span className="font-medium">+92</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Add Phone Number"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-darknavy)] outline-none placeholder:text-muted-foreground"
                autoComplete="tel"
              />
            </div>

            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Add Patient Name"
              className="w-full rounded-md border border-[var(--color-paleblue)] px-3 py-2.5 text-sm text-[var(--color-darknavy)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--color-brandblue)]/30"
              autoComplete="name"
            />

            {isVideo && (
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Add Promo Code"
                className="w-full rounded-md border border-[var(--color-paleblue)] px-3 py-2.5 text-sm text-[var(--color-darknavy)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--color-brandblue)]/30"
                autoComplete="off"
              />
            )}

            {city && !hospital.isVideo && (
              <label className="flex items-start gap-2 cursor-pointer text-sm text-[var(--color-darknavy)]">
                <input
                  type="checkbox"
                  checked={bookingFromOutside}
                  onChange={(e) => setBookingFromOutside(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--color-paleblue)] accent-[var(--color-brandblue)]"
                />
                <span>
                  Are you booking from outside <strong>{city}</strong>?
                </span>
              </label>
            )}

            {!isVideo && (
              <ul className="space-y-1.5 pt-1">
                {[
                  "Get contact details and clinic direction in message",
                  "Priority customer support if needed",
                ].map((text) => (
                  <li
                    key={text}
                    className="flex items-start gap-2 text-xs text-[var(--color-maingreen)]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 fill-[var(--color-maingreen)] text-white" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={videoSubmitDisabled}
              className="w-full rounded-md bg-[var(--color-darknavy)] hover:bg-[var(--color-brandblue)] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 transition-colors mt-2"
            >
              {isVideo ? "Book A Video Call" : "Book Appointment"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
