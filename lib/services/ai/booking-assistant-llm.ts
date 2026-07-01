import { z } from "zod";
import { HttpError } from "@/lib/api/http-error";
import { bookingIntentSchema, type BookingIntent } from "@/lib/schemas/booking-assistant";

/**
 * LLM boundary for the booking assistant.
 *
 * This is the ONLY file that talks to a model. It runs the parse through the FREE
 * Browserbase Model Gateway via Stagehand's `extract()` — the raw `llmClient`
 * path does NOT use Model Gateway (it needs a provider key), but `extract()`
 * performs inference server-side on Browserbase, so it needs only the
 * BROWSERBASE_API_KEY. Everyone else just calls `parseBookingIntent()` and gets a
 * validated `BookingIntent`; to move to a direct Anthropic/OpenAI key later, swap
 * only the body of `runExtraction()`.
 *
 * Trade-off: every call spins up a cloud browser session (~1-3s). We navigate to
 * a tiny in-memory data-URL page holding the patient's message (no real network
 * page load) and extract the intent from it.
 */

const MODEL_GATEWAY_MODEL = "google/gemini-2.5-flash";

// Provider keys present in the app env would make Stagehand attempt LOCAL
// inference with that provider instead of the (free) server-side Model Gateway.
// We hide them for the duration of the call so Model Gateway is always used.
const PROVIDER_KEYS = [
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
];

export interface ParseContext {
  /** Today's date in Asia/Karachi, YYYY-MM-DD — anchors "today"/"tomorrow". */
  todayDate: string;
  /** Current wall-clock time in Asia/Karachi, HH:mm. */
  nowTime: string;
  /** Optional city already selected in the UI, used only as a fallback. */
  defaultCity?: string;
}

/** Flat, model-friendly schema for extraction (mapped into BookingIntent after). */
const extractionSchema = z.object({
  symptomText: z.string().nullable(),
  specialityText: z.string().nullable(),
  city: z.string().nullable(),
  area: z.string().nullable(),
  gender: z.enum(["male", "female", "all"]).nullable(),
  experiencePreferred: z.boolean().nullable(),
  consultationType: z.enum(["physical", "online"]).nullable(),
  preferredDate: z.string().nullable(),
  earliestTime: z.string().nullable(),
  summary: z.string().nullable(),
  clarification: z.string().nullable(),
});

function buildPageHtml(message: string, ctx: ParseContext): string {
  const cityNote = ctx.defaultCity
    ? `If no city is stated, assume the city is ${ctx.defaultCity}.`
    : "";
  const body =
    `PATIENT REQUEST:\n${message}\n\n` +
    `CONTEXT (for resolving relative dates/times):\n` +
    `Today in Asia/Karachi is ${ctx.todayDate}. Current time is ${ctx.nowTime}.\n` +
    cityNote;
  return `<pre>${body.replace(/[<>&]/g, " ")}</pre>`;
}

const INSTRUCTION = [
  "The page shows a patient's free-text request for a doctor's appointment plus a CONTEXT block.",
  "Extract these fields (use null when not stated or implied):",
  "- symptomText: the core medical complaint in 1-3 words (e.g. 'headache'). Do NOT convert it to a doctor type.",
  "- specialityText: a doctor type ONLY if the patient explicitly names one (e.g. 'dermatologist', 'child specialist').",
  "- city, area: place names if mentioned (e.g. city 'Lahore', area 'DHA').",
  "- gender: 'male' | 'female' | 'all' if a preference is stated.",
  "- experiencePreferred: true if they ask for an experienced/senior/expert doctor.",
  "- consultationType: 'physical' for in-clinic, 'online' for video/online.",
  "- preferredDate: YYYY-MM-DD, resolving 'today'/'tomorrow' against the CONTEXT date.",
  "- earliestTime: 24-hour HH:mm ('after 6 PM' => '18:00').",
  "- summary: one short sentence recapping the request.",
  "- clarification: if NEITHER a symptom NOR a doctor type is present, a short question asking for it; else null.",
].join(" ");

type Extraction = z.infer<typeof extractionSchema>;

function toIntent(raw: Extraction): BookingIntent {
  const mapped = {
    symptomText: raw.symptomText,
    specialityText: raw.specialityText,
    city: raw.city,
    area: raw.area,
    gender: raw.gender,
    experiencePreferred: raw.experiencePreferred,
    consultationType:
      raw.consultationType === "online" ? 2 : raw.consultationType === "physical" ? 1 : null,
    preferredDate: raw.preferredDate,
    earliestTime: raw.earliestTime,
    summary: raw.summary,
    clarification: raw.clarification,
  };
  const parsed = bookingIntentSchema.safeParse(mapped);
  return parsed.success ? parsed.data : {};
}

async function runExtraction(message: string, ctx: ParseContext): Promise<Extraction> {
  // Dynamic import keeps Stagehand (and its heavy browser deps) out of module
  // graphs that never invoke the assistant.
  const { Stagehand } = await import("@browserbasehq/stagehand");

  const saved: Record<string, string | undefined> = {};
  for (const key of PROVIDER_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    model: MODEL_GATEWAY_MODEL,
    verbose: 0,
  });

  try {
    await stagehand.init();
    const sh = stagehand as unknown as {
      context: { pages(): { goto(url: string, opts?: unknown): Promise<unknown> }[] };
      extract(instruction: string, schema: unknown): Promise<unknown>;
    };
    const page = sh.context.pages()[0];
    await page.goto("data:text/html," + encodeURIComponent(buildPageHtml(message, ctx)), {
      waitUntil: "domcontentloaded",
    });
    const result = await sh.extract(INSTRUCTION, extractionSchema);
    const parsed = extractionSchema.safeParse(result);
    if (!parsed.success) throw new Error("Model returned an unexpected shape");
    return parsed.data;
  } finally {
    await stagehand.close().catch(() => {});
    for (const key of PROVIDER_KEYS) {
      if (saved[key] !== undefined) process.env[key] = saved[key];
    }
  }
}

/**
 * Turn the patient's free text into a validated {@link BookingIntent}.
 * Throws a 503 HttpError if the model is unavailable so the route can surface a
 * clean, actionable message instead of a generic 500.
 */
export async function parseBookingIntent(
  message: string,
  ctx: ParseContext,
): Promise<BookingIntent> {
  try {
    const raw = await runExtraction(message, ctx);
    return toIntent(raw);
  } catch (error) {
    console.error("booking-assistant LLM parse failed:", error);
    throw new HttpError(
      503,
      "The booking assistant is temporarily unavailable. Please try again in a moment.",
    );
  }
}
