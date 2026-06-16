"use client";

import { useState } from "react";
import { useCv } from "@/context/CvContext";
import { useApplicationsContext } from "@/context/ApplicationsContext";
import { createApplication, todayISO } from "@/lib/applications";
import { postJson } from "@/lib/client";
import {
  Button,
  Card,
  CopyButton,
  CvNotice,
  ErrorMessage,
  Field,
  ResultEditor,
  TextArea,
  TextInput,
} from "@/components/ui";
import type { EmailResponse, TabId } from "@/lib/types";

export function EmailWriter({
  onNavigate,
}: {
  onNavigate?: (tab: TabId) => void;
}) {
  const { cvText, hasCv } = useCv();
  const { add } = useApplicationsContext();

  const [recruiterName, setRecruiterName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [intent, setIntent] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    setError("");
    if (!hasCv) {
      setError("Ladda upp ditt CV i CV-fliken först.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJson<EmailResponse>("/api/generate-email", {
        cvText,
        recruiterName,
        company,
        role,
        jobDescription,
        intent,
      });
      setSubject(data.subject);
      setBody(data.body);
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

  const hasResult = Boolean(subject || body);

  return (
    <Card
      title="Mejl till rekryteraren"
      description="Ett kort och personligt mejl till den som rekryterar. Bygger på ditt CV och det du fyller i."
    >
      {!hasCv && <CvNotice onNavigate={onNavigate} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rekryterarens namn" optional htmlFor="mail-name">
          <TextInput
            id="mail-name"
            value={recruiterName}
            onChange={(e) => setRecruiterName(e.target.value)}
            placeholder="t.ex. Anna Svensson"
          />
        </Field>
        <Field label="Företag" optional htmlFor="mail-company">
          <TextInput
            id="mail-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="t.ex. Volvo"
          />
        </Field>
        <Field label="Tjänst" optional htmlFor="mail-role">
          <TextInput
            id="mail-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="t.ex. Projektledare"
          />
        </Field>
        <Field label="Vad vill du med mejlet?" optional htmlFor="mail-intent">
          <TextInput
            id="mail-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="t.ex. visa intresse, följa upp ansökan"
          />
        </Field>
      </div>

      <Field label="Arbetsbeskrivning" optional htmlFor="mail-job">
        <TextArea
          id="mail-job"
          rows={4}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Valfritt. Klistra in annonsen om du vill."
        />
      </Field>

      <ErrorMessage>{error}</ErrorMessage>

      <div>
        <Button onClick={generate} loading={loading} disabled={!hasCv}>
          {hasResult ? "Skriv om" : "Skriv mejl"}
        </Button>
      </div>

      {hasResult && (
        <div className="flex flex-col gap-3">
          <Field label="Ämnesrad" htmlFor="mail-subject">
            <div className="flex items-center gap-2">
              <TextInput
                id="mail-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <CopyButton text={subject} />
            </div>
          </Field>

          <ResultEditor
            label="Brödtext"
            value={body}
            onChange={setBody}
            rows={12}
            actions={
              <>
                <CopyButton
                  text={`Ämne: ${subject}\n\n${body}`}
                  label="Kopiera allt"
                />
                {(company.trim() || role.trim()) &&
                  (saved ? (
                    <span className="text-sm text-green-700">
                      Sparad i Mina ansökningar
                    </span>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={saveJob}>
                      Spara jobbet
                    </Button>
                  ))}
              </>
            }
          />
        </div>
      )}
    </Card>
  );
}
