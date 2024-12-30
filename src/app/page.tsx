"use client";

import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Card } from "@/components/ui/card";
import PastYearSection from "@/components/forms/past-year-section";
import YearAheadSection from "@/components/forms/year-ahead-section";
import ClosingSection from "@/components/forms/closing-section";
import { Button } from "@/components/ui/button";
import { Download, Mail, Instagram, Twitter } from "lucide-react";

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
          
          <h2 className={`${crimsonPro.className} text-4xl text-center`}>Welcome to Year Compass</h2>

          <h3 className={`${crimsonPro.className} text-3xl`}>What is this?</h3>

          <section className="space-y-4">
          <p>It's a {" "}
              <a 
                href="https://yearcompass.com/" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                YearCompass
              </a> very own YearCompass, to be exact.</p>
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

          <div className="space-y-4">
            <h3 className={`${crimsonPro.className} text-3xl`}>Who built this?</h3>
            <p>
            I'm{" "}
              <a 
                href="https://yash.is"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Yash Chitneni
              </a>
              {" "}and I wanted to work on a day project by making it web-friendly and introducing AI analysis into the roadmap. I was originally introduced to this in 2022 by my friend,{" "}
              <a 
                href="https://www.ezequielcalderon.com/"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ezequiel
              </a>
              . It really helped me visualize my days and weeks of the year and I enjoyed the practice and still hang my drawing on the back of my bedroom door as a reminder. I'm not affiliated with the creators and merely putting this up as a project.
            </p>

            <div className="space-y-2">
              <h3 className={`${crimsonPro.className} text-2xl`}>Are my responses private?</h3>
              <p>
                Responses are cached locally on your computer, in case you want to navigate away and come back. I do not store them.
              </p>
              <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Your responses are saved in your browser's storage. While they'll persist across sessions, 
                  they will be lost if you clear your browser data or use private/incognito mode. We recommend downloading or emailing 
                  your completed YearCompass to keep a permanent copy.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className={`${crimsonPro.className} text-2xl`}>What do I need to fill out the booklet?</h3>
              <p>
                A laptop (phone is OK but not recommended), 2 hours of uninterrupted focus, and an open and honest mind.
              </p>
              <p>
                If you don&apos;t have 2 hours, you can also fill this out in parts -- your responses will be cached on your browser for you, 
                and you can come back anytime.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className={`${crimsonPro.className} text-2xl`}>Project Roadmap</h3>
              <p>
                <strong>Current Iteration:</strong> Download your responses as PDF, Email your responses, Get AI-powered analysis
              </p>
              <p>
                <strong>Future Iteration:</strong> Let me know if you'd like anything. Reach out to me on:
              </p>
                <a 
                  href="https://instagram.com/yashchitneni"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
                <a
                  href="https://x.com/yashchitneni" 
                  className="text-blue-600 hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                  X
                </a>
            </div>
          </div>
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
