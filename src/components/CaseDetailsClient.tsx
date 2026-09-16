"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseRecord } from "@/types/database";
import { StatusBadge } from "./StatusBadge";

export function CaseDetailsClient({ id }: { id: string }) {
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error ?? "Unable to load case.");
        return response.json() as Promise<CaseRecord>;
      })
      .then(setCaseRecord)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load case."));
  }, [id]);

  if (error) return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  if (!caseRecord) return <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading case...</p>;

  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">Case {caseRecord.id}</p><h1 className="mt-1 text-3xl font-semibold text-slate-900">{caseRecord.case_reference}</h1></div>
        <StatusBadge status={caseRecord.status} />
      </div>
      <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-4"><div><p className="text-xs uppercase text-slate-500">Priority</p><p className="mt-1 font-medium">{caseRecord.priority}</p></div><div><p className="text-xs uppercase text-slate-500">Follow-up</p><p className="mt-1 font-medium">{caseRecord.follow_up_date ?? "Not set"}</p></div><div><p className="text-xs uppercase text-slate-500">Created</p><p className="mt-1 font-medium">{caseRecord.created_at}</p></div><div><p className="text-xs uppercase text-slate-500">Updated</p><p className="mt-1 font-medium">{caseRecord.updated_at}</p></div></div>
      <div className="mt-8"><h2 className="font-semibold text-slate-900">Notes</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{caseRecord.notes}</p></div>
      <div className="mt-8"><Link href={`/cases/${caseRecord.id}/edit`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Edit case</Link></div>
    </div>
  );
}