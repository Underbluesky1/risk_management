import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseForm } from "@/components/CaseForm";
import { getCaseById } from "@/lib/cases";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = getCaseById(id);
  if (!caseRecord) notFound();

  return <main className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-4xl"><Link href={`/cases/${caseRecord.id}`} className="text-sm text-slate-600">← Back to case</Link><h1 className="mt-5 mb-5 text-3xl font-semibold text-slate-900">Edit case</h1><CaseForm initialCase={caseRecord} /></div></main>;
}