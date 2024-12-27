"use client";

import { useAtom } from "jotai";
import { formDataAtom, currentSectionAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function WelcomeSection() {
  const [formData, setFormData] = useAtom(formDataAtom);
  const [, setCurrentSection] = useAtom(currentSectionAtom);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center text-sm">
          <div>YearCompass</div>
          <div>2024 « | » 2025</div>
        </div>

        {/* Title */}
        <h1 className={`${crimsonPro.className} text-5xl text-center border-b pb-4`}>
          Welcome
        </h1>

        {/* What is this? */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>What is this?</h2>
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

        {/* What do I need */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>What do I need to fill out the booklet?</h2>
          <p>A pen or a pencil, a few hours of uninterrupted focus, and an open and honest mind.</p>
        </section>

        {/* Can I do this in a group? */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Can I do this in a group?</h2>
          <p>
            Sure you can! Grab your friends, print out booklets for all of them and find a comfortable
            space. Everyone should fill out their own YearCompass, but you can take breaks to
            discuss the exercises and share your thoughts and feelings.
          </p>
          <p>
            If you do this, please be mindful of your companions' boundaries. Everyone should
            only share things they are comfortable with.
          </p>
        </section>

        {/* Get Ready */}
        <section className="space-y-8 text-center py-12">
          <h2 className={`${crimsonPro.className} text-4xl border-b pb-4`}>Get ready</h2>
          <div className="space-y-4">
            <p>Arrive.</p>
            <p>Prepare your tools and the space around you.</p>
            <p>Close your eyes and take five deep breaths.</p>
            <p>Let go of your expectations.</p>
            <p>Start when you feel ready.</p>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-end pt-8">
          <Button
            onClick={() => setCurrentSection("pastYear")}
            className="flex items-center gap-2"
          >
            Begin: The Past Year
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 