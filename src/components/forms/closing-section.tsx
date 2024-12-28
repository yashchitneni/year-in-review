"use client";

import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Mail } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function ClosingSection() {
  const [formData, setFormData] = useAtom(formDataAtom);
  const signaturePadRef = useRef<SignatureCanvas>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      closing: {
        ...prev.closing,
        [field]: value,
      },
    }));
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const saveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      handleChange('signature', signatureData);
    }
  };

  const formatSection = (data: any, sectionMap: any, depth = 0): string => {
    if (Array.isArray(data)) {
      return data.join(", ");
    }
    
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => {
          const question = sectionMap[key];
          if (!question) return '';
          
          if (typeof question === 'object') {
            return formatSection(value, question, depth + 1);
          }
          
          return `${question}:\n${value}\n`;
        })
        .filter(Boolean)
        .join('\n');
    }
    
    return data?.toString() || '';
  };

  const handleEmailToSelf = () => {
    const emailSubject = "Year Compass 2024-2025";
    const emailBody = `Your Year Compass Review

PAST YEAR REFLECTION
-------------------
${formatSection(formData.pastYear, questionMap.pastYear)}

YEAR AHEAD PLANNING
-------------------
${formatSection(formData.yearAhead, questionMap.yearAhead)}

CLOSING
-------
Date: ${formData.closing.date}
${formData.closing.signature ? 'Signature: [Signed]' : ''}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  };

  const questionMap = {
    pastYear: {
      calendarReview: "Going through your calendar, what did you do this past year?",
      yearOverview: {
        personalFamily: "Personal Life & Family",
        careerStudies: "Career & Studies",
        friendsCommunity: "Friends & Community",
        relaxationHobbiesCreativity: "Relaxation, Hobbies & Creativity",
        physicalHealthFitness: "Physical Health & Fitness",
        mentalHealthSelfKnowledge: "Mental Health & Self-Knowledge",
        habitsThatDefineYou: "Habits That Define You",
        betterTomorrow: "A Better Tomorrow"
      },
      wisestDecision: "The wisest decision I made...",
      biggestLesson: "The biggest lesson I learned...",
      biggestRisk: "The biggest risk I took...",
      biggestSurprise: "The biggest surprise of the year...",
      importantForOthers: "The most important thing I did for others...",
      biggestCompletion: "The biggest thing I completed...",
      bestMoments: "The best moments",
      threeWords: "The past year in three words",
      mostProudOf: "What are you most proud of?",
      peopleWhoInfluenced: "Who were the three people who influenced you the most?",
      peopleYouInfluenced: "Who were the three people you influenced the most?",
      notAccomplished: "What were you not able to accomplish?",
      bestDiscovery: "What is the best thing you discovered about yourself?",
      mostGratefulFor: "What are you most grateful for?",
      biggestAccomplishments: "Your three biggest accomplishments",
      howAchieved: "What did you do to achieve these?",
      whoHelped: "Who helped you achieve these successes?",
      biggestChallenges: "Your three biggest challenges",
      whoHelpedChallenges: "Who helped you overcome these challenges?",
      challengeLearnings: "What did you learn about yourself through these challenges?",
      forgiveness: "What needs to be forgiven?",
      lettingGo: "What do you need to let go of?",
      bookTitle: "If this year was a book, what would be its title?"
    },
    yearAhead: {
      dreamBig: "What does your dream year look like?",
      yearOverview: {
        personalFamily: "Personal Life & Family",
        careerStudies: "Career & Studies",
        friendsCommunity: "Friends & Community",
        relaxationHobbiesCreativity: "Relaxation, Hobbies & Creativity",
        physicalHealthFitness: "Physical Health & Fitness",
        mentalHealthSelfKnowledge: "Mental Health & Self-Knowledge",
        habitsThatDefineYou: "Habits That Define You",
        betterTomorrow: "A Better Tomorrow"
      },
      magicalTriplets: {
        loveAboutSelf: "I will love these three things about myself",
        letGoOf: "I am ready to let go of these three things",
        achieveMost: "I want to achieve these three things the most",
        pillarsInRoughTimes: "These three people will be my pillars during rough times",
        dareToDiscover: "I will dare to discover these three things",
        sayNoTo: "I will have the power to say no to these three things",
        surroundingsCozy: "I will make my surroundings cozy with these three things",
        morningRoutine: "I will do these three things every morning",
        pamperSelf: "I will pamper myself with these three things regularly",
        placesToVisit: "I will visit these three places",
        connectWithLovedOnes: "I will connect with my loved ones in these three ways",
        rewardSuccesses: "I will reward my successes with these three presents"
      },
      sixSentences: {
        notProcrastinate: "This year I will not procrastinate any more over...",
        drawEnergyFrom: "This year I will draw the most energy from...",
        beBravest: "This year, I will be bravest when...",
        sayYesTo: "This year I will say yes when...",
        adviseSelf: "This year I advise myself to...",
        specialBecause: "This year will be special for me because..."
      },
      wordOfYear: "My word for the year ahead",
      secretWish: "My secret wish"
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg">
      <div className="space-y-12">
        {/* Title */}
        <h1 className={`${crimsonPro.className} text-4xl text-center border-b pb-4`}>
          Closing
        </h1>

        {/* Content Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Signature Section */}
          <div className="space-y-3">
            <h2 className={`${crimsonPro.className} text-xl`}>Your Signature</h2>
            <div className="relative border rounded-lg bg-white h-[200px] shadow-sm">
              <SignatureCanvas
                ref={signaturePadRef}
                canvasProps={{
                  className: 'w-full h-full',
                  style: { 
                    borderRadius: '0.5rem',
                  }
                }}
                backgroundColor="white"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2 bg-white"
                onClick={clearSignature}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Date Section */}
          <div className="space-y-3 flex flex-col justify-start">
            <h2 className={`${crimsonPro.className} text-xl`}>Date</h2>
            <Input
              type="date"
              value={formData.closing.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="px-8 py-6 text-lg"
            onClick={() => window.print()}
          >
            <Download className="w-5 h-5 mr-2" />
            Save as PDF
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg"
            onClick={handleEmailToSelf}
          >
            <Mail className="w-5 h-5 mr-2" />
            Email to Self
          </Button>
        </div>
      </div>
    </div>
  );
} 