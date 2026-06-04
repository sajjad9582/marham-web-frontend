"use client"
import { MapPin, Search } from "lucide-react";

export function DoctorsSearchBar({ city, speciality }: { city: string; speciality: string }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="bg-white border border-[var(--color-paleblue)] rounded-md p-2 flex items-stretch gap-2"
    >
      <label className="flex-1 flex items-center gap-2 border border-[var(--color-paleblue)] rounded-md px-3">
        <MapPin className="h-4 w-4 text-[var(--color-brandblue)]" aria-hidden />
        <input
          type="text"
          defaultValue={city.replace(/-/g, " ")}
          aria-label="City"
          placeholder="Enter City"
          className="bg-transparent outline-none w-full text-sm capitalize text-[var(--color-darknavy)] py-2"
        />
      </label>
      <label className="flex-[2] flex items-center gap-2 border border-[var(--color-paleblue)] rounded-md px-3">
        <Search className="h-4 w-4 text-[var(--color-brandblue)]" aria-hidden />
        <input
          type="search"
          defaultValue={speciality.replace(/-/g, " ")}
          aria-label="Search doctors"
          placeholder="Search by Doctors"
          className="bg-transparent outline-none w-full text-sm capitalize text-[var(--color-darknavy)] py-2"
        />
      </label>
      <button
        type="submit"
        aria-label="Search"
        className="bg-[var(--color-brandblue)] hover:bg-[var(--color-darknavy)] text-white rounded-md px-5 transition-colors flex items-center justify-center"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
