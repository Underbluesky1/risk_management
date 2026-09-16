import type { Metadata } from "next";
import "./globals.css";
import { GlobalChatWidget } from "@/components/GlobalChatWidget";

export const metadata: Metadata = {
  title: "RiskWatch",
  description: "High-risk case tracker dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlobalChatWidget />
      </body>
    </html>
  );
}
