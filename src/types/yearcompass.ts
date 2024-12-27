export interface WelcomeSection {
  title: string;
  introduction: string;
  requirements: string[];
  groupGuidelines: string;
}

export interface PastYearSection {
  calendarReview: string;
  yearOverview: {
    personalLife: string;
    career: string;
    friends: string;
    relaxation: string;
    physicalHealth: string;
    mentalHealth: string;
    habits: string;
    betterTomorrow: string;
  };
  sixSentences: {
    biggestCompletion: string;
    importantAction: string;
    biggestSurprise: string;
    biggestRisk: string;
    biggestLesson: string;
    wisestDecision: string;
  };
  bestMoments: string;
  accomplishments: {
    list: string[];
    actions: string;
    helpers: string;
  };
  challenges: {
    list: string[];
    howOvercome: string;
    lessonsLearned: string;
  };
  forgiveness: string;
  lettingGo: string;
  yearSummary: {
    threeWords: string[];
    bookTitle: string;
    goodbye: string;
  };
}

export interface YearAheadSection {
  wordOfYear: string;
  secretWish: string;
  sixSentences: {
    specialReason: string;
    selfAdvice: string;
    sayingYes: string;
    beingBrave: string;
    energySources: string;
    noProcrastination: string;
  };
  magicalTriplets: {
    cozyEnvironment: string[];
    morningRoutine: string[];
    selfCare: string[];
    placesToVisit: string[];
    connections: string[];
    rewards: string[];
    selfLove: string[];
    lettingGo: string[];
    achievements: string[];
    supporters: string[];
    discoveries: string[];
    boundaries: string[];
  };
  lifeAreas: {
    personal: string;
    career: string;
    community: string;
    hobbies: string;
    health: string;
    mental: string;
    habits: string;
    impact: string;
  };
  dreamBig: string;
}

export interface ClosingSection {
  signature: string;
  date: string;
  affirmation: string;
  sharing: {
    hashtag: string;
    website: string;
  };
}

export interface YearCompassForm {
  welcome: WelcomeSection;
  pastYear: PastYearSection;
  yearAhead: YearAheadSection;
  closing: ClosingSection;
}

export type FormSection = 'welcome' | 'pastYear' | 'yearAhead' | 'closing'; 