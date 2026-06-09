type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

type QueuedAnalyticsCall = {
  service: "gtag" | "mixpanel" | "moengage"
  method: string
  args: unknown[]
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    mixpanel?: { track: (eventName: string, params?: AnalyticsParams) => void }
    Moengage?: { track_event: (eventName: string, params?: AnalyticsParams) => void }
  }
}

function isMixpanelLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.mixpanel !== "undefined"
}

function isMoEngageLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.Moengage !== "undefined"
}

function scheduleAnalytics(callback: () => void): void {
  if (typeof window === "undefined") return

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 2000 })
  } else {
    setTimeout(callback, 1)
  }
}

let analyticsQueue: QueuedAnalyticsCall[] = []
let analyticsTimeout: ReturnType<typeof setTimeout> | null = null
const BATCH_DELAY = 50

function queueAnalytics(
  service: QueuedAnalyticsCall["service"],
  method: string,
  ...args: unknown[]
): void {
  analyticsQueue.push({ service, method, args })

  if (!analyticsTimeout) {
    analyticsTimeout = setTimeout(() => {
      processAnalyticsQueue()
      analyticsTimeout = null
    }, BATCH_DELAY)
  }
}

function processAnalyticsQueue(immediate = false): void {
  const queue = analyticsQueue.splice(0)

  if (analyticsTimeout) {
    clearTimeout(analyticsTimeout)
    analyticsTimeout = null
  }

  if (queue.length === 0) return

  const processEvents = () => {
    queue.forEach(({ service, method, args }) => {
      try {
        if (service === "gtag" && typeof window.gtag !== "undefined") {
          window.gtag(method, ...args)
        } else if (service === "mixpanel" && isMixpanelLoaded()) {
          const [eventName, params] = args as [string, AnalyticsParams?]
          window.mixpanel?.track(eventName, params)
        } else if (service === "moengage" && isMoEngageLoaded()) {
          const [eventName, params] = args as [string, AnalyticsParams?]
          window.Moengage?.track_event(eventName, params)
        }
      } catch (error) {
        console.error("Analytics error:", error)
      }
    })
  }

  if (immediate) {
    processEvents()
  } else {
    scheduleAnalytics(processEvents)
  }
}

function flushAnalyticsQueue(): void {
  if (analyticsQueue.length > 0) {
    processAnalyticsQueue(true)
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flushAnalyticsQueue())
  window.addEventListener("beforeunload", () => flushAnalyticsQueue())
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushAnalyticsQueue()
    }
  })
}

export async function fireEvent(
  eventName: string,
  params: AnalyticsParams = {},
): Promise<void> {
  if (typeof window === "undefined") return

  try {
    scheduleAnalytics(() => {
      if (typeof window.gtag !== "undefined") {
        queueAnalytics("gtag", "event", eventName, params)
      }

      if (isMixpanelLoaded()) {
        queueAnalytics("mixpanel", "track", eventName, params)
      }

      if (isMoEngageLoaded()) {
        queueAnalytics("moengage", "track_event", eventName, params)
      }
    })
  } catch (error) {
    console.error("Error sending event:", error)
  }
}

export function gtagEvent(
  eventName: string,
  params: AnalyticsParams = {},
): void {
  if (typeof window === "undefined" || typeof window.gtag === "undefined") return
  window.gtag("event", eventName, params)
}

export type { AnalyticsParams }
