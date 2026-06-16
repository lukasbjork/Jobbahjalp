"use client";

import { useState } from "react";
import { useCv } from "@/context/CvContext";
import { useApplicationsContext } from "@/context/ApplicationsContext";
import { createApplication, todayISO } from "@/lib/applications";
import { postJson } from "@/lib/client";
import {
  Button,
  Card,
  CvNotice,
  ErrorMessage,
  Field,
  ResultEditor,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";
import type { LetterResponse, LetterTone, TabId } from "@/lib/types";

export function LetterGenerator({
  onNavigate,
}: {
  onNavigate?: (tab: TabId) => void;
}) {
  const { cvText, hasCv } = useCv();
  const { add } = useApplicationsContext();

  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<LetterTone>("personlig");

  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    setError("");
    if (!hasCv) {
      setError("Ladda upp ditt CV i CV-fliken först.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Klistra in en arbetsbeskrivning.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJson<LetterResponse>("/api/generate-letter", {
        cvText,
        jobDescription,
        company,
        role,
        tone,
      });
      setLetter(data.letter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  function saveJob() {
    if (!company.trim() && !role.trim()) return;
    add(
      createApplication({
        company: company.trim(),
        role: role.trim(),
        url: "",
        date: todayISO(),
        status: "sökt",
      }),
    );
    setSaved(true);
  }

  return (
    <Card
      title="Personligt brev"
      description="Skapa ett brev som utgår från ditt CV och arbetsbeskrivningen. Allt bygger på fakta i ditt CV."
    >
      {!hasCv && <CvNotice onNavigate={onNavigate} />}

      <Field label="Arbetsbeskrivning" htmlFor="letter-job">
        <TextArea
          id="letter-job"
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Klistra in annonsen eller arbetsbeskrivningen här."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Företag" optional htmlFor="letter-company">
          <TextInput
            id="letter-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="t.ex. Volvo"
          />
        </Field>
        <Field label="Tjänst" optional htmlFor="letter-role">
          <TextInput
            id="letter-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="t.ex. Projektledare"
          />
        </Field>
      </div>

      <Field label="Ton" optional htmlFor="letter-tone">
        <Select
          id="letter-tone"
          value={tone}
          onChange={(e) => setTone(e.target.value as LetterTone)}
        >
          <option value="personlig">Personlig</option>
          <option value="formell">Formell</option>
        </Select>
      </Field>

      <ErrorMessage>{error}</ErrorMessage>

      <div>
        <Button
          onClick={generate}
          loading={loading}
          disabled={!hasCv || !jobDescription.trim()}
        >
          {letter ? "Generera om" : "Generera personligt brev"}
        </Button>
      </div>

      {letter && (
        <ResultEditor
          label="Ditt brev"
          value={letter}
          onChange={setLetter}
          rows={16}
          actions={
            (company.trim() || role.trim()) &&
            (saved ? (
              <span className="text-sm text-green-700">Sparad i Mina ansökningar</span>
            ) : (
              <Button variant="secondary" size="sm" onClick={saveJob}>
                Spara jobbet
              </Button>
            ))
          }
        />
      )}
    </Card>
  );
}
