import { NextResponse, type NextRequest } from "next/server";
import { generateText } from "@/lib/gemini";
import { buildLetterPrompt } from "@/lib/prompts";
import { badRequest, errorResponse } from "@/lib/route-helpers";
import type { LetterRequest, LetterResponse } from "@/lib/types";

// Gemini-SDK:n behöver Node-runtime (inte edge).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Partial<LetterRequest>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Ogiltig förfrågan.");
  }

  const cvText = body.cvText?.trim();
  const jobDescription = body.jobDescription?.trim();
  if (!cvText) return badRequest("Ladda upp ditt CV först.");
  if (!jobDescription) {
    return badRequest("Klistra in en arbetsbeskrivning först.");
  }

  try {
    const { system, user } = buildLetterPrompt({
      cvText,
      jobDescription,
      company: body.company,
      role: body.role,
      tone: body.tone,
    });
    const letter = await generateText({ system, user, maxOutputTokens: 2400 });
    if (!letter) {
      return errorResponse(new Error("Tomt svar från modellen."));
    }
    return NextResponse.json<LetterResponse>({ letter });
  } catch (err) {
    return errorResponse(err);
  }
}
