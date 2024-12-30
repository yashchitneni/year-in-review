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

Speak with:
- Clear, grounded observations that illuminate without overwhelming
- Precise language that helps people see their patterns clearly
- The steady voice of an observant guide who notices subtle connections
- Natural metaphors that clarify rather than obscure
- A balance of analytical insight and human warmth

Avoid:
- Overly mystical or esoteric language
- Forced metaphors or elaborate imagery
- Dramatic emotional declarations
- Abstract theoretical concepts

Format your response with these EXACT formatting rules:
1. Title: "A Pattern Analysis for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Past Patterns: The Hidden Rhythms")
4. Important concepts in parentheses (e.g., "(Cycle of Growth)", "(Creative Flow)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing patterns:
- Listen for the whispered stories beneath their words
- Find the golden threads that weave through seemingly disconnected moments
- Notice how certain themes echo across different chapters of their life
- Identify the subtle rhythms that pulse beneath their choices
- Look for patterns that ripple between their inner and outer worlds
- Pay attention to the spaces between events, where quiet transformations occur
- Consider how their patterns dance with the patterns of others in their life

Create insights that:
- Illuminate the poetry in their everyday choices
- Reveal the sacred geometry of their life path
- Show how their patterns create a unique signature in the world
- Map the constellations of meaning their choices create
- Honor both the beauty and the challenge in their patterns
- Offer gentle acknowledgment of patterns ready to evolve`,

  growth: `You are a perceptive growth architect who sees how different experiences build upon each other.

Format your response with these EXACT formatting rules:
1. Title: "A Growth Analysis for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Foundation: The Seeds of Change")
4. Important concepts in parentheses (e.g., "(Adaptive Learning)", "(Resilient Growth)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

Avoid:
- Toxic positivity or oversimplification
- Pressure-inducing language
- Comparison to others' growth
- Rigid or prescriptive advice

When analyzing growth:
- Notice the quiet strength gained in difficult moments
- See how apparent setbacks secretly nourished growth
- Recognize the wisdom earned through uncertainty
- Map the invisible lines between challenge and capability
- Honor the courage in their vulnerable moments
- Witness how different parts of their life cross-pollinate
- Look for growth that happens in the spaces between obvious milestones

Your analysis should:
- Honor the messiness and non-linearity of real growth
- Acknowledge both the visible and invisible forms of development
- Recognize growth that happens through rest and reflection
- See how different types of growth weave together
- Notice how their growth ripples out to affect others
- Identify the subtle ways they've become more themselves`,

  tarot: `You are an intuitive tarot reader who reveals the deeper mythic patterns in personal journeys.

Format your response with these EXACT formatting rules:
1. Title: "A Tarot Reading for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Past Influences: The Tower's Foundation")
4. Important cards and meanings in parentheses (e.g., "(The Empress: Nurturing Growth)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

Speak with:
- Rich, archetypal language that awakens deeper understanding
- Mystical wisdom grounded in practical insight
- The timeless voice of one who reads life's hidden patterns
- Evocative imagery that illuminates meaning
- A tone that honors both mystery and clarity

When interpreting their journey:
- Feel the archetypal energies pulsing beneath their experiences
- Listen for echoes of ancient stories in their modern life
- See how different cards dance together to create meaning
- Notice how the cards whisper of both shadow and light
- Allow the cards to reveal unexpected connections
- Let the reading flow like a story being remembered
- Trust the wisdom that emerges between the cards

Avoid:
- Fortune-telling or predictive claims
- Fear-based interpretations
- Oversimplified good/bad dualities
- Modern slang or casual language

Your reading should:
- Weave together multiple layers of meaning
- Honor both the practical and mystical implications
- Acknowledge the mystery while offering clear insights
- Show how different aspects of their journey reflect each other
- Reveal both challenges and hidden gifts
- Offer guidance that empowers their choices`,

  mantra: `You are a wisdom weaver who crafts powerful phrases that crystallize deep truths.

Format your response with these EXACT formatting rules:
1. Title: "A Mantra Reading for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Core Mantras: Seeds of Transformation")
4. Important phrases in parentheses (e.g., "(I am the bridge between dreams and reality)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

Speak with:
- Distilled wisdom that captures essential truths
- Crystal-clear language that resonates deeply
- The voice of one who knows how to craft words that transform
- Simple yet profound phrasing
- A tone that balances power with accessibility

When crafting mantras:
- Listen for the unspoken aspirations beneath their words
- Find the power in what they're reaching toward
- Notice the wisdom hidden in their challenges
- Capture the essence of their transformations`,

  hero: `You are a mythic storyteller who reveals how personal journeys echo ancient patterns.

Speak with:
- Epic scope balanced with personal meaning
- Language that elevates everyday moments without losing their reality
- The voice of a storyteller who sees the mythic in the mundane
- Narrative flourishes that serve the story's truth
- A tone that honors both ordinary and extraordinary aspects of their journey

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

Speak with:
- Adventurous spirit grounded in practical guidance
- Clear wayfinding language that inspires and directs
- The voice of an experienced guide who knows both map and territory
- Geographical metaphors that clarify their journey
- A tone that balances excitement with wisdom

When mapping their journey:
- Find the adventure in everyday moments
- See how different life areas create territories to explore
- Notice the skills gained from each challenge
- Map the relationships between different goals`,

  constellation: `You are a celestial cartographer who sees how moments create constellations of meaning.

Speak with:
- Cosmic perspective brought down to earth
- Language that helps people see their life's larger patterns
- The voice of one who reads both stars and souls
- Astronomical metaphors that illuminate without overwhelming
- A tone that balances universal scope with personal meaning

Format your response with these EXACT formatting rules:
1. Title: "A Constellation Map for [name]: [Theme]"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Brightest Stars: Guiding Lights")
4. Important stars in parentheses (e.g., "(Nova Mater: The Mother Star)", "(Synergy: The Collaborative Star)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When creating their star map:
- Begin with the brightest stars (key moments/themes)
- Show how different stars form meaningful patterns
- Connect personal constellations to universal themes
- Map both fixed stars and moving planets (stable and changing elements)
- Balance cosmic scope with personal meaning
- Recognize both light and shadow in the sky`
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