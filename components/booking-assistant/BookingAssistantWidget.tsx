"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send, Sparkles, Star, X } from "lucide-react";

import { askBookingAssistant } from "@/lib/client/booking-assistant-service";
import {
  bookPhysicalAppointment,
  bookVideoConsultation,
} from "@/lib/client/web-booking-service";
import { fetchFirstAvailableSlot } from "@/lib/client/doctor-slots-service";
import { parseDisplayTimeTo24Hour } from "@/lib/format-appointment-slot";
import type { BookingAssistantResult } from "@/lib/services/booking-assistant";
import type { ApiDoctor } from "@/lib/types/marham-api";

type Suggestion = BookingAssistantResult["suggestions"][number];

type AssistantTurn = {
  role: "user" | "assistant";
  text?: string;
  result?: BookingAssistantResult;
  error?: boolean;
};

const EXAMPLES = [
  "Headache for 3 days, experienced doctor in DHA Lahore after 6 PM",
  "Skin allergy, female dermatologist in Karachi",
  "Child has fever, online consultation today",
];

/** Best-effort normalise a Pakistani number to E.164 for the booking API. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  if (digits.length === 10) return `+92${digits}`;
  return digits;
}

function Stars({ rating }: { rating: number }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function DoctorResultCard({
  doctor,
  suggestion,
}: {
  doctor: ApiDoctor;
  suggestion?: Suggestion;
}) {
  const [mode, setMode] = useState<"idle" | "form" | "done">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ text: string; paymentUrl?: string } | null>(null);

  const hospital =
    (suggestion
      ? doctor.hospitals?.find((h) => h.doctorHospitalId === suggestion.doctorHospitalId)
      : undefined) ?? doctor.hospitals?.[0];
  const doctorHospitalId = suggestion?.doctorHospitalId ?? hospital?.doctorHospitalId;
  const hospitalId = suggestion?.hospitalId ?? hospital?.hospitalId;
  const isVideo = Number(hospital?.hospitalType) === 2;

  const area = [hospital?.hospitalArea, hospital?.hospitalCity].filter(Boolean).join(", ");
  const fee = hospital?.fee;

  async function resolveSlot(): Promise<{ date: string; time: string; display: string } | null> {
    if (suggestion) {
      return {
        date: suggestion.date,
        time: parseDisplayTimeTo24Hour(suggestion.time),
        display: suggestion.time,
      };
    }
    const first = await fetchFirstAvailableSlot(doctor.doctorId, hospitalId);
    return first ? { date: first.date, time: first.time, display: first.displayTime } : null;
  }

  async function confirm() {
    setError(null);
    if (!name.trim()) {
      setError("Please enter the patient name.");
      return;
    }
    const patientPhone = normalizePhone(phone);
    if (patientPhone.replace(/\D/g, "").length < 11) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!doctorHospitalId) {
      setError("Couldn't resolve this doctor's clinic. Please try another.");
      return;
    }

    setBusy(true);
    try {
      const slot = await resolveSlot();
      if (!slot) {
        setError("No available slots right now. Please try another doctor.");
        return;
      }

      if (isVideo) {
        const r = await bookVideoConsultation({
          doctorId: doctor.doctorId,
          doctorHospitalId,
          date: slot.date,
          time: slot.time,
          patientPhone,
          patientName: name.trim(),
        });
        if (!r.success || !r.data?.onlineConsultationId) {
          setError(r.message || "Unable to complete booking. Please try again.");
          return;
        }
        setDone({
          text: `Video consultation reserved for ${slot.display}. Complete payment to confirm.`,
          paymentUrl: r.data.paymentUrl ?? undefined,
        });
        setMode("done");
      } else {
        const r = await bookPhysicalAppointment({
          doctorId: doctor.doctorId,
          doctorHospitalId,
          date: slot.date,
          time: slot.time,
          patientPhone,
          patientName: name.trim(),
        });
        if (!r.success || !r.data?.id) {
          setError(r.message || "Unable to complete booking. Please try again.");
          return;
        }
        setDone({
          text: `Appointment confirmed for ${slot.display} (booking #${r.data.id}). We'll message you the clinic details.`,
        });
        setMode("done");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--color-paleblue)] bg-white p-3 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-darknavy)]">{doctor.name}</p>
          <p className="truncate text-xs text-muted-foreground">{doctor.specialityName}</p>
        </div>
        <Stars rating={doctor.rating ?? 0} />
      </div>

      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--color-darknavy)]">
        {doctor.experience ? <span>{doctor.experience} yrs exp</span> : null}
        {area ? <span className="truncate">{area}</span> : null}
        {fee ? <span>Rs. {Number(fee).toLocaleString("en-PK")}</span> : null}
      </div>

      {suggestion && mode !== "done" ? (
        <p className="mt-1.5 rounded bg-[var(--color-frostblue)] px-2 py-1 text-xs text-[var(--color-brandblue)]">
          Earliest: {suggestion.date} at {suggestion.time}
        </p>
      ) : null}

      {mode === "idle" ? (
        <button
          type="button"
          onClick={() => setMode("form")}
          className="mt-2 w-full rounded-md bg-[var(--color-darknavy)] py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brandblue)]"
        >
          Book appointment
        </button>
      ) : null}

      {mode === "form" ? (
        <div className="mt-2 space-y-2">
          {error ? <p className="text-xs text-[var(--color-mainred)]">{error}</p> : null}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Patient name"
            className="w-full rounded-md border border-[var(--color-paleblue)] px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brandblue)]/30"
            autoComplete="name"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone e.g. 0300 1234567"
            inputMode="tel"
            className="w-full rounded-md border border-[var(--color-paleblue)] px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brandblue)]/30"
            autoComplete="tel"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setError(null);
              }}
              className="rounded-md border border-[var(--color-paleblue)] px-3 py-2 text-xs font-medium text-[var(--color-darknavy)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--color-maingreen)] py-2 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {busy ? "Booking…" : `Confirm ${isVideo ? "video consult" : "appointment"}`}
            </button>
          </div>
        </div>
      ) : null}

      {mode === "done" && done ? (
        <div className="mt-2 space-y-2">
          <p className="flex items-start gap-1.5 rounded-md bg-[var(--color-lightgreen)] px-2.5 py-2 text-xs text-[var(--color-maingreen)]">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{done.text}</span>
          </p>
          {done.paymentUrl ? (
            <a
              href={done.paymentUrl}
              className="block w-full rounded-md bg-[var(--color-darknavy)] py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brandblue)]"
            >
              Complete payment →
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AssistantMessage({ result }: { result: BookingAssistantResult }) {
  const suggestionByDoctor = new Map(result.suggestions.map((s) => [s.doctorId, s]));

  return (
    <div className="space-y-2">
      {result.understood.summary ? (
        <p className="text-sm text-[var(--color-darknavy)]">{result.understood.summary}</p>
      ) : null}

      {result.clarification ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {result.clarification}
        </p>
      ) : null}

      {result.relaxedFilters.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          No exact match, so I broadened your search (ignored:{" "}
          {result.relaxedFilters.join(", ")}).
        </p>
      ) : null}

      {result.doctors.length > 0 ? (
        <div className="space-y-2">
          {result.doctors.slice(0, 5).map((doctor) => (
            <DoctorResultCard
              key={doctor.doctorId}
              doctor={doctor}
              suggestion={suggestionByDoctor.get(doctor.doctorId)}
            />
          ))}
        </div>
      ) : !result.clarification ? (
        <p className="text-sm text-muted-foreground">
          I couldn&apos;t find a matching doctor. Try rephrasing or adding your city.
        </p>
      ) : null}
    </div>
  );
}

export function BookingAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  const send = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setTurns((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const result = await askBookingAssistant(trimmed);
      setTurns((prev) => [...prev, { role: "assistant", result }]);
    } catch (error) {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          error: true,
          text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher — stacked just above the WhatsApp bubble (bottom-right). */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[104px] right-5 z-[16000155] flex items-center gap-2 rounded-full bg-[var(--color-brandblue)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Open the AI booking assistant"
        >
          <Sparkles className="h-5 w-5" />
          Book with AI
        </button>
      ) : null}

      {/* Chat panel */}
      {open ? (
        <div className="fixed bottom-[104px] right-5 z-[16000155] flex h-[540px] max-h-[calc(100svh-140px)] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--color-paleblue)] bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[var(--color-darknavy)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold leading-tight">Marham Assistant</p>
                <p className="text-[11px] leading-tight text-white/70">
                  Describe your problem, get a doctor
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/10"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-pagegray p-3">
            {turns.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-darknavy)]">
                  Hi! Tell me what you need — your symptom, city, and any preference — and I&apos;ll
                  find the right doctor.
                </p>
                <div className="space-y-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => send(ex)}
                      className="block w-full rounded-lg border border-[var(--color-paleblue)] bg-white px-3 py-2 text-left text-xs text-[var(--color-darknavy)] transition-colors hover:border-[var(--color-brandblue)]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--color-brandblue)] px-3 py-2 text-sm text-white">
                    {turn.text}
                  </p>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">
                    {turn.result ? (
                      <AssistantMessage result={turn.result} />
                    ) : (
                      <p
                        className={`text-sm ${turn.error ? "text-[var(--color-mainred)]" : "text-[var(--color-darknavy)]"}`}
                      >
                        {turn.text}
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}

            {loading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding the right doctor…
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-[var(--color-paleblue)] bg-white p-2.5"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="e.g. headache, experienced doctor in Lahore"
              className="max-h-24 min-h-[40px] flex-1 resize-none rounded-lg border border-[var(--color-paleblue)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brandblue)]/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-darknavy)] text-white transition-colors hover:bg-[var(--color-brandblue)] disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
