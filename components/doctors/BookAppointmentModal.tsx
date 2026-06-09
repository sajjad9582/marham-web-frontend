"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Doctor, Hospital } from "@/lib/doctors-data";
import { buildCallcenterBookingUrl, buildCallcenterUrl, buildVideoPaymentUrl } from "@/lib/doctors-urls";
import {
  bookVideoConsultation,
  fetchDoctorAvailableSlots,
  resolveHospitalIds,
  validatePromoCode,
} from "@/lib/marham-api";
import { formatBookedSlotDisplay, parseDisplayTimeTo24Hour } from "@/lib/format-appointment-slot";
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

function formatSlotDisplay(
  bookedSlot: BookedVideoSlot | null,
  slotsLoading: boolean,
): string {
  if (slotsLoading) return "Loading availability...";
  if (bookedSlot) return formatBookedSlotDisplay(bookedSlot.date, bookedSlot.displayTime);
  return "No slots available";
}

function parseLocationDetails(
  hospital: Hospital,
  bookedSlot: BookedVideoSlot | null,
  slotsLoading: boolean,
): LocationDetails {
  const slot = formatSlotDisplay(bookedSlot, slotsLoading);

  if (hospital.isVideo) {
    return {
      hospitalName: "Video Consultation",
      address: "Online",
      city: hospital.city ?? "",
      slot,
    };
  }

  if (hospital.address) {
    const parts = hospital.address.split(",").map((p) => p.trim());
    const city = hospital.city ?? parts[parts.length - 1] ?? "";
    return {
      hospitalName: hospital.name,
      address: parts.join(", "),
      city,
      slot,
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
    slot,
  };
}

function pickFirstAvailableSlot(
  availableSlots: Awaited<ReturnType<typeof fetchDoctorAvailableSlots>>,
): BookedVideoSlot | null {
  for (const day of availableSlots) {
    const slot = day.slots.find((entry) => entry.available);
    if (!slot) continue;

    return {
      date: day.date,
      time: parseDisplayTimeTo24Hour(slot.time),
      displayTime: slot.time,
    };
  }

  return null;
}

function resetModalFormState(setters: {
  setPhone: (value: string) => void;
  setPatientName: (value: string) => void;
  setPromoCode: (value: string) => void;
  setFormError: (value: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  setBookedSlot: (value: BookedVideoSlot | null) => void;
  setBookingFromOutside: (value: boolean) => void;
  setSlotsLoading: (value: boolean) => void;
  setResolvedHospitalId: (value: number | undefined) => void;
  setResolvedDoctorHospitalId: (value: number | undefined) => void;
}) {
  setters.setPhone("");
  setters.setPatientName("");
  setters.setPromoCode("");
  setters.setFormError(null);
  setters.setIsSubmitting(false);
  setters.setBookedSlot(null);
  setters.setBookingFromOutside(false);
  setters.setSlotsLoading(false);
  setters.setResolvedHospitalId(undefined);
  setters.setResolvedDoctorHospitalId(undefined);
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
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [resolvedHospitalId, setResolvedHospitalId] = useState<number | undefined>();
  const [resolvedDoctorHospitalId, setResolvedDoctorHospitalId] = useState<number | undefined>();

  const isVideo = hospital?.isVideo ?? false;

  useEffect(() => {
    if (!open || !hospital) {
      return;
    }

    let cancelled = false;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setFormError(null);
      setBookedSlot(null);
      setResolvedHospitalId(undefined);
      setResolvedDoctorHospitalId(undefined);

      const ids = await resolveHospitalIds(doctor.doctorId, hospital);

      if (cancelled) return;

      const hospitalId = ids.hospitalId ?? hospital.hospitalId;

      setResolvedHospitalId(hospitalId);
      setResolvedDoctorHospitalId(ids.doctorHospitalId ?? hospital.doctorHospitalId);

      console.log("BookAppointmentModal: resolved hospital IDs", {
        doctorId: doctor.doctorId,
        hospitalId,
        doctorHospitalId: ids.doctorHospitalId ?? hospital.doctorHospitalId,
        hospital,
      });

      const availableSlots = await fetchDoctorAvailableSlots(doctor.doctorId, hospitalId);

      if (cancelled) return;

      const firstSlot = pickFirstAvailableSlot(availableSlots);
      setBookedSlot(firstSlot);
      setSlotsLoading(false);

      if (isVideo && !firstSlot && hospitalId) {
        setFormError("No available slots found for video consultation.");
      }
    };

    void loadSlots();

    return () => {
      cancelled = true;
    };
  }, [open, hospital, doctor.doctorId, isVideo]);

  if (!hospital) return null;

  const { hospitalName, address, city, slot } = parseLocationDetails(
    hospital,
    bookedSlot,
    slotsLoading,
  );

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
    hospitalId: resolvedHospitalId ?? hospital.hospitalId,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalFormState({
        setPhone,
        setPatientName,
        setPromoCode,
        setFormError,
        setIsSubmitting,
        setBookedSlot,
        setBookingFromOutside,
        setSlotsLoading,
        setResolvedHospitalId,
        setResolvedDoctorHospitalId,
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
          doctorHospitalId: resolvedDoctorHospitalId ?? hospital.doctorHospitalId,
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
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-black">
              <span className="">{slot}</span>
              {!isVideo && (
                <>
                  <span className="" aria-hidden>
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
