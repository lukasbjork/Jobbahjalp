"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

// Eget event så att andra komponenter i SAMMA flik uppdateras när vi skriver.
// (Webbläsarens "storage"-event fyrar bara i andra flikar.)
const LOCAL_EVENT = "jobbhjalp:localstorage";

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * State som speglas till localStorage via useSyncExternalStore. SSR-säkert:
 * servern (och första klient-rendern) använder `initial`, sedan synkar React
 * mot det verkliga värdet utan hydration-fel.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initial);
  // Cache så att getSnapshot ger en stabil referens (krav för useSyncExternalStore).
  const cache = useRef<{ raw: string | null; value: T }>({
    raw: null,
    value: initial,
  });

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = (event: Event) => {
        if (event instanceof StorageEvent && event.key !== null && event.key !== key) {
          return;
        }
        onStoreChange();
      };
      window.addEventListener("storage", handler);
      window.addEventListener(LOCAL_EVENT, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(LOCAL_EVENT, handler);
      };
    },
    [key],
  );

  const getSnapshot = useCallback((): T => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw !== cache.current.raw) {
      cache.current = {
        raw,
        value: raw === null ? initialRef.current : safeParse<T>(raw, initialRef.current),
      };
    }
    return cache.current.value;
  }, [key]);

  const getServerSnapshot = useCallback(() => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(getSnapshot())
          : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Full eller blockerad lagring: ignorera tyst.
      }
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    [key, getSnapshot],
  );

  return [value, setValue];
}
