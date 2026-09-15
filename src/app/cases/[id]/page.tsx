import Link from "next/link";
import { notFound } from "next/navigation";
import { getCaseById } from "@/lib/cases";
import { StatusBadge } from "@/components/StatusBadge";

export default async function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = getCaseById(id);
  if (!caseRecord) notFound();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm text-slate-600">← Back to dashboard</Link>
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm text-slate-500">Case {caseRecord.id}</p><h1 className="mt-1 text-3xl font-semibold text-slate-900">{caseRecord.case_reference}</h1></div>
            <StatusBadge status={caseRecord.status} />
          </div>
          <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-4"><div><p className="text-xs uppercase text-slate-500">Priority</p><p className="mt-1 font-medium">{caseRecord.priority}</p></div><div><p className="text-xs uppercase text-slate-500">Follow-up</p><p className="mt-1 font-medium">{caseRecord.follow_up_date ?? "Not set"}</p></div><div><p className="text-xs uppercase text-slate-500">Created</p><p className="mt-1 font-medium">{caseRecord.created_at}</p></div><div><p className="text-xs uppercase text-slate-500">Updated</p><p className="mt-1 font-medium">{caseRecord.updated_at}</p></div></div>
          <div className="mt-8"><h2 className="font-semibold text-slate-900">Notes</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{caseRecord.notes}</p></div>
          <div className="mt-8"><Link href={`/cases/${caseRecord.id}/edit`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Edit case</Link></div>
        </div>
      </div>
    </main>
  );
}