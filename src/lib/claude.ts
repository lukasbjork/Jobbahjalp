import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { BetaContentBlock } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { z } from "zod";

/**
 * Server-side Claude-lager. API-nyckeln läses bara här, aldrig i klienten.
 *
 * Modell: standard `claude-sonnet-5`, kan bytas via miljövariabeln
 * ANTHROPIC_MODEL.
 */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

/** Kastas när API-nyckeln saknas på servern. */
export class MissingKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY saknas på servern.");
    this.name = "MissingKeyError";
  }
}

/** Kastas vid ogiltig/återkallad API-nyckel. */
export class InvalidKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY verkar ogiltig eller återkallad.");
    this.name = "InvalidKeyError";
  }
}

/** Kastas vid kvarstående 429 (kvot/hastighetsgräns), så att routen kan svara med statuskod 429. */
export class RateLimitError extends Error {
  constructor(message = "För många anrop just nu.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new MissingKeyError();
  return new Anthropic({ apiKey });
}

/**
 * Mappar Anthropic-SDK:ns typade fel till våra egna feltyper. SDK:n
 * försöker redan själv igen automatiskt vid 429/5xx (med backoff) innan den
 * ger upp, så vi behöver ingen egen retry-loop här.
 */
function mapError(err: unknown): never {
  if (err instanceof Anthropic.RateLimitError) {
    throw new RateLimitError(err.message);
  }
  if (err instanceof Anthropic.AuthenticationError) {
    throw new InvalidKeyError();
  }
  throw err;
}

interface BaseOptions {
  system: string;
  user: string;
  maxOutputTokens?: number;
}

/** Plockar ut den sammanlagda textens innehåll ur ett svar. */
function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/** Samma som extractText, men för svar från beta-namespacets client.beta.messages. */
function extractBetaText(content: BetaContentBlock[]): string {
  return content
    .filter((block): block is BetaContentBlock & { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/** Genererar ren text (personligt brev, frågesvar). */
export async function generateText(opts: BaseOptions): Promise<string> {
  const client = getClient();
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: opts.maxOutputTokens ?? 2400,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    });
    return extractText(res.content);
  } catch (err) {
    mapError(err);
  }
}

const EmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

/** Genererar strukturerad JSON för mejl: { subject, body }. */
export async function generateEmail(
  opts: BaseOptions,
): Promise<{ subject: string; body: string }> {
  const client = getClient();
  try {
    // .parse() + output_format ligger i SDK:ns beta-namespace i den
    // installerade versionen (0.70.x) - inte en separat betaflagga.
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: opts.maxOutputTokens ?? 1600,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
      output_format: betaZodOutputFormat(EmailSchema),
    });

    if (res.parsed_output) {
      return {
        subject: res.parsed_output.subject.trim(),
        body: res.parsed_output.body.trim(),
      };
    }
    // Fallback: om parsning mot förmodan misslyckades, lägg allt i body.
    return { subject: "", body: extractBetaText(res.content) };
  } catch (err) {
    mapError(err);
  }
}
