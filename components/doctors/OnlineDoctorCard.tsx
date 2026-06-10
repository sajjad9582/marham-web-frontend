"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Doctor } from "@/lib/doctors-data";
import {
  formatExperienceYears,
  getOnlineConsultationFee,
} from "@/lib/online-doctors-from-listing";
import {
  buildDoctorProfileUrl,
  buildDoctorProfileUrlFromSlug,
  buildVideoCallUrl,
} from "@/lib/doctors-urls";
import { Star } from "lucide-react";

type OnlineDoctorCardProps = {
  doctor: Doctor;
};

export function OnlineDoctorCard({ doctor }: OnlineDoctorCardProps) {
  const [imgError, setImgError] = useState(false);

  const profileUrl = doctor.slug
    ? buildDoctorProfileUrlFromSlug(doctor.slug)
    : buildDoctorProfileUrl({
        doctorId: doctor.doctorId,
        doctorName: doctor.name,
        specialityId: doctor.specialityId,
        specialitySlug: doctor.specialitySlug,
        citySlug: doctor.pageCitySlug,
      });

  const callNowUrl = buildVideoCallUrl(doctor.specialityId, doctor.doctorId);
  const fee = getOnlineConsultationFee(doctor);
  const experience = formatExperienceYears(doctor.experience);

  const initials = doctor.name
    .replace(/^(Asst\.|Assoc\.|Prof\.|Dr\.|Brig|R|Sr\.) ?/gi, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="online-doctor-card flex h-full w-[15rem] sm:w-[17.5rem] md:w-[350px] flex-shrink-0 snap-start flex-col rounded-lg border border-[#0a4566] bg-[#0B4F75] p-3 text-white shadow-sm">
      <div className="flex gap-2.5">
        <Link
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          {doctor.profilePic && !imgError ? (
            <Image
              src={doctor.profilePic}
              alt={doctor.name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="h-14 w-14 rounded-full bg-[#0a4566] text-white flex items-center justify-center text-sm font-bold ring-2 ring-white/20"
              aria-hidden
            >
              {initials}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-bold leading-tight text-white underline underline-offset-2 line-clamp-2 min-h-[2.5rem] hover:text-white/90"
          >
            {doctor.name}
          </Link>
          <p className="text-[11px] text-white/90 mt-0.5 line-clamp-1">{doctor.specialty}</p>
          <p className="text-[11px] text-white/90 min-h-[1rem]">
            {experience !== "—" ? experience : "\u00A0"}
          </p>
          <p className="text-[11px] text-white/90 flex items-center gap-1 min-h-[1rem]">
            {doctor.rating > 0 ? (
              <>
                <Star className="h-3 w-3 fill-[#E0D128] text-[#E0D128]" aria-hidden />
                <span>{doctor.rating}/5</span>
              </>
            ) : (
              "\u00A0"
            )}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between text-xs text-white">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brandteal)] animate-pulse" aria-hidden />
            Online
          </span>
          <span className="font-semibold">{fee}</span>
        </div>

        <a
          href={callNowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center rounded-md bg-maingreen hover:bg-maingreen/70 text-white text-sm font-semibold py-2.5 transition-colors"
        >
          Call Now
        </a>
      </div>
    </article>
  );
}
