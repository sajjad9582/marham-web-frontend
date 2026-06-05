"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import type { Doctor, Hospital } from "@/lib/doctors-data";
import { buildCallcenterUrl } from "@/lib/doctors-urls";
import { cn } from "@/lib/utils";

type LocationDetails = {
  hospitalName: string;
  address: string;
  city: string;
  slot: string;
};

function parseLocationDetails(hospital: Hospital): LocationDetails {
  if (hospital.isVideo) {
    return {
      hospitalName: "Video Consultation",
      address: "Online appointment",
      city: hospital.city ?? "",
      slot: formatSlot(hospital),
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
  const [bookingFromOutside, setBookingFromOutside] = useState(false);

  if (!hospital) return null;

  const { hospitalName, address, city, slot } = parseLocationDetails(hospital);

  const callcenterUrl = buildCallcenterUrl({
    doctorId: doctor.doctorId,
    doctorName: doctor.name,
    specialityId: doctor.specialityId,
    specialitySlug: doctor.specialitySlug,
    citySlug: doctor.pageCitySlug,
    hospitalCitySlug: hospital.city ?? city,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = callcenterUrl;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
            <p className="text-xs text-muted-foreground">{doctor.name}</p>
            <a
              href={callcenterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[var(--color-brandblue)] underline underline-offset-2 hover:text-[var(--color-darknavy)]"
            >
              {hospitalName}
            </a>
            {address && (
              <p className="text-xs text-muted-foreground">{address}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-darknavy)]">
              <span className="font-semibold">{slot}</span>
              <span className="text-[var(--color-paleblue)]" aria-hidden>
                |
              </span>
              <a
                href={callcenterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[var(--color-brandblue)] hover:underline"
              >
                Change Date &amp; Time
              </a>
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

            <button
              type="submit"
              className="w-full rounded-md bg-[var(--color-darknavy)] hover:bg-[var(--color-brandblue)] text-white text-sm font-semibold py-3 transition-colors mt-2"
            >
              Book Appointment
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
