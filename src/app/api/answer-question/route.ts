import { NextResponse, type NextRequest } from "next/server";
import { generateText } from "@/lib/claude";
import { buildAnswerPrompt } from "@/lib/prompts";
import { badRequest, errorResponse } from "@/lib/route-helpers";
import type { AnswerRequest, AnswerResponse } from "@/lib/types";

// Anthropic-SDK:n behöver Node-runtime (inte edge).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Partial<AnswerRequest>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Ogiltig förfrågan.");
  }

  const cvText = body.cvText?.trim();
  const question = body.question?.trim();
  if (!cvText) return badRequest("Ladda upp ditt CV först.");
  if (!question) return badRequest("Skriv en fråga att besvara.");

  try {
    const { system, user } = buildAnswerPrompt({
      cvText,
      question,
      jobDescription: body.jobDescription,
      length: body.length,
    });
    const answer = await generateText({ system, user, maxOutputTokens: 2400 });
    if (!answer) {
      return errorResponse(new Error("Tomt svar från modellen."));
    }
    return NextResponse.json<AnswerResponse>({ answer });
  } catch (err) {
    return errorResponse(err);
  }
}
