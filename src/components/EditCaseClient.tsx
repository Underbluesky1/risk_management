"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseRecord } from "@/types/database";
import { CaseForm } from "./CaseForm";

export function EditCaseClient({ id }: { id: string }) {
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

  return <><Link href={`/cases/${caseRecord.id}`} className="text-sm text-slate-600">← Back to case</Link><h1 className="mb-5 mt-5 text-3xl font-semibold text-slate-900">Edit case</h1><CaseForm initialCase={caseRecord} /></>;
}