"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Application, ApplicationStatus } from "@/lib/types";

const STORAGE_KEY = "jobbhjalp.applications.v1";

const EMPTY_COUNTS: Record<ApplicationStatus, number> = {
  sökt: 0,
  intervju: 0,
  "fick-jobbet": 0,
  "fick-inte-jobbet": 0,
};

/** CRUD + sammanräkning för ansökningslistan, persisterad i localStorage. */
export function useApplications() {
  const [apps, setApps] = useLocalStorage<Application[]>(STORAGE_KEY, []);

  const add = useCallback(
    (app: Application) => setApps((prev) => [app, ...prev]),
    [setApps],
  );

  const update = useCallback(
    (id: string, patch: Partial<Application>) =>
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    [setApps],
  );

  const remove = useCallback(
    (id: string) => setApps((prev) => prev.filter((a) => a.id !== id)),
    [setApps],
  );

  const counts = useMemo(() => {
    const result = { ...EMPTY_COUNTS };
    for (const app of apps) result[app.status] += 1;
    return result;
  }, [apps]);

  return { apps, add, update, remove, counts };
}
