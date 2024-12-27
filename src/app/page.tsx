"use client";

import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Card } from "@/components/ui/card";
import PastYearSection from "@/components/forms/past-year-section";
import YearAheadSection from "@/components/forms/year-ahead-section";
import ClosingSection from "@/components/forms/closing-section";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function Home() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 space-y-8 print:space-y-6">
        {/* Header - only show on screen */}
        <div className="flex justify-between items-center text-sm print:hidden">
          <div>YearCompass</div>
          <div>2024 « | » 2025</div>
        </div>

        {/* Title */}
        <h1 className={`${crimsonPro.className} text-5xl text-center print:text-4xl`}>
          YearCompass 2024-2025
        </h1>

        {/* Welcome Card */}
        <Card className="p-8 space-y-6 bg-white shadow-md print:shadow-none">
          <h2 className={`${crimsonPro.className} text-4xl`}>Welcome to YearCompass</h2>
          <p className="text-lg">
            Take time to review your year and plan the next one. This booklet will guide you through
            your past and help you design your future.
          </p>
        </Card>

        {/* Past Year Section */}
        <Card className="bg-white shadow-md print:shadow-none">
          <PastYearSection />
        </Card>

        {/* Year Ahead Section */}
        <Card className="bg-white shadow-md print:shadow-none">
          <YearAheadSection />
        </Card>

        {/* Closing Section */}
        <Card className="bg-white shadow-md print:shadow-none">
          <ClosingSection />
        </Card>

        {/* Save as PDF Button */}
        <div className="flex justify-center print:hidden">
          <Button onClick={handlePrint} className="flex items-center gap-2 bg-[#0f172a]">
            <Download className="w-4 h-4" />
            Save as PDF
          </Button>
        </div>
      </div>
    </main>
  );
}
