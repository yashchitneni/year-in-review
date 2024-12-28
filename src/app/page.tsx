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
          <div>Year Compass</div>
          <div>2024 « | » 2025</div>
        </div>

        {/* Title */}
        <h1 className={`${crimsonPro.className} text-5xl text-center print:text-4xl`}>
          Year Compass 2024-2025
        </h1>

        {/* Welcome Card */}
        <Card className="p-8 space-y-6 bg-white shadow-md print:shadow-none">
          <h2 className={`${crimsonPro.className} text-4xl`}>Welcome to Year Compass</h2>

          <section className="space-y-4">
          <h3 className={`${crimsonPro.className} text-3xl`}>What is this?</h3>
          <p>It's a YearCompass—your very own YearCompass, to be exact.</p>
          <p>
            It is a booklet that helps you reflect on the past year and plan the next one. With a
            set of carefully selected questions and exercises, YearCompass helps you uncover your
            patterns and design a great year for yourself.
          </p>
          <p>
            The booklet has two distinct parts. The first half will help you review, learn from, and
            celebrate the year you're leaving behind. The second half, on the other hand, is all
            about the future. You'll be dreaming, planning, and preparing to get the most out of
            the new year.
          </p>
        </section>
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
      </div>
    </main>
  );
}
