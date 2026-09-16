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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operations</p>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">RiskWatch</h1>
        </div>

        <nav className="flex items-center gap-2 text-xs text-slate-600 sm:gap-3 sm:text-sm">
          <button className="rounded-lg border border-slate-200 px-2.5 py-2 sm:px-3">Alerts</button>
          <button onClick={handleLogout} className="rounded-lg border border-slate-200 px-2.5 py-2 sm:px-3">Logout</button>
        </nav>
      </div>
    </header>
  );
}
