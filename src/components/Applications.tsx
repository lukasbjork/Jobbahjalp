"use client";

import { useState } from "react";
import { useApplicationsContext } from "@/context/ApplicationsContext";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  STATUS_ORDER,
  createApplication,
  todayISO,
} from "@/lib/applications";
import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Select,
  TextInput,
} from "@/components/ui";
import type { Application, ApplicationStatus } from "@/lib/types";

/** Lägger till https:// om protokoll saknas, så länken blir klickbar. */
function withProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const STATUS_PILL =
  "rounded-full border px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

function StatusSelect({
  value,
  onChange,
}: {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className={`${STATUS_PILL} ${STATUS_BADGE[value]}`}
      aria-label="Status"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export function Applications() {
  const { apps, add, update, remove, counts } = useApplicationsContext();

  // Formulär för att lägga till.
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState<ApplicationStatus>("sökt");
  const [error, setError] = useState("");

  // Inline-redigering.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Application>>({});

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() && !role.trim()) {
      setError("Fyll i minst företag eller tjänst.");
      return;
    }
    add(
      createApplication({
        company: company.trim(),
        role: role.trim(),
        url: url.trim(),
        date: date || todayISO(),
        status,
      }),
    );
    setCompany("");
    setRole("");
    setUrl("");
    setDate(todayISO());
    setStatus("sökt");
    setError("");
  }

  function startEdit(app: Application) {
    setEditingId(app.id);
    setDraft({ company: app.company, role: app.role, url: app.url, date: app.date });
  }

  function saveEdit(id: string) {
    update(id, {
      company: (draft.company ?? "").trim(),
      role: (draft.role ?? "").trim(),
      url: (draft.url ?? "").trim(),
      date: draft.date || todayISO(),
    });
    setEditingId(null);
    setDraft({});
  }

  return (
    <Card
      title="Mina ansökningar"
      description="En lista över jobben du har sökt. Sparas lokalt i den här webbläsaren, inget skickas till någon server."
    >
      {/* Sammanfattning per status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map((s) => (
          <span
            key={s}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[s]}`}
          >
            {STATUS_LABEL[s]}: {counts[s]}
          </span>
        ))}
      </div>

      {/* Lägg till */}
      <form
        onSubmit={submitAdd}
        className="flex flex-col gap-4 rounded-xl border border-border bg-background/60 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Företag" htmlFor="app-company">
            <TextInput
              id="app-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="t.ex. Volvo"
            />
          </Field>
          <Field label="Tjänst" htmlFor="app-role">
            <TextInput
              id="app-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="t.ex. Projektledare"
            />
          </Field>
          <Field label="Länk till annonsen" optional htmlFor="app-url">
            <TextInput
              id="app-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Datum" htmlFor="app-date">
              <TextInput
                id="app-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Status" htmlFor="app-status">
              <Select
                id="app-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
        <ErrorMessage>{error}</ErrorMessage>
        <div>
          <Button type="submit">Lägg till ansökan</Button>
        </div>
      </form>

      {/* Lista */}
      {apps.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Inga ansökningar än. Lägg till din första ovan.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {apps.map((app) => (
            <li
              key={app.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              {editingId === app.id ? (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput
                      value={draft.company ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
                      placeholder="Företag"
                    />
                    <TextInput
                      value={draft.role ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                      placeholder="Tjänst"
                    />
                    <TextInput
                      value={draft.url ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                      placeholder="https://..."
                    />
                    <TextInput
                      type="date"
                      value={draft.date ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(app.id)}>
                      Spara
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setDraft({});
                      }}
                    >
                      Avbryt
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {app.company || "—"}
                      {app.role && (
                        <span className="font-normal text-muted"> · {app.role}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{app.date}</p>
                    {app.url && (
                      <a
                        href={withProtocol(app.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block max-w-full truncate text-sm text-accent underline underline-offset-2 hover:opacity-80"
                      >
                        Öppna annonsen
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusSelect
                      value={app.status}
                      onChange={(s) => update(app.id, { status: s })}
                    />
                    <Button size="sm" variant="secondary" onClick={() => startEdit(app)}>
                      Redigera
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(app.id)}>
                      Ta bort
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
