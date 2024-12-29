import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

// Function to get the API key
function getApiKey(): string {
  // Try to get custom API key from localStorage
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  return customKey || process.env.GEMINI_API_KEY || "";
}

// Initialize Gemini with dynamic API key
function getGeminiClient() {
  return new GoogleGenerativeAI(getApiKey());
}

export type AnalysisFramework = 
  | "pattern" 
  | "growth" 
  | "tarot" 
  | "mantra" 
  | "hero" 
  | "quest" 
  | "constellation"
  | "custom";

interface AnalysisRequest {
  formData: any;
  framework: AnalysisFramework;
  customPrompt?: string;
}

const FRAMEWORK_PROMPTS = {
  pattern: `You are an insightful pattern observer who reveals the subtle rhythms and deeper currents in life journeys. Look beneath the surface of their responses to illuminate connections they might not see themselves.

When analyzing patterns:
- Search for the quiet themes that run beneath louder events
- Notice how different life areas subtly influence each other
- Identify recurring situations that might signal deeper patterns
- Look for surprising connections between past choices and future aspirations

Create insights that:
- Illuminate unconscious patterns they're ready to see
- Show how seemingly separate areas connect
- Reveal strengths they demonstrate but might not recognize
- Map how past patterns could inform future choices in unexpected ways

Frame discoveries as possibilities rather than certainties, inviting deeper exploration of the patterns you reveal.`,

  growth: `You are a perceptive growth architect who sees how different experiences build upon each other to create possibilities. Map the invisible structures of their development in ways that reveal new potential.

When analyzing growth:
- Look for unexpected foundations of strength
- Identify subtle skills developed through challenges
- Notice how different experiences compound and combine
- Map the hidden scaffolding of their development

Create insights that:
- Show how different strengths could combine in new ways
- Reveal growth that happened while they weren't looking
- Illuminate potential paths they might not have considered
- Suggest unexpected applications of their capabilities

Frame the analysis as an exploration of possibilities rather than a fixed assessment.`,

  tarot: `You are an intuitive tarot reader who reveals the deeper mythic patterns in personal journeys. Create a reading that illuminates the archetypal forces at play in their experiences.

When interpreting their journey:
- Look for the mythic themes beneath daily events
- Notice how different aspects of their journey reflect universal patterns
- Identify the deeper currents running through their experiences
- See how their personal story connects to timeless themes

Create insights that:
- Reveal unique resonance with their journey
- Show how it illuminates aspects they might not have noticed
- Connect universal meanings to personal specifics
- Suggest new ways of seeing their situation

Frame the reading as an exploration of possibilities rather than a prediction.`,

  mantra: `You are a wisdom weaver who crafts powerful phrases that crystallize deep truths and possibilities. Create mantras that emerge from the deeper currents of their journey rather than their surface statements.

When crafting mantras:
- Listen for the unspoken aspirations beneath their words
- Find the power in what they're reaching toward
- Notice the wisdom hidden in their challenges
- Capture the essence of their transformations

For each mantra:
- Create phrases that surprise and resonate
- Weave together different threads of their journey
- Transform limitations into possibilities
- Capture unstated but emerging truths`,

  hero: `You are a mythic storyteller who reveals how personal journeys echo ancient patterns of transformation. Transform their experiences into a hero's journey that illuminates deeper meaning without diminishing personal specifics.

When crafting the narrative:
- Find the mythic resonance in everyday moments
- See how personal challenges reflect universal trials
- Recognize the quiet heroism in their choices
- Notice the subtle transformations beneath obvious changes

Create a story that:
- Reveals the epic nature of their personal journey
- Shows how their challenges serve their growth
- Illuminates the deeper purpose in their struggles
- Maps their path forward through mythic lens`,

  quest: `You are a mystical cartographer who transforms life journeys into epic adventures. Create a quest map that reveals the hidden possibilities and unexpected connections in their path.

When mapping their journey:
- Find the adventure in everyday moments
- See how different life areas create territories to explore
- Notice the skills gained from each challenge
- Map the relationships between different goals

Create a quest landscape that:
- Reveals unexpected paths to stated goals
- Shows how different aspects of life connect
- Illuminates side quests that might yield surprising rewards
- Maps resources they might not realize they have`,

  constellation: `You are a celestial cartographer who sees how individual moments create constellations of meaning. Map their experiences into star patterns that reveal new connections and possibilities.

When creating their star map:
- See how different events create meaningful patterns
- Notice the subtle connections between experiences
- Find the guiding stars they might not recognize
- Map the cosmic dance of their journey

Create constellations that:
- Show how different life aspects illuminate each other
- Reveal patterns visible only from a cosmic perspective
- Map future possibilities in their celestial landscape
- Connect past lights to future pathways`
};

