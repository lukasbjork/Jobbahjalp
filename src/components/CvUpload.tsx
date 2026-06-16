"use client";

import { useRef, useState } from "react";
import { useCv } from "@/context/CvContext";
import { extractPdfText } from "@/lib/pdf";
import { Button, Card, ErrorMessage, Field, Spinner, TextArea } from "@/components/ui";

const MAX_MB = 15;
const MAX_CHARS = 30000;

export function CvUpload() {
  const { cvText, setCvText, clearCv, hasCv } = useCv();
  const [draft, setDraft] = useState(cvText);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    setError("");
    setSaved(false);
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Filen måste vara en PDF.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Filen är för stor. Max ${MAX_MB} MB.`);
      return;
    }

    setFileName(file.name);
    setParsing(true);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        setError(
          "Hittade ingen text i PDF:en. Är den inskannad? Du kan klistra in texten manuellt nedan.",
        );
        return;
      }
      setDraft(text.slice(0, MAX_CHARS));
    } catch {
      setError(
        "Kunde inte läsa PDF:en. Du kan klistra in texten manuellt i rutan nedan.",
      );
    } finally {
      setParsing(false);
    }
  }

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Det finns ingen text att spara än.");
      return;
    }
    setCvText(trimmed.slice(0, MAX_CHARS));
    setSaved(true);
    setError("");
  }

  function removeCv() {
    clearCv();
    setDraft("");
    setFileName(null);
    setSaved(false);
    setError("");
  }

  return (
    <Card
      title="Ditt CV"
      description="Ladda upp ditt CV som PDF. Filen stannar i din webbläsare. Bara den extraherade texten används för att skapa brev, svar och mejl."
    >
      {hasCv && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          CV sparat ({cvText.length} tecken). Det används nu för personligt brev,
          frågor och mejl.
        </p>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
        }`}
      >
        {parsing ? (
          <span className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Läser PDF…
          </span>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Dra och släpp din PDF här
            </p>
            <p className="text-xs text-muted">
              eller klicka för att välja fil
              {fileName ? ` · ${fileName}` : ""}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <Field
        label="Granska och redigera texten"
        htmlFor="cv-text"
        hint={`${draft.length} tecken${draft.length >= MAX_CHARS ? " (max nått)" : ""}`}
      >
        <TextArea
          id="cv-text"
          rows={12}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
          placeholder="Här visas texten ur din PDF. Du kan redigera den, eller klistra in ditt CV manuellt om du inte har en PDF."
        />
      </Field>

      <ErrorMessage>{error}</ErrorMessage>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={!draft.trim()}>
          {hasCv ? "Uppdatera CV" : "Spara CV"}
        </Button>
        {hasCv && (
          <Button variant="danger" onClick={removeCv}>
            Ta bort CV
          </Button>
        )}
        {saved && <span className="text-sm text-green-700">Sparat.</span>}
      </div>
    </Card>
  );
}
