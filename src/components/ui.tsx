"use client";

import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import type { TabId } from "@/lib/types";

// Små, återanvändbara byggstenar. Håller stilen enhetlig i hela appen.

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-foreground hover:bg-black/[0.04]",
  ghost: "text-accent hover:bg-accent/10",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={`${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${BUTTON_SIZE[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Laddar"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(valfritt)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

const CONTROL =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent";

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`${CONTROL} resize-y leading-relaxed ${className}`} {...props} />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${CONTROL} pr-8 ${className}`} {...props}>
      {children}
    </select>
  );
}

/** Knapp som kopierar text till urklipp och bekräftar kort. */
export function CopyButton({
  text,
  label = "Kopiera",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy} disabled={!text}>
      {copied ? "Kopierat" : label}
    </Button>
  );
}

/** Rött felmeddelande i en mjuk ruta. */
export function ErrorMessage({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
}

/** Redigerbar resultatruta med kopiera-knapp och plats för extra knappar. */
export function ResultEditor({
  label,
  value,
  onChange,
  rows = 12,
  actions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={value} />
          {actions}
        </div>
      </div>
      <TextArea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Påminnelse om saknat CV, med knapp till CV-fliken. */
export function CvNotice({ onNavigate }: { onNavigate?: (tab: TabId) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <span>Du har inget CV inlagt än. Lägg till det i CV-fliken så blir texterna bättre.</span>
      {onNavigate && (
        <Button variant="secondary" size="sm" onClick={() => onNavigate("cv")}>
          Gå till CV
        </Button>
      )}
    </div>
  );
}

/** Sektionskort som ramar in en funktion. */
export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}