const FRAMEWORK_DATA_MAPPERS = {
  pattern: (formData: any) => ({
    past: {
      keyEvents: formData.pastYear.calendarReview,
      lifeSections: formData.pastYear.yearOverview,
      achievements: formData.pastYear.biggestAccomplishments,
      challenges: formData.pastYear.biggestChallenges,
      learnings: formData.pastYear.challengeLearnings
    },
    future: {
      intentions: formData.yearAhead.dreamBig,
      lifeSections: formData.yearAhead.yearOverview,
      goals: formData.yearAhead.magicalTriplets.achieveMost
    }
  }),
  growth: (formData: any) => ({
    foundations: {
      pastAccomplishments: formData.pastYear.biggestAccomplishments,
      pastLessons: formData.pastYear.biggestLesson,
      supportSystems: formData.pastYear.whoHelped
    },
    aspirations: {
      futureGoals: formData.yearAhead.magicalTriplets.achieveMost,
      personalGrowth: formData.yearAhead.yearOverview.mentalHealthSelfKnowledge,
      plannedSupport: formData.yearAhead.magicalTriplets.pillarsInRoughTimes
    }
  }),
  tarot: (formData: any) => ({
    pastInfluences: {
      majorEvents: formData.pastYear.calendarReview,
      challenges: formData.pastYear.biggestChallenges,
      victories: formData.pastYear.biggestAccomplishments,
      lessons: formData.pastYear.biggestLesson
    },
    presentState: {
      currentFocus: formData.yearAhead.wordOfYear,
      keyIntentions: formData.yearAhead.magicalTriplets.achieveMost,
      innerWork: formData.yearAhead.magicalTriplets.loveAboutSelf
    },
    futurePathways: {
      aspirations: formData.yearAhead.dreamBig,
      fears: formData.yearAhead.magicalTriplets.letGoOf,
      opportunities: formData.yearAhead.magicalTriplets.dareToDiscover
    }
  }),
  mantra: (formData: any) => ({
    corePurpose: {
      yearWord: formData.yearAhead.wordOfYear,
      secretWish: formData.yearAhead.secretWish,
      keyGoals: formData.yearAhead.magicalTriplets.achieveMost
    },
    personalPower: {
      strengths: formData.pastYear.bestDiscovery,
      intentions: formData.yearAhead.sixSentences.beBravest,
      selfLove: formData.yearAhead.magicalTriplets.loveAboutSelf
    },
    transformations: {
      releasing: formData.yearAhead.magicalTriplets.letGoOf,
      embracing: formData.yearAhead.magicalTriplets.dareToDiscover,
      becoming: formData.yearAhead.dreamBig
    }
  }),
  hero: (formData: any) => ({
    departure: {
      ordinaryWorld: formData.pastYear.calendarReview,
      call: formData.pastYear.biggestRisk,
      threshold: formData.pastYear.biggestChallenges
    },
    initiation: {
      trials: formData.pastYear.challengeLearnings,
      allies: formData.pastYear.whoHelped,
      transformation: formData.pastYear.bestDiscovery
    },
    return: {
      newPowers: formData.yearAhead.magicalTriplets.loveAboutSelf,
      newWorld: formData.yearAhead.dreamBig,
      elixir: formData.yearAhead.secretWish
    }
  }),
  quest: (formData: any) => ({
    pastQuests: {
      achievements: formData.pastYear.biggestAccomplishments,
      battles: formData.pastYear.biggestChallenges,
      treasures: formData.pastYear.bestDiscovery
    },
    companions: {
      allies: formData.pastYear.whoHelped,
      mentors: formData.pastYear.peopleWhoInfluenced,
      futureAllies: formData.yearAhead.magicalTriplets.pillarsInRoughTimes
    },
    futureQuests: {
      mainQuests: formData.yearAhead.magicalTriplets.achieveMost,
      sideQuests: formData.yearAhead.magicalTriplets.dareToDiscover,
      questRewards: formData.yearAhead.magicalTriplets.rewardSuccesses
    }
  }),
  constellation: (formData: any) => ({
    brightestStars: {
      achievements: formData.pastYear.biggestAccomplishments,
      moments: formData.pastYear.bestMoments,
      discoveries: formData.pastYear.bestDiscovery
    },
    starClusters: {
      relationships: formData.pastYear.peopleWhoInfluenced,
      lessons: formData.pastYear.biggestLesson,
      gratitude: formData.pastYear.mostGratefulFor
    },
    futureStars: {
      dreams: formData.yearAhead.dreamBig,
      wishes: formData.yearAhead.secretWish,
      goals: formData.yearAhead.magicalTriplets.achieveMost
    }
  })
};

export async function analyzeWithGemini({ formData, framework, customPrompt }: AnalysisRequest) {
  try {
    // Check rate limit only if using shared API key
    const apiKey = getApiKey();
    if (apiKey === process.env.GEMINI_API_KEY) {
      const rateLimitResult = await rateLimit();
      if (!rateLimitResult.success) {
        throw new Error("Rate limit exceeded. Please try again later or use your own API key.");
      }
    }

    // Get the model with current API key
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get the framework-specific prompt and data
    const prompt = framework === "custom" 
      ? customPrompt 
      : FRAMEWORK_PROMPTS[framework];

    // For custom prompts, provide all data
    const analysisData = framework === "custom" 
      ? {
          pastYear: formData.pastYear,
          yearAhead: formData.yearAhead
        }
      : FRAMEWORK_DATA_MAPPERS[framework](formData);

    if (!prompt) {
      throw new Error("Please provide a custom prompt for analysis.");
    }

    // Generate the analysis
    const result = await model.generateContent([
      prompt,
      JSON.stringify(analysisData, null, 2)
    ]);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      analysis: text
    };
  } catch (error: any) {
    // Check for API key errors
    if (error.message?.includes('API key')) {
      return {
        success: false,
        error: "Invalid API key. Please check your API key or try using the shared key."
      };
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// Add function to save API key
export function saveApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
} 