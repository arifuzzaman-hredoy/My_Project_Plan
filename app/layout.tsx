import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/components/app-state";
import { LayoutShell } from "@/components/layout-shell";

export const metadata: Metadata = {
  title: "3-Year International Career & Study Roadmap",
  description:
    "Bilingual career, study, certificate, project, and scholarship roadmap dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppStateProvider>
          <LayoutShell>{children}</LayoutShell>
        </AppStateProvider>
      </body>
    </html>
  );
}
