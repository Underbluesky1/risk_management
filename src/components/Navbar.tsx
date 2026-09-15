"use client";

import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operations</p>
          <h1 className="text-2xl font-semibold text-slate-900">RiskWatch</h1>
        </div>

        <nav className="flex items-center gap-3 text-sm text-slate-600">
          <button className="rounded-lg border border-slate-200 px-3 py-2">Alerts</button>
          <button onClick={handleLogout} className="rounded-lg border border-slate-200 px-3 py-2">Logout</button>
        </nav>
      </div>
    </header>
  );
}
