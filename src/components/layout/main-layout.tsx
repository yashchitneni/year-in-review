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
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    currentSection === section.id
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
} 