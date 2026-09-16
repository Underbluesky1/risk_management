"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CaseRecord } from "@/types/database";
import { executeCaseQuery, getPredefinedQuestions } from "@/lib/chatbot";
import { cases as defaultCases } from "@/lib/cases";

const suggestions = getPredefinedQuestions();

type ChatMessage = {
  id: number;
  sender: "assistant" | "user";
  text: string;
  result?: {
    intent: string;
    matches: CaseRecord[];
    grouped?: Record<string, number>;
    response: string;
  };
};

export function CaseChatbox({ cases = defaultCases, onClose }: { cases?: CaseRecord[]; onClose?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Hi! I can help you review active cases, spot follow-ups, and group case work by priority or category.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const quickSuggestions = useMemo(() => suggestions.slice(0, 5), []);

  function renderAssistantResult(message: ChatMessage) {
    const result = message.result;
    if (!result) return message.text;

    const summary = {
      total: result.matches.length,
      open: result.matches.filter((item) => item.status !== "Closed" && item.status !== "Archived").length,
      critical: result.matches.filter((item) => item.priority === "Critical").length,
      followUp: result.matches.filter((item) => item.status === "Follow-up Due" || Boolean(item.follow_up_date)).length,
    };

    return (
      <div className="space-y-2">
        <div className="text-sm leading-6 text-slate-700">{result.response}</div>

        {result.matches.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            <span className="rounded-full bg-slate-200 px-2 py-1">Total: {summary.total}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Open: {summary.open}</span>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Critical: {summary.critical}</span>
            <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">Follow-up: {summary.followUp}</span>
          </div>
        ) : null}

        {result.grouped ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Grouped totals</div>
            <div className="space-y-1 text-xs text-slate-700">
              {Object.entries(result.grouped).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span>{key}</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {result.matches.length > 0 ? (
          <div className="space-y-1.5">
            {result.matches.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/cases/${item.id}`} className="block rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">{item.case_reference}</span>
                  <span className="text-slate-500">{item.status}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>{item.priority}</span>
                  {item.category ? <span>• {item.category}</span> : null}
                  {item.assigned_doctor ? <span>• Dr {item.assigned_doctor}</span> : null}
                  {item.follow_up_date ? <span>• Follow-up {item.follow_up_date}</span> : <span>• No follow-up</span>}
                </div>
              </Link>
            ))}
            {result.matches.length > 4 ? <div className="text-[11px] text-slate-500">+ {result.matches.length - 4} more cases</div> : null}
          </div>
        ) : null}
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    const result = executeCaseQuery(trimmed, cases);

    setMessages([
      { id: 1, sender: "user", text: trimmed },
      {
        id: 2,
        sender: "assistant",
        text: result.response,
        result: {
          intent: result.intent,
          matches: result.matches,
          grouped: result.grouped,
          response: result.response,
        },
      },
    ]);

    setDraft("");
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-700 bg-[#0f172a] shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-700 bg-[#111827] px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-300">C</div>
            <div>
              <h3 className="text-base font-semibold text-white">Case chatbot</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg leading-none text-slate-200 transition hover:bg-slate-700"
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-4 bg-[#0f172a] p-4 sm:p-5">
        {messages.map((message) => (
          <div key={message.id} className={message.sender === "assistant" ? "flex items-start gap-3" : "ml-auto flex max-w-[90%] items-start justify-end"}>
            {message.sender === "assistant" ? (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-slate-100">AI</div>
            ) : null}

            <div className={message.sender === "assistant" ? "max-w-[95%] flex-1 rounded-2xl bg-slate-800/80 px-3 py-2.5 text-sm text-slate-200" : "rounded-2xl bg-blue-500 px-3 py-2.5 text-sm text-white shadow-lg shadow-blue-500/20"}>
              {message.sender === "assistant" ? renderAssistantResult(message) : message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 bg-[#0f172a] p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2">
          {/* {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setDraft(suggestion)}
              className="w-full rounded-full border border-slate-600 bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-blue-400 hover:bg-slate-700"
            >
              {suggestion.replace(/^show /i, "").replace(/^list /i, "").replace(/^what /i, "").replace(/^how many /i, "").replace(/^select /i, "")}
            </button>
          ))} */}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <select
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
            aria-label="Select a case query"
          >
            <option value="">Select a case query...</option>
            {quickSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} className="bg-slate-900 text-white">
                {suggestion.replace(/^show /i, "").replace(/^list /i, "").replace(/^what /i, "").replace(/^how many /i, "").replace(/^select /i, "")}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400">Send</button>
        </form>
      </div>
    </div>
  );
}
