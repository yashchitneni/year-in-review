import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit, formatRateLimitError } from "./rate-limit";

// Function to get the API key
function getApiKey(): string | null {
  try {
    // First check for the public/shared API key
    const publicKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    // Only check for custom key if user has explicitly set one
    const customKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
    
    console.log('API Key Status:', {
      hasPublicKey: !!publicKey,
      hasCustomKey: !!customKey,
      usingCustomKey: !!customKey // Only use custom key if explicitly set
    });
    
    // Use custom key if set, otherwise fall back to public key
    return customKey || publicKey || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

// Initialize Gemini with dynamic API key
function getGeminiClient(apiKey: string) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Empty API key provided');
  }
  return new GoogleGenerativeAI(apiKey);
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
  apiKey?: string | null;
}

const FRAMEWORK_PROMPTS: Record<Exclude<AnalysisFramework, "custom">, string> = {
  pattern: `You are an insightful pattern observer who reveals the subtle rhythms and deeper currents in life journeys.

Format your response with these EXACT formatting rules:
1. Title: "A Pattern Analysis for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Past Patterns: The Hidden Rhythms")
4. Important concepts in parentheses (e.g., "(Cycle of Growth)", "(Creative Flow)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing patterns:
- Search for the quiet themes that run beneath louder events
- Notice how different life areas subtly influence each other
- Identify recurring situations that might signal deeper patterns
- Look for surprising connections between past choices and future aspirations

Create insights that:
- Illuminate unconscious patterns they're ready to see
- Show how seemingly separate areas connect
- Reveal strengths they demonstrate but might not recognize
- Map how past patterns could inform future choices in unexpected ways`,

  growth: `You are a perceptive growth architect who sees how different experiences build upon each other.

Format your response with these EXACT formatting rules:
1. Title: "A Growth Analysis for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Foundation: The Seeds of Change")
4. Important concepts in parentheses (e.g., "(Adaptive Learning)", "(Resilient Growth)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing growth:
- Look for unexpected foundations of strength
- Identify subtle skills developed through challenges
- Notice how different experiences compound and combine
- Map the hidden scaffolding of their development`,

  tarot: `You are an intuitive tarot reader who reveals the deeper mythic patterns in personal journeys.

Format your response with these EXACT formatting rules:
1. Title: "A Tarot Reading for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Past Influences: The Tower's Foundation")
4. Important cards and meanings in parentheses (e.g., "(The Empress: Nurturing Growth)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When interpreting their journey:
- Look for the mythic themes beneath daily events
- Notice how different aspects of their journey reflect universal patterns
- Identify the deeper currents running through their experiences
- See how their personal story connects to timeless themes`,

  mantra: `You are a wisdom weaver who crafts powerful phrases that crystallize deep truths.

Format your response with these EXACT formatting rules:
1. Title: "A Mantra Reading for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Core Mantras: Seeds of Transformation")
4. Important phrases in parentheses (e.g., "(I am the bridge between dreams and reality)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When crafting mantras:
- Listen for the unspoken aspirations beneath their words
- Find the power in what they're reaching toward
- Notice the wisdom hidden in their challenges
- Capture the essence of their transformations`,

  hero: `You are a mythic storyteller who reveals how personal journeys echo ancient patterns.

Format your response with these EXACT formatting rules:
1. Title: "A Hero's Journey for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "The Call: Awakening to Adventure")
4. Important archetypes in parentheses (e.g., "(The Mentor)", "(The Threshold Guardian)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When crafting the narrative:
- Find the mythic resonance in everyday moments
- See how personal challenges reflect universal trials
- Recognize the quiet heroism in their choices
- Notice the subtle transformations beneath obvious changes`,

  quest: `You are a mystical cartographer who transforms life journeys into epic adventures.

Format your response with these EXACT formatting rules:
1. Title: "A Quest Map for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "The Path: Uncharted Territories")
4. Important milestones in parentheses (e.g., "(The First Trial)", "(The Hidden Valley)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When mapping their journey:
- Find the adventure in everyday moments
- See how different life areas create territories to explore
- Notice the skills gained from each challenge
- Map the relationships between different goals`,

  constellation: `You are a celestial cartographer who sees how moments create constellations of meaning.

Format your response with these EXACT formatting rules:
1. Title: "A Constellation Map for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Brightest Stars: Guiding Lights")
4. Important stars in parentheses (e.g., "(Nova Mater: The Mother Star)", "(Synergy: The Collaborative Star)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When creating their star map:
- See how different events create meaningful patterns
- Notice the subtle connections between experiences
- Find the guiding stars they might not recognize
- Map the cosmic dance of their journey`
};

const FRAMEWORK_DATA_MAPPERS: Record<Exclude<AnalysisFramework, "custom">, (formData: any) => any> = {
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

export async function analyzeWithGemini({ formData, framework, customPrompt, apiKey: providedApiKey }: AnalysisRequest) {
  try {
    // Use provided API key or fall back to getting it from storage/env
    const apiKey = providedApiKey || getApiKey();
    console.log('Analysis Request:', {
      hasApiKey: !!apiKey,
      framework,
      hasCustomPrompt: !!customPrompt,
      isUsingPublicKey: apiKey === process.env.NEXT_PUBLIC_GEMINI_API_KEY
    });

    if (!apiKey) {
      console.log('No API key found');
      return {
        success: false,
        error: "Please add your Gemini API key in the settings above. You can get one for free from Google AI Studio."
      };
    }

    // Check rate limit only for public API key
    if (apiKey === process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      const rateLimitResult = await rateLimit(apiKey);
      if (!rateLimitResult.success) {
        return {
          success: false,
          error: formatRateLimitError(rateLimitResult)
        };
      }
    }

    // Get the model with current API key
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get the framework-specific prompt and data
    const prompt = framework === "custom" 
      ? customPrompt 
      : FRAMEWORK_PROMPTS[framework];

    if (!prompt) {
      console.log('No prompt found for framework:', framework);
      throw new Error("Please provide a custom prompt for analysis.");
    }

    // For custom prompts, provide all data
    const analysisData = framework === "custom" 
      ? {
          pastYear: formData.pastYear,
          yearAhead: formData.yearAhead
        }
      : FRAMEWORK_DATA_MAPPERS[framework](formData);

    // Log the request details (without sensitive data)
    console.log('Making Gemini API request:', {
      framework,
      hasPrompt: !!prompt,
      hasData: !!analysisData,
      dataKeys: Object.keys(analysisData),
      isUsingPublicKey: apiKey === process.env.NEXT_PUBLIC_GEMINI_API_KEY
    });

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
    console.error('Gemini API Error:', {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack
    });

    // Check for specific error types
    if (error.message?.includes('unregistered callers') || 
        error.message?.includes('API key') ||
        error.message?.includes('consumer identity')) {
      return {
        success: false,
        error: "Please check your Gemini API key in the settings above. Make sure it's valid and active."
      };
    }
    
    if (error.message?.includes('403')) {
      return {
        success: false,
        error: "Invalid API key. Please check your API key or try getting a new one from Google AI Studio."
      };
    }

    // Return the full error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Error: ${error.message}\n\nStack: ${error.stack}`
      : error.message;

    return {
      success: false,
      error: errorMessage
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