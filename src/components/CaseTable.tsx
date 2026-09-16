"use client";

import Link from "next/link";
import { cases as defaultCases } from "@/lib/cases";
import type { CaseRecord } from "@/types/database";
import { StatusBadge } from "./StatusBadge";

type CaseTableProps = {
  cases?: CaseRecord[];
  onClose?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function CaseTable({ cases: records = defaultCases, onClose, onDelete }: CaseTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-200 lg:hidden">
        {records.map((item) => (
          <article key={item.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-slate-900">{item.case_reference}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{item.id}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-slate-500">Priority</dt><dd className="mt-1 text-slate-700">{item.priority}</dd></div>
              <div><dt className="text-xs text-slate-500">Follow-up</dt><dd className="mt-1 text-slate-700">{item.follow_up_date ?? "Not set"}</dd></div>
            </dl>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/cases/${item.id}`} className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-xs font-medium">Open</Link>
              <Link href={`/cases/${item.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-xs font-medium">Edit</Link>
              {onClose ? <button onClick={() => onClose(item.id)} className="rounded-lg border border-amber-200 px-3 py-2.5 text-xs font-medium text-amber-800">Close</button> : null}
              {onDelete ? <button onClick={() => onDelete(item.id)} className="rounded-lg border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-700">Delete</button> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Case reference</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Follow-up</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {records.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-4 py-4">
                <div className="font-medium text-slate-900">{item.case_reference}</div>
                <div className="text-xs text-slate-500">{item.id}</div>
              </td>
              <td className="px-4 py-4 text-slate-700">{item.priority}</td>
              <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-4 text-slate-700">{item.follow_up_date}</td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/cases/${item.id}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Open</Link>
                  <Link href={`/cases/${item.id}/edit`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Edit</Link>
                  {onClose ? <button onClick={() => onClose(item.id)} className="rounded-lg border border-amber-200 px-2 py-1 text-xs text-amber-800">Close</button> : null}
                  {onDelete ? <button onClick={() => onDelete(item.id)} className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700">Delete</button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
