"use client";

import { useState } from "react";
import Image from "next/image";
import { Doctor, Hospital } from "@/lib/doctors-data";
import {
  buildBookAppointmentUrl,
  buildDoctorProfileUrl,
  buildVideoCallUrl,
} from "@/lib/doctors-urls";
import { CheckCircle2 } from "lucide-react";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { LocationBox } from "./LocationBox";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [imgError, setImgError] = useState(false);

  const openBooking = (hospital: Hospital) => {
    console.log("DoctorCard: openBooking", {
      doctorId: doctor.doctorId,
      specialityId: doctor.specialityId,
      hospital,
    });
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

  const urlParams = {
    doctorId: doctor.doctorId,
    doctorName: doctor.name,
    specialityId: doctor.specialityId,
    specialitySlug: doctor.specialitySlug,
    citySlug: doctor.pageCitySlug,
  };

  const profileUrl = buildDoctorProfileUrl(urlParams);
  const bookAppointmentUrl = buildBookAppointmentUrl(urlParams);
  const videoCallUrl = buildVideoCallUrl(doctor.specialityId, doctor.doctorId);

  const avatar = doctor.profilePic && !imgError ? (
    <Image
      src={doctor.profilePic}
      alt={doctor.name}
      width={96}
      height={96}
      className="h-16 w-16 md:h-24 md:w-24 rounded-full object-cover ring-2 md:ring-4 ring-[var(--color-paleblue)]"
      onError={() => setImgError(true)}
    />
  ) : (
    <div
      className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-[var(--color-brandteal)] to-[var(--color-brandblue)] text-white flex items-center justify-center text-lg md:text-xl font-bold ring-2 md:ring-4 ring-[var(--color-paleblue)]"
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
        <div className="p-3 md:p-5">
          <div className="flex gap-3 md:gap-4">
            <div className="flex-shrink-0">
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                {avatar}
              </a>
            </div>

            <div className="flex-1 min-w-0">
              <h3 itemProp="name" className="text-sm leading-snug md:text-lg font-bold text-black flex items-start gap-1">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 md:line-clamp-none"
                >
                  {doctor.name}
                </a>
                {doctor.isPmc && (
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 mt-0.5 text-[var(--color-maingreen)] fill-[var(--color-maingreen)] text-white flex-shrink-0" aria-label="Verified" />
                )}
              </h3>
              {doctor.isPmc && (
                <p className="text-[11px] md:text-sm font-semibold text-[var(--color-maingreen)] mt-0.5">PMDC Verified</p>
              )}
              <p itemProp="medicalSpecialty" className="text-xs md:text-sm text-[var(--color-darknavy)] mt-1">{doctor.specialty}</p>
              <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5 line-clamp-1 md:line-clamp-none">{doctor.qualifications}</p>

              <dl className="mt-2 md:mt-3 grid grid-cols-3 gap-2 max-w-md">
                <Stat label="Reviews" value={doctor.reviews.toString()} accent />
                <Stat label="Experience" value={doctor.experience} />
                <Stat label="Satisfaction" value={doctor.satisfaction} />
              </dl>
            </div>

            {/* Desktop: actions stay in the top-right column */}
            <ActionButtons
              hasVideoCall={doctor.hasVideoCall}
              videoCallUrl={videoCallUrl}
              bookAppointmentUrl={bookAppointmentUrl}
              className="hidden md:flex flex-col gap-2 md:w-64 md:flex-shrink-0"
            />
          </div>

          {doctor.services.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto snap-x px-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
              {doctor.services.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-skyblue)] text-[var(--color-brandblue)] border border-[var(--color-paleblue)] whitespace-nowrap shrink-0 snap-start"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Mobile: single horizontal scroll row. Desktop: wrapped grid (unchanged). */}
          <div className="mt-4 flex overflow-x-auto snap-x gap-2.5   px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
            {doctor.locations.map((h, i) => (
              <LocationBox key={i} hospital={h} onSelect={() => openBooking(h)} />
            ))}
          </div>

          {/* Mobile: actions move to the end */}
          <ActionButtons
            hasVideoCall={doctor.hasVideoCall}
            videoCallUrl={videoCallUrl}
            bookAppointmentUrl={bookAppointmentUrl}
            className="mt-4 flex flex-col gap-2 md:hidden"
          />
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

function ActionButtons({
  hasVideoCall,
  videoCallUrl,
  bookAppointmentUrl,
  className,
}: {
  hasVideoCall: boolean;
  videoCallUrl: string;
  bookAppointmentUrl: string;
  className: string;
}) {
  return (
    <div className={className}>
      {hasVideoCall && (
        <a
          href={videoCallUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="max-h-20 inline-flex items-center justify-center bg-[var(--color-maingreen)] hover:bg-[var(--color-maingreen)]/90 text-white text-sm font-semibold rounded-sm px-4 py-2.5 transition-colors text-center"
        >
          Book Video Call
        </a>
      )}
      <a
        href={bookAppointmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="max-h-20 bg-[var(--color-darknavy)] hover:bg-[var(--color-brandblue)] text-white text-sm font-semibold rounded-sm px-4 py-2.5 transition-colors text-center"
      >
        Book Appointment
      </a>
    </div>
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

