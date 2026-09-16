"use client";

import { useEffect, useState } from "react";
import type { CaseRecord } from "@/types/database";
import { cases as defaultCases } from "@/lib/cases";
import { CaseChatbox } from "./CaseChatbox";

export function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [cases, setCases] = useState<CaseRecord[]>(defaultCases);

  useEffect(() => {
    async function loadCases() {
      try {
        const response = await fetch("/api/cases", { cache: "no-store" });
        if (!response.ok) {
          setCases(defaultCases);
          return;
        }

        const data = await response.json();
        setCases(Array.isArray(data) ? data : defaultCases);
      } catch {
        setCases(defaultCases);
      }
    }

    void loadCases();
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-end justify-end">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-3 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_50px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/10 text-base">💬</span>
          Chat
        </button>
      ) : (
        <div className="w-[360px] max-w-[calc(100vw-2rem)]">
          <CaseChatbox cases={cases} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
