"use client";

import { useState } from "react";
import { CvProvider } from "@/context/CvContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { CvUpload } from "@/components/CvUpload";
import { LetterGenerator } from "@/components/LetterGenerator";
import { QuestionAnswerer } from "@/components/QuestionAnswerer";
import { EmailWriter } from "@/components/EmailWriter";
import { Applications } from "@/components/Applications";
import type { TabId } from "@/lib/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "cv", label: "CV" },
  { id: "brev", label: "Personligt brev" },
  { id: "fragor", label: "Frågor" },
  { id: "mejl", label: "Mejl" },
  { id: "ansokningar", label: "Mina ansökningar" },
];

export default function Home() {
  const [tab, setTab] = useState<TabId>("cv");

  return (
    <CvProvider>
      <ApplicationsProvider>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Jobbhjälp
            </h1>
            <p className="mt-1 text-sm text-muted">
              Ditt CV plus en arbetsbeskrivning ger personligt brev, svar på
              ansökningsfrågor och mejl till rekryteraren. Allt på svenska.
            </p>
          </header>

          <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-black/[0.04] hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Alla flikar hålls monterade så att text och formulär finns kvar
              när man byter flik. Inaktiva göms med hidden. */}
          <main className="flex-1">
            <div className={tab === "cv" ? "" : "hidden"}>
              <CvUpload />
            </div>
            <div className={tab === "brev" ? "" : "hidden"}>
              <LetterGenerator onNavigate={setTab} />
            </div>
            <div className={tab === "fragor" ? "" : "hidden"}>
              <QuestionAnswerer onNavigate={setTab} />
            </div>
            <div className={tab === "mejl" ? "" : "hidden"}>
              <EmailWriter onNavigate={setTab} />
            </div>
            <div className={tab === "ansokningar" ? "" : "hidden"}>
              <Applications />
            </div>
          </main>

          <footer className="mt-10 text-center text-xs text-muted">
            Ansökningslistan sparas bara lokalt i den här webbläsaren. Lägg inte in
            känsliga uppgifter som personnummer. På Geminis gratisnivå kan inskickad
            text användas för att förbättra Googles modeller.
          </footer>
        </div>
      </ApplicationsProvider>
    </CvProvider>
  );
}
