import Link from "next/link";
import { CaseForm } from "@/components/CaseForm";

export default function NewCasePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm text-slate-600">← Back to dashboard</Link>
        <h1 className="mb-5 mt-5 text-3xl font-semibold text-slate-900">Create case</h1>
        <CaseForm />
      </div>
    </main>
  );
}