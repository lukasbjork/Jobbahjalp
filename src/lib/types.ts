// Delade typer för Jobbhjälp. Används av både klient och server-routes.

/** Flikarna i appen. */
export type TabId = "cv" | "brev" | "fragor" | "mejl" | "ansokningar";

/** Ton för det personliga brevet. */
export type LetterTone = "formell" | "personlig";

/** Svarslängd för frågesvar. */
export type AnswerLength = "kort" | "medel" | "lång";

/** Status för en sparad ansökan. */
export type ApplicationStatus =
  | "sökt"
  | "intervju"
  | "fick-jobbet"
  | "fick-inte-jobbet";

/** En sparad jobbansökan (lagras i webbläsarens localStorage). */
export interface Application {
  id: string;
  company: string;
  role: string;
  url: string;
  /** ISO-datum, t.ex. "2026-06-16". */
  date: string;
  status: ApplicationStatus;
  createdAt: number;
}

// --- API: begäran och svar ---

export interface LetterRequest {
  cvText: string;
  jobDescription: string;
  company?: string;
  role?: string;
  tone?: LetterTone;
}
export interface LetterResponse {
  letter: string;
}

export interface AnswerRequest {
  cvText: string;
  question: string;
  jobDescription?: string;
  length?: AnswerLength;
}
export interface AnswerResponse {
  answer: string;
}

export interface EmailRequest {
  cvText: string;
  recruiterName?: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  intent?: string;
}
export interface EmailResponse {
  subject: string;
  body: string;
}

/** Enhetligt felsvar från API-routerna. */
export interface ApiError {
  error: string;
}
