import type { CaseRecord } from "@/types/database";

const STORAGE_KEY = "riskwatch_cases";

export function loadCases(fallback: CaseRecord[]) {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;
    return JSON.parse(stored) as CaseRecord[];
  } catch {
    return fallback;
  }
}

export function saveCases(records: CaseRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    throw new Error("Cases could not be saved in this browser.");
  }
}
