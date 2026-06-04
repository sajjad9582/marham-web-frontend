import { Doctor, Hospital } from "@/lib/doctors-data";
import { CheckCircle2, Video } from "lucide-react";
// import type { Doctor, Hospital } from "@/lib/doctors-data";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const initials = doctor.name
    .replace(/^(Asst\.|Assoc\.|Prof\.|Dr\.|Brig|R|Sr\.) ?/gi, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <article
      itemScope
      itemType="https://schema.org/Physician"
      className="bg-white border border-[var(--color-paleblue)] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-[var(--color-brandteal)] to-[var(--color-brandblue)] text-white flex items-center justify-center text-xl font-bold ring-4 ring-[var(--color-paleblue)]"
              aria-hidden
            >
              {initials}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 itemProp="name" className="text-base md:text-lg font-bold text-[var(--color-darknavy)] flex items-center gap-1.5">
              {doctor.name}
              {doctor.isPmc && (
                <CheckCircle2 className="h-4 w-4 text-[var(--color-maingreen)] fill-[var(--color-maingreen)] text-white flex-shrink-0" aria-label="Verified" />
              )}
            </h3>
            <p className="text-xs md:text-sm font-semibold text-[var(--color-maingreen)] mt-0.5">PMDC Verified</p>
            <p itemProp="medicalSpecialty" className="text-sm text-[var(--color-darknavy)] mt-1.5">{doctor.specialty}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{doctor.qualifications}</p>

            <dl className="mt-3 grid grid-cols-3 gap-2 max-w-md">
              <Stat label="Reviews" value={doctor.reviews.toString()} accent />
              <Stat label="Experience" value={doctor.experience} />
              <Stat label="Satisfaction" value={doctor.satisfaction} />
            </dl>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2 w-full md:w-48 md:flex-shrink-0">
            {doctor.hasVideoCall && (
              <button
                type="button"
                className=" max-h-20 bg-[var(--color-maingreen)] hover:bg-[var(--color-maingreen)]/90 text-white text-sm font-semibold rounded-md px-4 py-2.5 transition-colors"
              >
                Book Video Call
              </button>
            )}
            <button
              type="button"
              className=" max-h-20 bg-[var(--color-darknavy)] hover:bg-[var(--color-brandblue)] text-white text-sm font-semibold rounded-md px-4 py-2.5 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>

        {/* Service pills */}
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

        {/* Locations grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {doctor.locations.map((h, i) => (
            <LocationBox key={i} h={h} />
          ))}
        </div>
      </div>
    </article>
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

function LocationBox({ h }: { h: Hospital }) {
  return (
    <div
      className={`rounded-md border-2 px-3 py-2.5 ${h.isVideo ? "border-[var(--color-brandteal)] bg-[var(--color-skyblue)]" : "border-[var(--color-paleblue)] bg-white"
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
    </div>
  );
}
