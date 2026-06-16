import { NextResponse, type NextRequest } from "next/server";
import { generateEmail } from "@/lib/gemini";
import { buildEmailPrompt } from "@/lib/prompts";
import { badRequest, errorResponse } from "@/lib/route-helpers";
import type { EmailRequest, EmailResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Partial<EmailRequest>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Ogiltig förfrågan.");
  }

  const cvText = body.cvText?.trim();
  if (!cvText) return badRequest("Ladda upp ditt CV först.");

  try {
    const { system, user } = buildEmailPrompt({
      cvText,
      recruiterName: body.recruiterName,
      company: body.company,
      role: body.role,
      jobDescription: body.jobDescription,
      intent: body.intent,
    });
    const { subject, body: emailBody } = await generateEmail({
      system,
      user,
      maxOutputTokens: 1600,
    });
    if (!subject && !emailBody) {
      return errorResponse(new Error("Tomt svar från modellen."));
    }
    return NextResponse.json<EmailResponse>({ subject, body: emailBody });
  } catch (err) {
    return errorResponse(err);
  }
}
