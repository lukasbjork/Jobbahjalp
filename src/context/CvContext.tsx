"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

// CV-texten hålls bara i minnet under sessionen. Den sparas medvetet INTE i
// localStorage eller på servern, och försvinner när sidan laddas om.

interface CvContextValue {
  cvText: string;
  setCvText: (text: string) => void;
  clearCv: () => void;
  hasCv: boolean;
}

const CvContext = createContext<CvContextValue | null>(null);

export function CvProvider({ children }: { children: ReactNode }) {
  const [cvText, setCvText] = useState("");

  const value = useMemo<CvContextValue>(
    () => ({
      cvText,
      setCvText,
      clearCv: () => setCvText(""),
      hasCv: cvText.trim().length > 0,
    }),
    [cvText],
  );

  return <CvContext.Provider value={value}>{children}</CvContext.Provider>;
}

export function useCv(): CvContextValue {
  const ctx = useContext(CvContext);
  if (!ctx) throw new Error("useCv måste användas inom en CvProvider.");
  return ctx;
}
