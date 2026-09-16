import Link from "next/link";
import { EditCaseClient } from "@/components/EditCaseClient";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-4xl"><EditCaseClient id={id} /></div></main>;
}