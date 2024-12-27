"use client";

import { useAtom } from "jotai";
import { formDataAtom, currentSectionAtom } from "@/lib/store";
import type { YearOverview, PastYearSection } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function PastYearSection() {
  const [formData, setFormData] = useAtom(formDataAtom);
  const [, setCurrentSection] = useAtom(currentSectionAtom);

  const handleChange = (field: keyof PastYearSection | string, value: string | string[]) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentObj = prev.pastYear[parent as keyof PastYearSection];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            pastYear: {
              ...prev.pastYear,
              [parent]: {
                ...parentObj,
                [child]: value
              }
            }
          };
        }
      }
      
      return {
        ...prev,
        pastYear: {
          ...prev.pastYear,
          [field]: field === "threeWords" ? value.toString().split(",") : value,
        },
      };
    });
  };

  const handleNestedChange = (
    category: "yearOverview",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      pastYear: {
        ...prev.pastYear,
        [category]: {
          ...prev.pastYear[category],
          [field]: value,
        },
      },
    }));
  };

  const handleThreeWordsChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newWords = [...prev.pastYear.threeWords];
      newWords[index] = value;
      
      return {
        ...prev,
        pastYear: {
          ...prev.pastYear,
          threeWords: newWords
        }
      };
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Title */}
      <h2 className={`${crimsonPro.className} text-4xl`}>
        The Past Year
      </h2>

      {/* Calendar Review */}
      <section className="space-y-4">
        <h2 className={`${crimsonPro.className} text-2xl`}>Going through your calendar</h2>
        <p className="text-lg">
          Go through last year's calendar week by week. If you see an important event, family
          gathering, friendly get-together or a significant project, write it down here.
        </p>
        <Textarea
          className="min-h-[200px]"
          value={formData.pastYear.calendarReview}
          onChange={(e) => handleChange("calendarReview", e.target.value)}
          placeholder="Write your calendar review here..."
        />
      </section>

      {/* Year Overview */}
      <section className="space-y-6">
        <h2 className={`${crimsonPro.className} text-2xl`}>This is what my past year was about</h2>
        <p className="text-lg">
          We live our lives through distinct but interconnected aspects. Take a look at the areas
          below and ask yourself what the significant events in each of them were.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">PERSONAL LIFE, FAMILY</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.personalFamily}
              onChange={(e) => handleNestedChange("yearOverview", "personalFamily", e.target.value)}
              placeholder="Write about your personal life and family..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">CAREER, STUDIES</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.careerStudies}
              onChange={(e) => handleNestedChange("yearOverview", "careerStudies", e.target.value)}
              placeholder="Write about your career and studies..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">FRIENDS, COMMUNITY</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.friendsCommunity}
              onChange={(e) => handleNestedChange("yearOverview", "friendsCommunity", e.target.value)}
              placeholder="Write about your friends and community..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">RELAXATION, HOBBIES, CREATIVITY</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.relaxationHobbiesCreativity}
              onChange={(e) => handleNestedChange("yearOverview", "relaxationHobbiesCreativity", e.target.value)}
              placeholder="Write about your relaxation, hobbies, and creativity..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">PHYSICAL HEALTH, FITNESS</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.physicalHealthFitness}
              onChange={(e) => handleNestedChange("yearOverview", "physicalHealthFitness", e.target.value)}
              placeholder="Write about your physical health and fitness..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">MENTAL HEALTH, SELF-KNOWLEDGE</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.mentalHealthSelfKnowledge}
              onChange={(e) => handleNestedChange("yearOverview", "mentalHealthSelfKnowledge", e.target.value)}
              placeholder="Write about your mental health and self-knowledge..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">HABITS THAT DEFINE YOU</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.habitsThatDefineYou}
              onChange={(e) => handleNestedChange("yearOverview", "habitsThatDefineYou", e.target.value)}
              placeholder="Write about your defining habits..."
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">A BETTER TOMORROW*</h3>
            <Textarea
              className="min-h-[150px]"
              value={formData.pastYear.yearOverview.betterTomorrow}
              onChange={(e) => handleNestedChange("yearOverview", "betterTomorrow", e.target.value)}
              placeholder="Write about how you contributed to a better tomorrow..."
            />
            <p className="text-sm italic">* What did you do this year to leave the world in a better shape than you found it?</p>
          </div>
        </div>
      </section>

      {/* Six Sentences */}
      <section className="space-y-6">
        <h3 className={`${crimsonPro.className} text-2xl`}>Six sentences about my past year</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg">The wisest decision I made...</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.wisestDecision}
              onChange={(e) => handleChange("wisestDecision", e.target.value)}
              placeholder="Write about your wisest decision..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">The biggest lesson I learned...</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.biggestLesson}
              onChange={(e) => handleChange("biggestLesson", e.target.value)}
              placeholder="Write about your biggest lesson..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">The biggest risk I took...</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.biggestRisk}
              onChange={(e) => handleChange("biggestRisk", e.target.value)}
              placeholder="Write about your biggest risk..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">The biggest surprise of the year...</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.biggestSurprise}
              onChange={(e) => handleChange("biggestSurprise", e.target.value)}
              placeholder="Write about your biggest surprise..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">The most important thing I did for others...</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.importantForOthers}
              onChange={(e) => handleChange("importantForOthers", e.target.value)}
              placeholder="Write about the most important thing..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">The biggest thing I completed...</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.biggestCompletion}
              onChange={(e) => handleChange("biggestCompletion", e.target.value)}
              placeholder="Write about your biggest completion..."
            />
          </div>
        </div>
      </section>

      {/* Best Moments */}
      <section className="space-y-4">
        <h3 className={`${crimsonPro.className} text-2xl`}>The best moments</h3>
        <p className="text-lg">
          Describe the greatest and most memorable, joyful moments from last year.
        </p>
        <Textarea
          className="min-h-[200px]"
          value={formData.pastYear.bestMoments}
          onChange={(e) => handleChange("bestMoments", e.target.value)}
          placeholder="Write about your best moments..."
        />
      </section>

      {/* Three Words */}
      <section className="space-y-4">
        <h3 className={`${crimsonPro.className} text-2xl`}>The past year in three words</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input
            placeholder="Word 1"
            value={formData.pastYear.threeWords[0] || ''}
            onChange={(e) => handleThreeWordsChange(0, e.target.value)}
          />
          <Input
            placeholder="Word 2"
            value={formData.pastYear.threeWords[1] || ''}
            onChange={(e) => handleThreeWordsChange(1, e.target.value)}
          />
          <Input
            placeholder="Word 3"
            value={formData.pastYear.threeWords[2] || ''}
            onChange={(e) => handleThreeWordsChange(2, e.target.value)}
          />
        </div>
      </section>

      {/* Six Questions */}
      <section className="space-y-6">
        <h3 className={`${crimsonPro.className} text-2xl`}>Six questions about my past year</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg">What are you most proud of?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.mostProudOf}
              onChange={(e) => handleChange("mostProudOf", e.target.value)}
              placeholder="Write what you're most proud of..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">Who are the three people who influenced you the most?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.peopleWhoInfluenced}
              onChange={(e) => handleChange("peopleWhoInfluenced", e.target.value)}
              placeholder="Write about the people who influenced you..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">Who are the three people you influenced the most?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.peopleYouInfluenced}
              onChange={(e) => handleChange("peopleYouInfluenced", e.target.value)}
              placeholder="Write about the people you influenced..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">What were you not able to accomplish?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.notAccomplished}
              onChange={(e) => handleChange("notAccomplished", e.target.value)}
              placeholder="Write about what you were not able to accomplish..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">What is the best thing you have discovered about yourself?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.bestDiscovery}
              onChange={(e) => handleChange("bestDiscovery", e.target.value)}
              placeholder="Write about your best discovery..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">What are you most grateful for?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.mostGratefulFor}
              onChange={(e) => handleChange("mostGratefulFor", e.target.value)}
              placeholder="Write about what you're most grateful for..."
            />
          </div>
        </div>
      </section>

      {/* Accomplishments */}
      <section className="space-y-6">
        <h2 className={`${crimsonPro.className} text-2xl`}>Three of my biggest accomplishments</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg">List your three greatest accomplishments from last year here.</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.biggestAccomplishments}
              onChange={(e) => handleChange("biggestAccomplishments", e.target.value)}
              placeholder="Write about your greatest accomplishments..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">What did you do to achieve these?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.howAchieved}
              onChange={(e) => handleChange("howAchieved", e.target.value)}
              placeholder="Write about how you achieved these..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">Who helped you achieve these successes? How?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.whoHelped}
              onChange={(e) => handleChange("whoHelped", e.target.value)}
              placeholder="Write about who helped you..."
            />
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="space-y-6">
        <h2 className={`${crimsonPro.className} text-2xl`}>Three of my biggest challenges</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg">List your three biggest challenges from last year here.</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.biggestChallenges}
              onChange={(e) => handleChange("biggestChallenges", e.target.value)}
              placeholder="Write about your biggest challenges..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">Who or what helped you overcome these challenges?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.whoHelpedChallenges}
              onChange={(e) => handleChange("whoHelpedChallenges", e.target.value)}
              placeholder="Write about who or what helped you..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg">What have you learned about yourself by overcoming these challenges?</h4>
            <Textarea
              className="min-h-[100px]"
              value={formData.pastYear.challengeLearnings}
              onChange={(e) => handleChange("challengeLearnings", e.target.value)}
              placeholder="Write about what you learned..."
            />
          </div>
        </div>
      </section>

      {/* Forgiveness */}
      <section className="space-y-4">
        <h2 className={`${crimsonPro.className} text-2xl`}>Forgiveness</h2>
        <p className="text-lg">
          Did anything happen during the past year that still needs to be forgiven? Deeds or
          words that made you feel bad? Or are you angry with yourself? Write it down here.
          Do yourself good by forgiving.*
        </p>
        <Textarea
          className="min-h-[200px]"
          value={formData.pastYear.forgiveness}
          onChange={(e) => handleChange("forgiveness", e.target.value)}
          placeholder="Write about what needs to be forgiven..."
        />
        <p className="text-sm italic">
          * If you don't feel ready to forgive yet, jot it down anyway. It can work wonders.
        </p>
      </section>

      {/* Letting Go */}
      <section className="space-y-4">
        <h2 className={`${crimsonPro.className} text-2xl`}>Letting go</h2>
        <p className="text-lg">
          Is there anything else you need to say? Is there anything you have to let go of before
          you can start your next year? Draw or write, then think about it and let it all go.
        </p>
        <Textarea
          className="min-h-[200px]"
          value={formData.pastYear.lettingGo}
          onChange={(e) => handleChange("lettingGo", e.target.value)}
          placeholder="Write about what you need to let go..."
        />
      </section>

      {/* Book Title */}
      <section className="space-y-4">
        <h2 className={`${crimsonPro.className} text-2xl`}>The book of my past year</h2>
        <p className="text-lg">A book or a movie was made about your past year. What title would you give it?</p>
        <Input
          value={formData.pastYear.bookTitle}
          onChange={(e) => handleChange("bookTitle", e.target.value)}
          placeholder="Enter the title..."
        />
      </section>

      {/* Remove navigation buttons */}
    </div>
  );
} 