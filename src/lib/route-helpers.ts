import "server-only";
import { NextResponse } from "next/server";
import { MissingKeyError, RateLimitError } from "@/lib/gemini";
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
          "Servern saknar API-nyckel. Lägg in GEMINI_API_KEY och försök igen.",
      },
      { status: 500 },
    );
  }
  // Logga internt, men exponera inget tekniskt för användaren.
  console.error("API-fel:", err);
  return NextResponse.json(
    { error: "Något gick fel när texten skulle skapas. Försök igen." },
    { status: 500 },
  );
}
