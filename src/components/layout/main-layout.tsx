"use client";

import { useAtom, useAtomValue } from "jotai";
import { currentSectionAtom, progressAtom } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { FormSection } from "@/types/yearcompass";

const sections: { id: FormSection; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "pastYear", label: "Past Year" },
  { id: "yearAhead", label: "Year Ahead" },
  { id: "closing", label: "Closing" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSection] = useAtom(currentSectionAtom);
  const progress = useAtomValue(progressAtom);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
} 