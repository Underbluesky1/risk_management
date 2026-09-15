"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cases as defaultCases } from "@/lib/cases";
import type { CaseRecord } from "@/types/database";
import { CaseTable } from "./CaseTable";

export function DashboardClient() {
  const [caseRecords, setCaseRecords] = useState<CaseRecord[]>(defaultCases);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cases")
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error ?? "Unable to load cases.");
        return response.json() as Promise<CaseRecord[]>;
      })
      .then(setCaseRecords)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load cases."))
      .finally(() => setIsLoading(false));
  }, []);

  async function closeCase(id: string) {
    const response = await fetch(`/api/cases/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Closed", closed_at: new Date().toISOString() }) });
    if (!response.ok) setError((await response.json()).error ?? "Unable to close case.");
    else setCaseRecords((current) => current.filter((item) => item.id !== id));
  }

  async function deleteCase(id: string) {
    if (!window.confirm("Delete this case permanently?")) return;
    const response = await fetch(`/api/cases/${id}`, { method: "DELETE" });
    if (!response.ok) setError((await response.json()).error ?? "Unable to delete case.");
    else setCaseRecords((current) => current.filter((item) => item.id !== id));
  }

  const activeCases = caseRecords.filter((item) => item.status !== "Closed" && item.status !== "Archived");
  const followUpDue = activeCases.filter((item) => item.status === "Follow-up Due").length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Small, focused case queue</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Active cases</h2>
        </div>
        <Link href="/cases/new" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">+ Create case</Link>
      </div>

      {error ? <p className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {isLoading ? <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading cases...</p> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Active high-risk cases</p><p className="mt-2 text-3xl font-semibold text-slate-900">{activeCases.length}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"><p className="text-sm text-amber-800">Require follow-up</p><p className="mt-2 text-3xl font-semibold text-amber-950">{followUpDue}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Closed or archived</p><p className="mt-2 text-3xl font-semibold text-slate-900">{caseRecords.length - activeCases.length}</p></div>
      </div>

      {!isLoading ? <CaseTable cases={activeCases} onClose={closeCase} onDelete={deleteCase} /> : null}
    </section>
  );
}
