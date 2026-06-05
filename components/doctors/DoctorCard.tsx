"use client";

import { useState } from "react";
import Image from "next/image";
import { Doctor, Hospital } from "@/lib/doctors-data";
import {
  buildCallcenterUrl,
  buildDoctorProfileUrl,
  buildVideoCallUrl,
} from "@/lib/doctors-urls";
import { CheckCircle2, Video } from "lucide-react";
import { BookAppointmentModal } from "./BookAppointmentModal";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [imgError, setImgError] = useState(false);

  const openBooking = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setModalOpen(true);
  };

  const initials = doctor.name
    .replace(/^(Asst\.|Assoc\.|Prof\.|Dr\.|Brig|R|Sr\.) ?/gi, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const defaultLocation =
    doctor.locations.find((l) => !l.isVideo) ?? doctor.locations[0] ?? null;

  const urlParams = {
    doctorId: doctor.doctorId,
    doctorName: doctor.name,
    specialityId: doctor.specialityId,
    specialitySlug: doctor.specialitySlug,
    citySlug: doctor.pageCitySlug,
    hospitalCitySlug: defaultLocation?.city,
  };

  const profileUrl = buildDoctorProfileUrl(urlParams);
  const videoCallUrl = buildVideoCallUrl(doctor.specialityId, doctor.doctorId);
  const callcenterUrl = buildCallcenterUrl(urlParams);

  const avatar = doctor.profilePic && !imgError ? (
    <Image
      src={doctor.profilePic}
      alt={doctor.name}
      width={96}
      height={96}
      className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover ring-4 ring-[var(--color-paleblue)]"
      onError={() => setImgError(true)}
    />
  ) : (
    <div
      className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-[var(--color-brandteal)] to-[var(--color-brandblue)] text-white flex items-center justify-center text-xl font-bold ring-4 ring-[var(--color-paleblue)]"
      aria-hidden
    >
      {initials}
    </div>
  );

  return (
    <>
      <article
        itemScope
        itemType="https://schema.org/Physician"
        className="bg-white border border-[var(--color-paleblue)] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                {avatar}
              </a>
            </div>

            <div className="flex-1 min-w-0">
              <h3 itemProp="name" className="text-base md:text-lg font-bold text-[var(--color-darknavy)] flex items-center gap-1.5">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {doctor.name}
                </a>
                {doctor.isPmc && (
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-maingreen)] fill-[var(--color-maingreen)] text-white flex-shrink-0" aria-label="Verified" />
                )}
              </h3>
              {doctor.isPmc && (
                <p className="text-xs md:text-sm font-semibold text-[var(--color-maingreen)] mt-0.5">PMDC Verified</p>
              )}
              <p itemProp="medicalSpecialty" className="text-sm text-[var(--color-darknavy)] mt-1.5">{doctor.specialty}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{doctor.qualifications}</p>

              <dl className="mt-3 grid grid-cols-3 gap-2 max-w-md">
                <Stat label="Reviews" value={doctor.reviews.toString()} accent />
                <Stat label="Experience" value={doctor.experience} />
                <Stat label="Satisfaction" value={doctor.satisfaction} />
              </dl>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-48 md:flex-shrink-0">
              {doctor.hasVideoCall && (
                <a
                  href={videoCallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-h-20 bg-[var(--color-maingreen)] hover:bg-[var(--color-maingreen)]/90 text-white text-sm font-semibold rounded-md px-4 py-2.5 transition-colors text-center"
                >
                  Book Video Call
                </a>
              )}
              <a
                href={callcenterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="max-h-20 bg-[var(--color-darknavy)] hover:bg-[var(--color-brandblue)] text-white text-sm font-semibold rounded-md px-4 py-2.5 transition-colors text-center"
              >
                Book Appointment
              </a>
            </div>
          </div>

          {doctor.services.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.services.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-skyblue)] text-[var(--color-brandblue)] border border-[var(--color-paleblue)]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {doctor.locations.map((h, i) => (
              <LocationBox key={i} h={h} onSelect={() => openBooking(h)} />
            ))}
          </div>
        </div>
      </article>

      <BookAppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        doctor={doctor}
        hospital={selectedHospital}
      />
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center sm:text-left">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={`text-sm font-bold ${accent ? "text-[var(--color-brandblue)] underline" : "text-[var(--color-darknavy)]"}`}>{value}</dd>
    </div>
  );
}

function LocationBox({ h, onSelect }: { h: Hospital; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border-2 px-3 py-2.5 text-left w-full transition-colors hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brandblue)]/40 ${
        h.isVideo
          ? "border-[var(--color-brandteal)] bg-[var(--color-skyblue)] hover:bg-[var(--color-skyblue)]/80"
          : "border-[var(--color-paleblue)] bg-white hover:border-[var(--color-brandblue)]"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={`text-xs font-bold ${h.isVideo ? "text-[var(--color-brandblue)]" : "text-[var(--color-darknavy)]"} flex items-center gap-1`}>
          {h.isVideo && <Video className="h-3.5 w-3.5" />}
          <span className="line-clamp-1">{h.name}</span>
        </p>
        {h.fastConfirm && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-lightgreen)] text-[var(--color-maingreen)] whitespace-nowrap">
            Fast Confirm
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{h.availability}</p>
      <p className="text-sm font-bold text-[var(--color-darknavy)] mt-1">
        {h.fee}
        {h.discount && (
          <span className="ml-1.5 text-[10px] font-medium text-[var(--color-mainred)]">• {h.discount}</span>
        )}
      </p>
    </button>
  );
}
