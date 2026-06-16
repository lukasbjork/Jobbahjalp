import type { Application, ApplicationStatus } from "@/lib/types";

// Metadata och hjälpare för ansökningslistan (Funktion 4).

export const STATUS_ORDER: ApplicationStatus[] = [
  "sökt",
  "intervju",
  "fick-jobbet",
  "fick-inte-jobbet",
];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sökt: "Sökt",
  intervju: "Intervju",
  "fick-jobbet": "Fick jobbet",
  "fick-inte-jobbet": "Fick inte jobbet",
};

/** Tailwind-klasser för den färgade statusetiketten. */
export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  sökt: "bg-blue-100 text-blue-800 border-blue-200",
  intervju: "bg-amber-100 text-amber-800 border-amber-200",
  "fick-jobbet": "bg-green-100 text-green-800 border-green-200",
  "fick-inte-jobbet": "bg-stone-100 text-stone-600 border-stone-200",
};

/** Dagens datum som ISO-sträng, t.ex. "2026-06-16". */
export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

/** Skapar en ny ansökan med id och createdAt ifyllda. */
export function createApplication(
  data: Omit<Application, "id" | "createdAt">,
): Application {
  return {
    ...data,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
}
