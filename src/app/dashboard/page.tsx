import { Navbar } from "@/components/Navbar";
import { DashboardClient } from "@/components/DashboardClient";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar />
      <DashboardClient />
    </main>
  );
}
