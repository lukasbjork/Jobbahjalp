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
- Anthropic Claude via `@anthropic-ai/sdk` (anropas bara server-side)
- PDF-text läses i webbläsaren med `pdfjs-dist` (filen lämnar aldrig din dator)
- Ansökningslistan sparas i webbläsarens `localStorage` (ingen databas)

## Kom igång lokalt

1. Installera beroenden:

   ```bash
   npm install
   ```

2. Skaffa en API-nyckel hos Anthropic:
   - Gå till https://console.anthropic.com
   - Skapa en API-nyckel under "API Keys"
   - Lägg till betalkort/krediter under "Billing" (betala-per-användning, inget
     gratis-abonnemang, men kostnaden är mycket låg för denna typ av text)

3. Lägg nyckeln i en fil som heter `.env.local` i projektroten:

   ```bash
   ANTHROPIC_API_KEY=din-nyckel-här
   # Valfritt, standard är claude-sonnet-5:
   ANTHROPIC_MODEL=claude-sonnet-5
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
   - `ANTHROPIC_API_KEY` = din nyckel
   - (valfritt) `ANTHROPIC_MODEL` = `claude-sonnet-5`
4. Klicka **Deploy**. Inga andra inställningar behövs.

## Modell

Standardmodellen är `claude-sonnet-5`. Du kan byta modell via miljövariabeln
`ANTHROPIC_MODEL` om du vill testa en annan Claude-modell.

## Bra att veta

- **Ansökningslistan sparas lokalt.** Den ligger i just den här webbläsaren och
  synkas inte mellan datorer eller webbläsare. Rensar du webbläsardata försvinner den.
- **Ditt CV sparas inte.** CV-texten finns bara i minnet under sessionen och
  försvinner när du laddar om sidan.
- **Integritet.** Anthropics API använder som standard inte kundens data för att
  träna sina modeller. Lägg ändå inte in mer känsliga uppgifter än nödvändigt
  (t.ex. personnummer) i CV-texten du klistrar in.
- **Kostnad.** Varje genererat brev/svar/mejl kostar typiskt en bråkdel av en krona.
  Det finns ingen daglig gratiskvot längre - du betalar löpande för det du använder,
  vilket också innebär att tjänsten inte "slutar fungera" efter ett visst antal
  anrop per dag.
- Allt innehåll genereras på svenska.
