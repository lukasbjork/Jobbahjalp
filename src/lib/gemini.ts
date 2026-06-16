import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Server-side Gemini-lager. API-nyckeln läses bara här, aldrig i klienten.
 *
 * Modell: standard `gemini-3.5-flash`, kan bytas via miljövariabeln
 * GEMINI_MODEL (t.ex. `gemini-3.1-flash-lite` för högre gratisgränser).
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

/** Kastas när API-nyckeln saknas på servern. */
export class MissingKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY saknas på servern.");
    this.name = "MissingKeyError";
  }
}

/** Kastas vid 429/slut kvot, så att routen kan svara med statuskod 429. */
export class RateLimitError extends Error {
  constructor(message = "För många anrop just nu.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Kör ett anrop med enkel retry och exponentiell backoff vid 429 (kvot) och
 * 503 (överbelastad). Vid kvarstående 429 kastas RateLimitError.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = errorText(err);
      const isRateLimit = /\b429\b|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(
        msg,
      );
      const isOverloaded = /\b503\b|UNAVAILABLE|overloaded/i.test(msg);
      if ((isRateLimit || isOverloaded) && attempt < retries) {
        await sleep(600 * 2 ** attempt + Math.floor(Math.random() * 300));
        continue;
      }
      if (isRateLimit) throw new RateLimitError(msg);
      throw err;
    }
  }
  throw lastErr;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingKeyError();
  return new GoogleGenAI({ apiKey });
}

interface BaseOptions {
  system: string;
  user: string;
  /**
   * Generöst tilltaget. Gemini-modeller kan använda "tänk"-tokens som äter av
   * budgeten, så vi håller taket högt för att garantera ett komplett svar.
   */
  maxOutputTokens?: number;
  temperature?: number;
}

/** Genererar ren text (personligt brev, frågesvar). */
export async function generateText(opts: BaseOptions): Promise<string> {
  const ai = getClient();
  const res = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: opts.user,
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxOutputTokens ?? 2400,
      },
    }),
  );
  return (res.text ?? "").trim();
}

/** Genererar strukturerad JSON för mejl: { subject, body }. */
export async function generateEmail(
  opts: BaseOptions,
): Promise<{ subject: string; body: string }> {
  const ai = getClient();
  const res = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: opts.user,
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxOutputTokens ?? 1600,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ["subject", "body"],
        },
      },
    }),
  );

  const raw = (res.text ?? "").trim();
  let parsed: { subject?: string; body?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Fallback: om modellen mot förmodan inte gav giltig JSON, lägg allt i body.
    return { subject: "", body: raw };
  }
  return {
    subject: (parsed.subject ?? "").trim(),
    body: (parsed.body ?? "").trim(),
  };
}
