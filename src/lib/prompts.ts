import type {
  AnswerLength,
  AnswerRequest,
  EmailRequest,
  LetterRequest,
} from "@/lib/types";

/**
 * Stilkärnan. Allt som genereras (brev, frågesvar, mejl) ska låta som en
 * vanlig människa, inte som en AI. Den här texten skickas som en del av
 * systeminstruktionen vid VARJE generering och styr HUR texten låter.
 */
export const WRITING_STYLE = `Så här ska du skriva:
- Skriv som en vanlig människa skriver, inte som en AI. Texten ska kännas äkta och personlig, inte polerad och perfekt.
- Använd enkelt, vardagligt språk. Korta och raka meningar. Vanliga ord som folk faktiskt använder.
- Undvik krångliga ord, klyschor, floskler och konsultsvenska.
- Använd inte tankstreck (– eller —) som skiljetecken. Dela i stället upp meningar med punkt eller komma. Vanliga bindestreck i ord som e-post är okej.
- Undvik typiska AI-fraser och mallade formuleringar, till exempel "Med min bakgrund inom...", "Jag är övertygad om att...", "Vidare...", "Sammanfattningsvis..." och "I dagens snabbrörliga värld...".
- Variera meningslängden lite så det låter naturligt, men håll det enkelt.
- Var konkret och rakt på sak. Hellre tydligt än märkvärdigt.
- Inga emojis.`;

/**
 * Sanningsregler. Allt ska bygga på CV:t och underlaget. Inget får hittas på.
 */
export const TRUTH_RULES = `Viktiga regler:
- Utgå enbart från fakta i CV:t och det underlag du får. Hitta inte på erfarenheter, titlar, siffror, utbildningar eller anställningar.
- Om underlaget inte räcker för en viss poäng, skriv ändå något ärligt och positivt utan att ljuga.
- Svara alltid på svenska.`;

/** Vem assistenten är. */
export const ROLE = `Du är en svensk skrivassistent som hjälper en person att söka jobb. Du skriver texter åt personen utifrån deras CV och en arbetsbeskrivning.`;

/** Sätter ihop en komplett systeminstruktion: roll + stil + sanning + uppgift. */
function buildSystem(task: string): string {
  return [ROLE, WRITING_STYLE, TRUTH_RULES, task].join("\n\n");
}

/** Bygger användarinnehållet av etiketterade fält, hoppar över tomma. */
function buildContext(parts: Array<[string, string | undefined]>): string {
  return parts
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([label, value]) => `${label}:\n${value!.trim()}`)
    .join("\n\n");
}

/** Funktion 2: personligt brev. */
export function buildLetterPrompt(input: LetterRequest): {
  system: string;
  user: string;
} {
  const tone =
    input.tone === "formell"
      ? "Håll en artig och professionell ton, men fortfarande enkel och mänsklig."
      : "Håll en personlig och varm ton, som om personen själv skrev brevet.";

  const task = `Uppgift: Skriv ett personligt brev på svenska för en jobbansökan.
- Längd ungefär 250 till 350 ord.
- Tydlig inledning, brödtext och avslutning.
- Knyt personens faktiska erfarenheter från CV:t till det som efterfrågas i arbetsbeskrivningen.
- ${tone}
- Avsluta med en vänlig hälsning och personens namn om det framgår av CV:t.
- Skriv bara själva brevet. Ingen rubrik som "Personligt brev" och inga platshållare i hakparenteser.`;

  const user = buildContext([
    ["CV", input.cvText],
    ["Arbetsbeskrivning", input.jobDescription],
    ["Företag", input.company],
    ["Tjänst", input.role],
  ]);

  return { system: buildSystem(task), user };
}

/** Funktion 3: besvara en ansökningsfråga. */
export function buildAnswerPrompt(input: AnswerRequest): {
  system: string;
  user: string;
} {
  const lengthHint: Record<AnswerLength, string> = {
    kort: "Håll svaret kort, ungefär 2 till 4 meningar.",
    medel: "Håll svaret lagom långt, ungefär 4 till 7 meningar.",
    lång: "Skriv ett utförligt svar på ungefär 2 till 3 stycken.",
  };

  const task = `Uppgift: Besvara en fråga från en jobbansökan i jag-form, som om personen själv svarar.
- ${lengthHint[input.length ?? "medel"]}
- Var konkret och ärlig utifrån CV:t.
- Skriv bara svaret. Upprepa inte frågan.`;

  const user = buildContext([
    ["CV", input.cvText],
    ["Fråga", input.question],
    ["Arbetsbeskrivning eller kontext", input.jobDescription],
  ]);

  return { system: buildSystem(task), user };
}

/** Funktion 5: mejl till rekryteraren. */
export function buildEmailPrompt(input: EmailRequest): {
  system: string;
  user: string;
} {
  const task = `Uppgift: Skriv ett kort och personligt mejl på svenska till en rekryterare.
- Mejlet ska vara kort och naturligt, inte stelt.
- Inled med en hälsning. Använd rekryterarens namn om det finns, annars en neutral hälsning.
- Förmedla det personen vill med mejlet (se fältet nedan).
- Avsluta med en vänlig hälsning och personens namn om det framgår av CV:t.
- Returnera en kort ämnesrad och en brödtext.`;

  const user = buildContext([
    ["CV", input.cvText],
    ["Rekryterarens namn", input.recruiterName],
    ["Företag", input.company],
    ["Tjänst", input.role],
    ["Arbetsbeskrivning", input.jobDescription],
    ["Vad jag vill med mejlet", input.intent],
  ]);

  return { system: buildSystem(task), user };
}
