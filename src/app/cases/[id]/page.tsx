import Link from "next/link";
import { CaseDetailsClient } from "@/components/CaseDetailsClient";

export default async function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm text-slate-600">← Back to dashboard</Link>
        <CaseDetailsClient id={id} />
      </div>
    </main>
  );
}