"use client";

import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Mail } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useEffect } from 'react';
import AIAnalysis from "@/components/analysis/ai-analysis";
import { generateAndDownloadPDF } from "@/lib/pdf";
import { useToast } from "@/components/ui/use-toast";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function ClosingSection() {
  const [formData, setFormData] = useAtom(formDataAtom);
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  // Initialize sharing object if it doesn't exist
  useEffect(() => {
    if (!formData.closing.sharing) {
      setFormData(prev => ({
        ...prev,
        closing: {
          ...prev.closing,
          sharing: {
            hashtag: '',
            website: ''
          }
        }
      }));
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      closing: {
        ...prev.closing,
        [field]: value,
      },
    }));
  };

  const handleSharingChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      closing: {
        ...prev.closing,
        sharing: {
          ...(prev.closing.sharing || { hashtag: '', website: '' }),
          [field]: value,
        },
      },
    }));
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      handleChange("signature", signatureData);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      handleChange("signature", "");
    }
  };

  const handleExportPDF = async () => {
    try {
      const success = await generateAndDownloadPDF(formData);
      if (success) {
        toast({
          title: "Success",
          description: "Your YearCompass has been exported to PDF.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };

  const handleEmailToSelf = () => {
    // Create email content
    const subject = "My YearCompass Responses";
    const body = `
Past Year Review:

**Going through your calendar:**
${formData.pastYear.calendarReview}

Year Overview:
**Personal Life & Family:**
${formData.pastYear.yearOverview.personalFamily}

**Career & Studies:**
${formData.pastYear.yearOverview.careerStudies}

**Friends & Community:**
${formData.pastYear.yearOverview.friendsCommunity}

**Relaxation, Hobbies & Creativity:**
${formData.pastYear.yearOverview.relaxationHobbiesCreativity}

**Physical Health & Fitness:**
${formData.pastYear.yearOverview.physicalHealthFitness}

**Mental Health & Self-Knowledge:**
${formData.pastYear.yearOverview.mentalHealthSelfKnowledge}

**Habits That Define You:**
${formData.pastYear.yearOverview.habitsThatDefineYou}

**A Better Tomorrow:**
${formData.pastYear.yearOverview.betterTomorrow}

Six Sentences About My Past Year:
**The wisest decision I made...**
${formData.pastYear.wisestDecision}

**The biggest lesson I learned...**
${formData.pastYear.biggestLesson}

**The biggest risk I took...**
${formData.pastYear.biggestRisk}

**The biggest surprise of the year...**
${formData.pastYear.biggestSurprise}

**The most important thing I did for others...**
${formData.pastYear.importantForOthers}

**The biggest thing I completed...**
${formData.pastYear.biggestCompletion}

**The best moments:**
${formData.pastYear.bestMoments}

**The past year in three words:**
${formData.pastYear.threeWords.join(', ')}

Six Questions About My Past Year:
**What are you most proud of?**
${formData.pastYear.mostProudOf}

**Who are the three people who influenced you the most?**
${formData.pastYear.peopleWhoInfluenced}

**Who are the three people you influenced the most?**
${formData.pastYear.peopleYouInfluenced}

**What were you not able to accomplish?**
${formData.pastYear.notAccomplished}

**What is the best thing you have discovered about yourself?**
${formData.pastYear.bestDiscovery}

**What are you most grateful for?**
${formData.pastYear.mostGratefulFor}

Three of My Biggest Accomplishments:
**List your three greatest accomplishments from last year here:**
${formData.pastYear.biggestAccomplishments}

**What did you do to achieve these?**
${formData.pastYear.howAchieved}

**Who helped you achieve these successes? How?**
${formData.pastYear.whoHelped}

Three of My Biggest Challenges:
**List your three biggest challenges from last year here:**
${formData.pastYear.biggestChallenges}

**Who or what helped you overcome these challenges?**
${formData.pastYear.whoHelpedChallenges}

**What have you learned about yourself by overcoming these challenges?**
${formData.pastYear.challengeLearnings}

**Forgiveness:**
${formData.pastYear.forgiveness}

**Letting Go:**
${formData.pastYear.lettingGo}

**The book of my past year:**
${formData.pastYear.bookTitle}

Year Ahead:

**Dare to dream big:**
${formData.yearAhead.dreamBig}

This is what my next year will be about:
**Personal Life & Family:**
${formData.yearAhead.yearOverview.personalFamily}

**Career & Studies:**
${formData.yearAhead.yearOverview.careerStudies}

**Friends & Community:**
${formData.yearAhead.yearOverview.friendsCommunity}

**Relaxation, Hobbies & Creativity:**
${formData.yearAhead.yearOverview.relaxationHobbiesCreativity}

**Physical Health & Fitness:**
${formData.yearAhead.yearOverview.physicalHealthFitness}

**Mental Health & Self-Knowledge:**
${formData.yearAhead.yearOverview.mentalHealthSelfKnowledge}

**Habits That Define You:**
${formData.yearAhead.yearOverview.habitsThatDefineYou}

**A Better Tomorrow:**
${formData.yearAhead.yearOverview.betterTomorrow}

Magical Triplets:
**I will love these three things about myself:**
${formData.yearAhead.magicalTriplets.loveAboutSelf.join(', ')}

Six Sentences About The Year Ahead:
**This year I will not procrastinate on...**
${formData.yearAhead.sixSentences.notProcrastinate}

**This year I will draw the most energy from...**
${formData.yearAhead.sixSentences.drawEnergyFrom}

**This year I will be bravest when...**
${formData.yearAhead.sixSentences.beBravest}

**This year I will say yes when...**
${formData.yearAhead.sixSentences.sayYesTo}

**This year I advise myself to...**
${formData.yearAhead.sixSentences.adviseSelf}

**This year will be special for me because...**
${formData.yearAhead.sixSentences.specialBecause}

**My word for the year ahead:**
${formData.yearAhead.wordOfYear}

**Secret wish:**
${formData.yearAhead.secretWish}

Date: ${formData.closing.date}
`.trim();

    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open default email client
    window.location.href = mailtoLink;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <div className="space-y-8">
        <h1 className={`${crimsonPro.className} text-5xl text-center border-b pb-4`}>
          Closing & Analysis
        </h1>

        {/* AI Analysis Section */}
        <section className="space-y-4">
          <p className="text-lg">
            Get AI-generated insights from your responses. Choose an analysis framework below:
          </p>
          <AIAnalysis />
        </section>

        {/* Signature Section */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Your Signature</h2>
          <div className="border rounded-lg p-4">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: "signature-canvas w-full h-40 border rounded",
              }}
              onEnd={handleSignatureEnd}
            />
            <Button
              variant="outline"
              className="mt-2"
              onClick={clearSignature}
            >
              Clear Signature
            </Button>
          </div>
        </section>

        {/* Date Section */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Date</h2>
          <Input
            type="date"
            value={formData.closing.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </section>

        {/* Export Options */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Export Your YearCompass</h2>
          <div className="flex gap-4">
            <Button 
              className="flex-1"
              onClick={handleExportPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              className="flex-1"
              onClick={handleEmailToSelf}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email to Myself
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
} 