"use client";

import { useState } from "react";
import { useCv } from "@/context/CvContext";
import { postJson } from "@/lib/client";
import {
  Button,
  Card,
  CopyButton,
  CvNotice,
  ErrorMessage,
  Field,
  ResultEditor,
  Select,
  TextArea,
} from "@/components/ui";
import type { AnswerLength, AnswerResponse, TabId } from "@/lib/types";

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
}

export function QuestionAnswerer({
  onNavigate,
}: {
  onNavigate?: (tab: TabId) => void;
}) {
  const { cvText, hasCv } = useCv();

  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [length, setLength] = useState<AnswerLength>("medel");

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function generate() {
    setError("");
    if (!hasCv) {
      setError("Ladda upp ditt CV i CV-fliken först.");
      return;
    }
    if (!question.trim()) {
      setError("Skriv en fråga att besvara.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJson<AnswerResponse>("/api/answer-question", {
        cvText,
        question,
        jobDescription: context,
        length,
      });
      setAnswer(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  function newQuestion() {
    if (answer.trim()) {
      setHistory((prev) => [
        { id: `${Date.now()}`, question: question.trim(), answer: answer.trim() },
        ...prev,
      ]);
    }
    setQuestion("");
    setAnswer("");
    setError("");
  }

  return (
    <Card
      title="Besvara ansökningsfrågor"
      description="Få ett ärligt svar i jag-form på en fråga från en ansökan. Svaret bygger på ditt CV."
    >
      {!hasCv && <CvNotice onNavigate={onNavigate} />}

      <Field label="Frågan" htmlFor="q-question">
        <TextArea
          id="q-question"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="t.ex. Varför söker du den här tjänsten?"
        />
      </Field>

      <Field label="Arbetsbeskrivning eller kontext" optional htmlFor="q-context">
        <TextArea
          id="q-context"
          rows={3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Valfritt. Klistra in annonsen om svaret ska passa just den."
        />
      </Field>

      <Field label="Svarslängd" optional htmlFor="q-length">
        <Select
          id="q-length"
          value={length}
          onChange={(e) => setLength(e.target.value as AnswerLength)}
        >
          <option value="kort">Kort</option>
          <option value="medel">Medel</option>
          <option value="lång">Lång</option>
        </Select>
      </Field>

      <ErrorMessage>{error}</ErrorMessage>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={generate}
          loading={loading}
          disabled={!hasCv || !question.trim()}
        >
          {answer ? "Besvara igen" : "Besvara frågan"}
        </Button>
        {answer && (
          <Button variant="secondary" onClick={newQuestion}>
            Ställ en ny fråga
          </Button>
        )}
      </div>

      {answer && (
        <ResultEditor label="Ditt svar" value={answer} onChange={setAnswer} rows={8} />
      )}

      {history.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted">Tidigare svar</h3>
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.question}</p>
                <CopyButton text={item.answer} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
