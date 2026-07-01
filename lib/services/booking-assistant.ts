import type { BookingAssistantInput, BookingIntent } from "@/lib/schemas/booking-assistant";
import type { GetDoctorsInput } from "@/lib/schemas/doctors";
import type { ApiDoctor } from "@/lib/types/marham-api";
import {
  getSpecialityCatalog,
  getSymptomCatalog,
  type CatalogItem,
} from "@/lib/db/queries/booking-assistant-catalog";
import { getDoctorListing } from "@/lib/services/doctors";
import { getDoctorAvailableSlots } from "@/lib/services/doctor-availability";
import { parseBookingIntent } from "@/lib/services/ai/booking-assistant-llm";

const KARACHI_TZ = "Asia/Karachi";
const SLOT_SUGGESTION_LIMIT = 3;

export interface SuggestedSlot {
  doctorId: number;
  doctorHospitalId: number;
  hospitalId: number;
  date: string;
  time: string;
  timeSlot: number;
}

export interface BookingAssistantResult {
  /** Human-readable recap plus the structured intent, for UI transparency. */
  understood: {
    summary: string | null;
    intent: BookingIntent;
    resolved: { symptomId: number | null; specialityId: number | null };
  };
  /** Follow-up question when we couldn't determine what to search for. */
  clarification: string | null;
  /** Matching doctors from the existing listing pipeline. */
  doctors: ApiDoctor[];
  /**
   * Constraints that were dropped to avoid a zero-result search, e.g.
   * ["preferred time", "area"]. Lets the UI say "broadened your search".
   */
  relaxedFilters: string[];
  /** Best-effort concrete slot for the top few doctors on the requested date. */
  suggestions: SuggestedSlot[];
  meta: { total: number; page: number; lastPage: number } | null;
}

