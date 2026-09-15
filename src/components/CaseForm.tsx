"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseRecord } from "@/types/database";

type CaseFormProps = { initialCase?: CaseRecord };

export function CaseForm({ initialCase }: CaseFormProps) {
  const router = useRouter();
  const [caseRecord, setCaseRecord] = useState<CaseRecord>(initialCase ?? {
    id: "", case_reference: "", status: "Active", priority: "Medium",
    follow_up_date: null, created_at: "", updated_at: "", closed_at: null, notes: "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof CaseRecord, value: string) {
    setCaseRecord((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!caseRecord.case_reference.trim() || !caseRecord.notes.trim()) {
      setError("Case reference and notes are required.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(caseRecord.id ? `/api/cases/${caseRecord.id}` : "/api/cases", {
        method: caseRecord.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseRecord),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? `Case could not be saved (HTTP ${response.status}).`);
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (saveError) {
      setIsSaving(false);
      setError(saveError instanceof Error ? saveError.message : "Case could not be saved.");
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-4xl space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Case reference</label>
          <input value={caseRecord.case_reference} onChange={(event) => updateField("case_reference", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" placeholder="Required" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up date</label>
          <input type="date" value={caseRecord.follow_up_date ?? ""} onChange={(event) => updateField("follow_up_date", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select value={caseRecord.status} onChange={(event) => updateField("status", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none">
            <option>Active</option>
            <option>Follow-up Due</option>
            <option>Closed</option>
            <option>Archived</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
          <select value={caseRecord.priority} onChange={(event) => updateField("priority", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
          <textarea value={caseRecord.notes} onChange={(event) => updateField("notes", event.target.value)} className="min-h-32 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" />
        </div>
      </div>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => window.history.back()} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button>
        <button type="submit" disabled={isSaving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Saving..." : "Save"}</button>
      </div>
    </form>
  );
}
