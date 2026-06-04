"use client"
import { useState } from "react";
import { DoctorCard } from "./DoctorCard";
import type { Doctor } from "@/lib/doctors-data";

export function DoctorsList({ doctors }: { doctors: Doctor[] }) {
  const [visible, setVisible] = useState(6);
  return (
    <div className="space-y-4">
      {doctors.slice(0, visible).map((d) => (
        <DoctorCard key={d.id} doctor={d} />
      ))}
      {visible < doctors.length && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisible((v) => v + 6)}
            className="bg-[var(--color-brandblue)] hover:bg-[var(--color-darknavy)] text-white font-semibold rounded-md px-8 py-2.5 text-sm transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