/** YYYY-MM-DD / HH:mm in Asia/Karachi, independent of server timezone. */
function nowInKarachi(): { date: string; time: string } {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: KARACHI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: KARACHI_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  return { date, time };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve free text (e.g. "headache", "child specialist") to a real catalog id.
 * Tries exact match, then substring either direction, then best token overlap.
 */
function resolveCatalog(text: string | null | undefined, items: CatalogItem[]): number | null {
  if (!text) return null;
  const needle = normalize(text);
  if (!needle) return null;

  let best: { id: number; score: number } | null = null;
  const needleTokens = new Set(needle.split(" "));

  for (const item of items) {
    const hay = normalize(item.name);
    if (!hay) continue;

    let score = 0;
    if (hay === needle) score = 1;
    else if (hay.includes(needle) || needle.includes(hay)) score = 0.8;
    else {
      const hayTokens = hay.split(" ");
      const overlap = hayTokens.filter((t) => needleTokens.has(t)).length;
      const union = new Set([...needleTokens, ...hayTokens]).size;
      score = union > 0 ? overlap / union : 0;
    }

    if (score > 0 && (!best || score > best.score)) best = { id: item.id, score };
  }

  return best && best.score >= 0.5 ? best.id : null;
}

/** "18:00" -> 1800 (the HHMM integer the listing/slot filters use). */
function timeToSlot(time: string | null | undefined): number | null {
  if (!time) return null;
  const m = time.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 100 + Number(m[2]);
}

/** Pick a listing on the doctor that matches the requested consultation type. */
function pickHospital(
  doctor: ApiDoctor,
  consultationType: number | null | undefined,
): { doctorHospitalId: number; hospitalId: number } | null {
  const hospitals = (doctor as unknown as {
    hospitals?: { doctorHospitalId: number; hospitalId: number; hospitalType: number }[];
  }).hospitals;
  if (!hospitals || hospitals.length === 0) return null;

  const wantOnline = consultationType === 2;
  const match =
    hospitals.find((h) =>
      wantOnline ? Number(h.hospitalType) === 2 : Number(h.hospitalType) !== 2,
    ) ?? hospitals[0];

  return { doctorHospitalId: match.doctorHospitalId, hospitalId: match.hospitalId };
}

/**
 * For the top doctors, find the first available slot on the requested date at or
 * after the requested earliest time. Best-effort: any failure is swallowed so a
 * missing slot never breaks the recommendation list.
 */
async function suggestSlots(
  doctors: ApiDoctor[],
  intent: BookingIntent,
  fallbackDate: string,
): Promise<SuggestedSlot[]> {
  const date = intent.preferredDate ?? fallbackDate;
  const earliest = timeToSlot(intent.earliestTime) ?? 0;

  const results = await Promise.all(
    doctors.slice(0, SLOT_SUGGESTION_LIMIT).map(async (doctor): Promise<SuggestedSlot | null> => {
      const hospital = pickHospital(doctor, intent.consultationType);
      const doctorId = (doctor as unknown as { doctorId: number }).doctorId;
      if (!hospital || !doctorId) return null;

      try {
        const res = (await getDoctorAvailableSlots({
          doctorId,
          hospitalId: hospital.hospitalId,
          date,
        })) as {
          availableSlots?: { date: string; slots?: { time: string; timeSlot: number; available: boolean }[] }[];
        };

        const day = res.availableSlots?.find((d) => d.date === date) ?? res.availableSlots?.[0];
        const slot = day?.slots?.find((s) => s.available && s.timeSlot >= earliest);
        if (!day || !slot) return null;

        return {
          doctorId,
          doctorHospitalId: hospital.doctorHospitalId,
          hospitalId: hospital.hospitalId,
          date: day.date,
          time: slot.time,
          timeSlot: slot.timeSlot,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((s): s is SuggestedSlot => s !== null);
}

/**
 * Natural-language booking assistant: free text -> understood intent -> matching
 * doctors (+ a suggested slot). It never books — the caller presents the results
 * and the patient confirms via the existing booking flow.
 */
export async function runBookingAssistant(
  input: BookingAssistantInput,
): Promise<BookingAssistantResult> {
  const [symptomCatalog, specialityCatalog] = await Promise.all([
    getSymptomCatalog(),
    getSpecialityCatalog(),
  ]);

  const now = nowInKarachi();
  const intent = await parseBookingIntent(input.message, {
    todayDate: now.date,
    nowTime: now.time,
    defaultCity: input.city,
  });

  // Resolve to real ids. A matched symptom is preferred: getDoctorListing expands
  // a symptom to all of its specialities, which is broader than a single one.
  const symptomId = resolveCatalog(intent.symptomText, symptomCatalog);
  const specialityId = resolveCatalog(intent.specialityText, specialityCatalog);

  const understood = {
    summary: intent.summary ?? null,
    intent,
    resolved: { symptomId, specialityId },
  };

  // Nothing to search on — ask a follow-up instead of returning random doctors.
  if (!symptomId && !specialityId) {
    return {
      understood,
      clarification:
        intent.clarification ??
        "Could you tell me your main symptom (or which kind of specialist you need) and your city?",
      doctors: [],
      relaxedFilters: [],
      suggestions: [],
      meta: null,
    };
  }

  const experiencePreferred = intent.experiencePreferred === true;
  const core = {
    page: 1,
    symptomId: symptomId ?? undefined,
    specialityId: symptomId ? undefined : specialityId ?? undefined,
    city: intent.city ?? input.city ?? undefined,
    gender: intent.gender ?? undefined,
    sortBy: experiencePreferred ? ("experience" as const) : undefined,
    sortDirection: experiencePreferred ? ("DESC" as const) : undefined,
  };
  const area = intent.area ?? undefined;
  const consultationType = intent.consultationType ?? undefined;
  const timeSlot = timeToSlot(intent.earliestTime) ?? undefined;

  // Progressive relaxation: keep the essentials (symptom/speciality, city,
  // experience) always; drop the most-restrictive optional filters — preferred
  // time first, then area, then consultation type — until we get results. The
  // dropped-but-still-wanted "preferred time" still guides slot suggestion below.
  const optional: { key: "time" | "area" | "type"; label: string; active: boolean }[] = [
    { key: "time", label: "preferred time", active: timeSlot !== undefined },
    { key: "area", label: "area", active: area !== undefined },
    { key: "type", label: "consultation type", active: consultationType !== undefined },
  ];

  let doctors: ApiDoctor[] = [];
  let meta: BookingAssistantResult["meta"] = { total: 0, page: 1, lastPage: 0 };
  let relaxedFilters: string[] = [];

  for (let dropCount = 0; dropCount <= optional.length; dropCount++) {
    const dropped = new Set(optional.slice(0, dropCount).map((o) => o.key));
    const query = {
      ...core,
      area: dropped.has("area") ? undefined : area,
      consultationType: dropped.has("type") ? undefined : consultationType,
      timeSlot: dropped.has("time") ? undefined : timeSlot,
    } as GetDoctorsInput;

    const res = await getDoctorListing(query);
    if (dropCount === 0) meta = res.meta;
    if (res.doctors.length > 0) {
      doctors = res.doctors;
      meta = res.meta;
      relaxedFilters = optional
        .slice(0, dropCount)
        .filter((o) => o.active)
        .map((o) => o.label);
      break;
    }
    // If dropping the next filter wouldn't change anything (it wasn't set),
    // there's nothing left to relax — stop early.
    if (optional.slice(dropCount).every((o) => !o.active)) break;
  }

  const suggestions = await suggestSlots(doctors, intent, now.date);

  return {
    understood,
    clarification: intent.clarification ?? null,
    doctors,
    relaxedFilters,
    suggestions,
    meta,
  };
}
