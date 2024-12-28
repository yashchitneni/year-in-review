"use client";

import { useAtom } from "jotai";
import { formDataAtom, currentSectionAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function YearAheadSection() {
  const [formData, setFormData] = useAtom(formDataAtom);
  const [, setCurrentSection] = useAtom(currentSectionAtom);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      yearAhead: {
        ...(prev.yearAhead || {}),
        [field]: value,
      },
    }));
  };

  const handleNestedChange = (
    category: "yearOverview" | "sixSentences",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      yearAhead: {
        ...prev.yearAhead,
        [category]: {
          ...prev.yearAhead[category],
          [field]: value,
        },
      },
    }));
  };

  type MagicalTripletField = keyof typeof formData.yearAhead.magicalTriplets;

  const handleMagicalTripletChange = (field: MagicalTripletField, index: number, value: string) => {
    setFormData((prev) => {
      const newTriplets = [...prev.yearAhead.magicalTriplets[field]];
      newTriplets[index] = value;
      
      return {
        ...prev,
        yearAhead: {
          ...prev.yearAhead,
          magicalTriplets: {
            ...prev.yearAhead.magicalTriplets,
            [field]: newTriplets
          }
        }
      };
    });
  };

  return (
    <div id="yearAheadSection" className="max-w-4xl mx-auto bg-white p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center text-sm">
          <div>YearCompass</div>
          <div>2024 « | » 2025</div>
        </div>

        {/* Title */}
        <h1 className={`${crimsonPro.className} text-5xl text-center border-b pb-4`}>
          The Year Ahead
        </h1>

        {/* Dream Big */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Dare to dream big</h2>
          <p className="text-lg">
            What does the year ahead of you look like? Why will it be great? What would happen
            in an ideal world? Write, draw, let go of your expectations and dare to dream.
          </p>
          <Textarea
            className="min-h-[300px]"
            value={formData.yearAhead.dreamBig}
            onChange={(e) => handleChange("dreamBig", e.target.value)}
          />
        </section>

        {/* Year Overview */}
        <section className="space-y-6">
          <h2 className={`${crimsonPro.className} text-3xl`}>This is what my next year will be about</h2>
          <p className="text-lg">
            Take a look at the areas of your life and decide your goals for each of them for the next
            year. Put those goals on the page—this is the first step towards realizing them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">PERSONAL LIFE, FAMILY</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.personalFamily}
                onChange={(e) => handleNestedChange("yearOverview", "personalFamily", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">CAREER, STUDIES</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.careerStudies}
                onChange={(e) => handleNestedChange("yearOverview", "careerStudies", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">FRIENDS, COMMUNITY</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.friendsCommunity}
                onChange={(e) => handleNestedChange("yearOverview", "friendsCommunity", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">RELAXATION, HOBBIES, CREATIVITY</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.relaxationHobbiesCreativity}
                onChange={(e) => handleNestedChange("yearOverview", "relaxationHobbiesCreativity", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">PHYSICAL HEALTH, FITNESS</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.physicalHealthFitness}
                onChange={(e) => handleNestedChange("yearOverview", "physicalHealthFitness", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">MENTAL HEALTH, SELF-KNOWLEDGE</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.mentalHealthSelfKnowledge}
                onChange={(e) => handleNestedChange("yearOverview", "mentalHealthSelfKnowledge", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">HABITS THAT DEFINE YOU</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.habitsThatDefineYou}
                onChange={(e) => handleNestedChange("yearOverview", "habitsThatDefineYou", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">A BETTER TOMORROW*</h3>
              <Textarea
                className="min-h-[150px]"
                value={formData.yearAhead.yearOverview.betterTomorrow}
                onChange={(e) => handleNestedChange("yearOverview", "betterTomorrow", e.target.value)}
              />
              <p className="text-sm italic">* What will you do next year to leave the world in a better shape than you found it?</p>
            </div>
          </div>
        </section>

        {/* Magical Triplets */}
        <section className="space-y-6">
          <h2 className={`${crimsonPro.className} text-3xl`}>Magical triplets for the year ahead</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg">I will love these three things about myself.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.loveAboutSelf[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('loveAboutSelf', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.loveAboutSelf[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('loveAboutSelf', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.loveAboutSelf[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('loveAboutSelf', 2, e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg">I am ready to let go of these three things.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.letGoOf[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('letGoOf', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.letGoOf[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('letGoOf', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.letGoOf[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('letGoOf', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I want to achieve these three things the most.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.achieveMost[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('achieveMost', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.achieveMost[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('achieveMost', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.achieveMost[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('achieveMost', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">These three people will be my pillars during rough times.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Person 1"
                  value={formData.yearAhead.magicalTriplets.pillarsInRoughTimes[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('pillarsInRoughTimes', 0, e.target.value)}
                />
                <Input
                  placeholder="Person 2"
                  value={formData.yearAhead.magicalTriplets.pillarsInRoughTimes[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('pillarsInRoughTimes', 1, e.target.value)}
                />
                <Input
                  placeholder="Person 3"
                  value={formData.yearAhead.magicalTriplets.pillarsInRoughTimes[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('pillarsInRoughTimes', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will dare to discover these three things.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.dareToDiscover[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('dareToDiscover', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.dareToDiscover[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('dareToDiscover', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.dareToDiscover[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('dareToDiscover', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will have the power to say no to these three things.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.sayNoTo[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('sayNoTo', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.sayNoTo[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('sayNoTo', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.sayNoTo[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('sayNoTo', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will make my surroundings cozy with these three things.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.surroundingsCozy[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('surroundingsCozy', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.surroundingsCozy[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('surroundingsCozy', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.surroundingsCozy[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('surroundingsCozy', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will do these three things every morning.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.morningRoutine[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('morningRoutine', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.morningRoutine[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('morningRoutine', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.morningRoutine[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('morningRoutine', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will pamper myself with these three things regularly.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Item 1"
                  value={formData.yearAhead.magicalTriplets.pamperSelf[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('pamperSelf', 0, e.target.value)}
                />
                <Input
                  placeholder="Item 2"
                  value={formData.yearAhead.magicalTriplets.pamperSelf[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('pamperSelf', 1, e.target.value)}
                />
                <Input
                  placeholder="Item 3"
                  value={formData.yearAhead.magicalTriplets.pamperSelf[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('pamperSelf', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will visit these three places.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Place 1"
                  value={formData.yearAhead.magicalTriplets.placesToVisit[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('placesToVisit', 0, e.target.value)}
                />
                <Input
                  placeholder="Place 2"
                  value={formData.yearAhead.magicalTriplets.placesToVisit[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('placesToVisit', 1, e.target.value)}
                />
                <Input
                  placeholder="Place 3"
                  value={formData.yearAhead.magicalTriplets.placesToVisit[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('placesToVisit', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will connect with my loved ones in these three ways.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Way 1"
                  value={formData.yearAhead.magicalTriplets.connectWithLovedOnes[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('connectWithLovedOnes', 0, e.target.value)}
                />
                <Input
                  placeholder="Way 2"
                  value={formData.yearAhead.magicalTriplets.connectWithLovedOnes[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('connectWithLovedOnes', 1, e.target.value)}
                />
                <Input
                  placeholder="Way 3"
                  value={formData.yearAhead.magicalTriplets.connectWithLovedOnes[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('connectWithLovedOnes', 2, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">I will reward my successes with these three presents.</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Present 1"
                  value={formData.yearAhead.magicalTriplets.rewardSuccesses[0] || ''}
                  onChange={(e) => handleMagicalTripletChange('rewardSuccesses', 0, e.target.value)}
                />
                <Input
                  placeholder="Present 2"
                  value={formData.yearAhead.magicalTriplets.rewardSuccesses[1] || ''}
                  onChange={(e) => handleMagicalTripletChange('rewardSuccesses', 1, e.target.value)}
                />
                <Input
                  placeholder="Present 3"
                  value={formData.yearAhead.magicalTriplets.rewardSuccesses[2] || ''}
                  onChange={(e) => handleMagicalTripletChange('rewardSuccesses', 2, e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Six Sentences */}
        <section className="space-y-6">
          <h2 className={`${crimsonPro.className} text-3xl`}>Six sentences about my next year</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-lg">This year I will not procrastinate any more over...</label>
              <Textarea
                className="min-h-[100px]"
                value={formData.yearAhead.sixSentences.notProcrastinate}
                onChange={(e) => handleNestedChange("sixSentences", "notProcrastinate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg">This year I will draw the most energy from...</label>
              <Textarea
                className="min-h-[100px]"
                value={formData.yearAhead.sixSentences.drawEnergyFrom}
                onChange={(e) => handleNestedChange("sixSentences", "drawEnergyFrom", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg">This year, I will be bravest when...</label>
              <Textarea
                className="min-h-[100px]"
                value={formData.yearAhead.sixSentences.beBravest}
                onChange={(e) => handleNestedChange("sixSentences", "beBravest", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg">This year I will say yes when...</label>
              <Textarea
                className="min-h-[100px]"
                value={formData.yearAhead.sixSentences.sayYesTo}
                onChange={(e) => handleNestedChange("sixSentences", "sayYesTo", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg">This year I advise myself to...</label>
              <Textarea
                className="min-h-[100px]"
                value={formData.yearAhead.sixSentences.adviseSelf}
                onChange={(e) => handleNestedChange("sixSentences", "adviseSelf", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg">This year will be special for me because...</label>
              <Textarea
                className="min-h-[100px]"
                value={formData.yearAhead.sixSentences.specialBecause}
                onChange={(e) => handleNestedChange("sixSentences", "specialBecause", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Word of the Year */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>My word for the year ahead</h2>
          <p className="text-lg">
            Pick a word to symbolise and define the year ahead. You can look at this word if you
            need some extra energy, so you remember not to give up your dreams.
          </p>
          <Input
            value={formData.yearAhead.wordOfYear}
            onChange={(e) => handleChange("wordOfYear", e.target.value)}
            placeholder="Enter your word for the year"
          />
        </section>

        {/* Secret Wish */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Secret wish</h2>
          <p className="text-lg">
            Unleash your mind. What is your secret wish for the next year?
          </p>
          <Textarea
            className="min-h-[200px]"
            value={formData.yearAhead.secretWish}
            onChange={(e) => handleChange("secretWish", e.target.value)}
          />
        </section>

        {/* Congratulations */}
        <div className="text-center space-y-4 py-8">
          <h3 className={`${crimsonPro.className} text-2xl`}>
            Congratulations, you've just planned your year!
          </h3>
        </div>
      </div>
    </div>
  );
} 