import "server-only";
import { NextResponse } from "next/server";
import {
  BillingError,
  InvalidKeyError,
  MissingKeyError,
  RateLimitError,
} from "@/lib/claude";
import type { ApiError } from "@/lib/types";

/** 400 med ett begripligt svenskt meddelande. */
export function badRequest(message: string): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Mappar ett fel till ett vänligt svenskt svar med rätt statuskod. */
export function errorResponse(err: unknown): NextResponse<ApiError> {
  if (err instanceof RateLimitError) {
    return NextResponse.json(
      { error: "För många anrop just nu. Försök igen om en liten stund." },
      { status: 429 },
    );
  }
  if (err instanceof MissingKeyError) {
    return NextResponse.json(
      {
        error:
          "Servern saknar API-nyckel. Lägg in ANTHROPIC_API_KEY och försök igen.",
      },
      { status: 500 },
    );
  }
  if (err instanceof InvalidKeyError) {
    return NextResponse.json(
      {
        error:
          "API-nyckeln verkar ogiltig eller återkallad. Kontrollera ANTHROPIC_API_KEY.",
      },
      { status: 500 },
    );
  }
  if (err instanceof BillingError) {
    return NextResponse.json(
      {
        error:
          "Inga krediter kvar på Anthropic-kontot. Lägg till betalning på console.anthropic.com under Billing.",
      },
      { status: 402 },
    );
  }
  // Logga internt, men exponera inget tekniskt för användaren.
  console.error("API-fel:", err);
  return NextResponse.json(
    { error: "Något gick fel när texten skulle skapas. Försök igen." },
    { status: 500 },
  );
}
