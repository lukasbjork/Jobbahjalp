"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useApplications } from "@/hooks/useApplications";

// Delar en enda instans av ansökningslistan mellan alla flikar, så att t.ex.
// "spara jobbet" från brev- eller mejlfliken syns direkt i Mina ansökningar.

type ApplicationsValue = ReturnType<typeof useApplications>;

const ApplicationsContext = createContext<ApplicationsValue | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const value = useApplications();
  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplicationsContext(): ApplicationsValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error(
      "useApplicationsContext måste användas inom en ApplicationsProvider.",
    );
  }
  return ctx;
}
