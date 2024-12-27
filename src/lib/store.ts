import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Getter } from "jotai";

export interface YearOverview {
  personalFamily: string;
  careerStudies: string;
  friendsCommunity: string;
  relaxationHobbiesCreativity: string;
  physicalHealthFitness: string;
  mentalHealthSelfKnowledge: string;
  habitsThatDefineYou: string;
  betterTomorrow: string;
}

export interface PastYearSection {
  calendarReview: string;
  yearOverview: YearOverview;
  wisestDecision: string;
  biggestLesson: string;
  biggestRisk: string;
  biggestSurprise: string;
  importantForOthers: string;
  biggestCompletion: string;
  mostProudOf: string;
  peopleWhoInfluenced: string;
  peopleYouInfluenced: string;
  notAccomplished: string;
  bestDiscovery: string;
  mostGratefulFor: string;
  bestMoments: string;
  biggestAccomplishments: string;
  howAchieved: string;
  whoHelped: string;
  biggestChallenges: string;
  whoHelpedChallenges: string;
  challengeLearnings: string;
  forgiveness: string;
  lettingGo: string;
  threeWords: string[];
  bookTitle: string;
  goodbye: string;
}

export interface MagicalTriplets {
  loveAboutSelf: string[];
  letGoOf: string[];
  achieveMost: string[];
  pillarsInRoughTimes: string[];
  dareToDiscover: string[];
  sayNoTo: string[];
  surroundingsCozy: string[];
  morningRoutine: string[];
  pamperSelf: string[];
  placesToVisit: string[];
  connectWithLovedOnes: string[];
  rewardSuccesses: string[];
}

export interface SixSentences {
  notProcrastinate: string;
  drawEnergyFrom: string;
  beBravest: string;
  sayYesTo: string;
  adviseSelf: string;
  specialBecause: string;
}

export interface YearAheadSection {
  dreamBig: string;
  yearOverview: YearOverview;
  magicalTriplets: MagicalTriplets;
  sixSentences: SixSentences;
  wordOfYear: string;
  secretWish: string;
}

export interface ClosingSection {
  signature: string;
  date: string;
  sharing: {
    hashtag: string;
    website: string;
  };
}

export interface FormData {
  pastYear: PastYearSection;
  yearAhead: YearAheadSection;
  closing: ClosingSection;
}

// Initialize with empty values
const initialFormData: FormData = {
  pastYear: {
    calendarReview: '',
    yearOverview: {
      personalFamily: '',
      careerStudies: '',
      friendsCommunity: '',
      relaxationHobbiesCreativity: '',
      physicalHealthFitness: '',
      mentalHealthSelfKnowledge: '',
      habitsThatDefineYou: '',
      betterTomorrow: ''
    },
    wisestDecision: '',
    biggestLesson: '',
    biggestRisk: '',
    biggestSurprise: '',
    importantForOthers: '',
    biggestCompletion: '',
    mostProudOf: '',
    peopleWhoInfluenced: '',
    peopleYouInfluenced: '',
    notAccomplished: '',
    bestDiscovery: '',
    mostGratefulFor: '',
    bestMoments: '',
    biggestAccomplishments: '',
    howAchieved: '',
    whoHelped: '',
    biggestChallenges: '',
    whoHelpedChallenges: '',
    challengeLearnings: '',
    forgiveness: '',
    lettingGo: '',
    threeWords: ['', '', ''],
    bookTitle: '',
    goodbye: ''
  },
  yearAhead: {
    dreamBig: '',
    yearOverview: {
      personalFamily: '',
      careerStudies: '',
      friendsCommunity: '',
      relaxationHobbiesCreativity: '',
      physicalHealthFitness: '',
      mentalHealthSelfKnowledge: '',
      habitsThatDefineYou: '',
      betterTomorrow: ''
    },
    magicalTriplets: {
      loveAboutSelf: ['', '', ''],
      letGoOf: ['', '', ''],
      achieveMost: ['', '', ''],
      pillarsInRoughTimes: ['', '', ''],
      dareToDiscover: ['', '', ''],
      sayNoTo: ['', '', ''],
      surroundingsCozy: ['', '', ''],
      morningRoutine: ['', '', ''],
      pamperSelf: ['', '', ''],
      placesToVisit: ['', '', ''],
      connectWithLovedOnes: ['', '', ''],
      rewardSuccesses: ['', '', '']
    },
    sixSentences: {
      notProcrastinate: '',
      drawEnergyFrom: '',
      beBravest: '',
      sayYesTo: '',
      adviseSelf: '',
      specialBecause: ''
    },
    wordOfYear: '',
    secretWish: ''
  },
  closing: {
    signature: '',
    date: '',
    sharing: {
      hashtag: '',
      website: ''
    }
  }
};

export const formDataAtom = atomWithStorage<FormData>("yearCompassData", initialFormData);

export type FormSection = "welcome" | "pastYear" | "yearAhead" | "closing";
export const currentSectionAtom = atomWithStorage<FormSection>("currentSection", "welcome");

export const progressAtom = atom((get: Getter) => {
  const formData = get(formDataAtom);
  const totalFields = Object.keys(formData).length;
  const filledFields = Object.values(formData).filter(Boolean).length;
  return Math.round((filledFields / totalFields) * 100);
}); 