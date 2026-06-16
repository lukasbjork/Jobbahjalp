# Jobbhjälp

En webbapp som hjälper dig med jobbansökningar. Du laddar upp ditt CV som PDF och
klistrar in en arbetsbeskrivning. Appen kan sedan:

1. **Personligt brev** – skriva ett brev anpassat till tjänsten.
2. **Frågor** – besvara fritextfrågor som dyker upp i ansökningar.
3. **Mejl** – skriva ett kort mejl till rekryteraren.
4. **Mina ansökningar** – hålla en lista över sökta jobb med länk och status.

Allt bygger på ditt CV och arbetsbeskrivningen. Texterna skrivs på svenska och i en
vanlig, mänsklig ton, inte som typisk AI-text.

## Teknik

- Next.js 16 (App Router) + TypeScript + React 19
- Tailwind CSS v4
- Google Gemini via `@google/genai` (anropas bara server-side)
- PDF-text läses i webbläsaren med `pdfjs-dist` (filen lämnar aldrig din dator)
- Ansökningslistan sparas i webbläsarens `localStorage` (ingen databas)

## Kom igång lokalt

1. Installera beroenden:

   ```bash
   npm install
   ```

2. Skapa en gratis API-nyckel hos Google:
   - Gå till https://aistudio.google.com
   - Logga in med ett Google-konto (inget kreditkort behövs)
   - Skapa en API-nyckel under "Get API key"

3. Lägg nyckeln i en fil som heter `.env.local` i projektroten:

   ```bash
   GEMINI_API_KEY=din-nyckel-här
   # Valfritt, standard är gemini-3.5-flash:
   GEMINI_MODEL=gemini-3.5-flash
   ```

   Du kan utgå från `.env.example`. Filen `.env.local` är redan med i `.gitignore`
   och ska aldrig checkas in.

4. Starta utvecklingsservern:

   ```bash
   npm run dev
   ```

   Öppna http://localhost:3000.

## Bygga för produktion

```bash
npm run build
npm start
```

## Deploya på Vercel

1. Pusha koden till ett GitHub-repo.
2. Gå till https://vercel.com, välj **Add New → Project** och importera repot.
3. Under **Settings → Environment Variables**, lägg till:
   - `GEMINI_API_KEY` = din nyckel
   - (valfritt) `GEMINI_MODEL` = `gemini-3.5-flash`
4. Klicka **Deploy**. Inga andra inställningar behövs.

## Modell

Standardmodellen är `gemini-3.5-flash`. Vill du ha högre dagliga gratisgränser kan du
sätta `GEMINI_MODEL=gemini-3.1-flash-lite`. Kontrollera aktuella modellnamn på
https://ai.google.dev om något slutar fungera.

## Bra att veta

- **Ansökningslistan sparas lokalt.** Den ligger i just den här webbläsaren och
  synkas inte mellan datorer eller webbläsare. Rensar du webbläsardata försvinner den.
- **Ditt CV sparas inte.** CV-texten finns bara i minnet under sessionen och
  försvinner när du laddar om sidan.
- **Integritet.** På Geminis gratisnivå kan text du skickar in användas för att
  förbättra Googles modeller. Lägg därför inte in känsliga uppgifter som personnummer.
- Allt innehåll genereras på svenska.
