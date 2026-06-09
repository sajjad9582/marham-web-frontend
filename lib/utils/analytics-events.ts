import { fireEvent, gtagEvent, type AnalyticsParams } from "@/lib/utils/analytics"

// Extracted from .doc/all-goals-and-events-optimized.js

export async function fireEventBookOcSubmittedRequest(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("dr_book_oc_submitted_oc_request", params)
}

export async function fireEventPhysicalConsultationBooked(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("dr_book_appt_submitted_appt_request", params)
}

/** Standard GA4 event — not defined as a named wrapper in the legacy file. */
export async function fireEventPageView(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("page_view", params)
}

/** Standard GA4 event — not defined as a named wrapper in the legacy file. */
export async function fireEventUserEngagement(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("user_engagement", params)
}

export async function fireEventOpenedDoctorListing(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("opened_dr_listing", params)
}

/** Standard GA4 event — not defined as a named wrapper in the legacy file. */
export async function fireEventFormStart(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("form_start", params)
}

export async function fireEventOpenedOCRequestPage(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("opened_book_oc_screen", params)
}

export async function fireEventOpenedListingModalOc(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("opened_listing_modal_oc", params)
}

/** Legacy `gaEventPaymentMethodsPage` — gtag-only in the source file. */
export function gaEventPaymentMethodsPage(): void {
  gtagEvent("dr_book_oc_opened_payment_methods", {
    event_category: "online-appointment",
  })
}

export async function fireEventDrBookOcOpenedPaymentMethods(
  params: AnalyticsParams = {},
): Promise<void> {
  gaEventPaymentMethodsPage()
  await fireEvent("dr_book_oc_opened_payment_methods", params)
}

export async function fireEventOcRequestSubmittedPaymentScreenOpened(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("oc_request_submitted_payment_screen_opened", params)
}

export async function fireEventOpenedListingModalAppointment(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("opened_listing_modal_appointment", params)
}

export async function fireEventOpenedCallcenterPage(
  params: AnalyticsParams = {},
): Promise<void> {
  await fireEvent("opened_book_appointment_screen", params)
}
