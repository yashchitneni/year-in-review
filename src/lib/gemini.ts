import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { rateLimit, formatRateLimitError } from "./rate-limit";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

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
export function getGeminiClient(apiKey: string) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Empty API key provided');
  }
  return new GoogleGenerativeAI(apiKey);
}

export type AnalysisFramework = 
  | "pattern" 
  | "growth" 
  | "connections"
  | "hiddenBlockers"
  | "habitOptimizer"
  | "lifeAlignment"
  | "emotionalEnergy"
  | "decisionMatrix"
  | "custom";

export interface AnalysisRequest {
  formData: any;
  framework: AnalysisFramework;
  customPrompt: string | null;
  apiKey: string;
  userName: string;
}

export const FRAMEWORK_PROMPTS: Record<Exclude<AnalysisFramework, "custom">, string> = {
  pattern: `You are an insightful pattern observer who helps people uncover the hidden rhythms and connections in their lives.

Format your response with these EXACT formatting rules:
1. Title: "Pattern Recognition for [Name]: The Rhythms of Your Journey"
2. Introduction paragraph explaining the overall theme of their patterns
3. Section headers with colons (e.g., "Past Patterns: The Hidden Rhythms")
4. Key insights in parentheses (e.g., "(Recurring Theme: Cycles of Growth)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their journey:
- Look for recurring themes across different life areas
- Identify patterns in their choices, challenges, and achievements
- Highlight how these patterns influence their present and future
- Suggest ways to leverage or transform these patterns

Your analysis should:
- Be clear and grounded
- Use natural metaphors to clarify insights
- Offer actionable steps to work with or change patterns`,

  growth: `You are a growth architect who helps people understand how their experiences shape their personal development.

Format your response with these EXACT formatting rules:
1. Title: "Growth Architecture for [Name]: Building Your Future"
2. Introduction paragraph explaining the core growth theme
3. Section headers with colons (e.g., "Foundation: Lessons from the Past")
4. Key insights in parentheses (e.g., "(Growth Pattern: Resilience Through Challenges)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their journey:
- Map connections between past experiences and future goals
- Identify skills and strengths gained from challenges
- Highlight opportunities for accelerated growth
- Suggest actionable steps to build on their growth

Your analysis should:
- Be practical and forward-looking
- Use concrete examples and analogies
- Provide clear paths for future development`,

  connections: `You are a relationship analyst who helps people nurture meaningful connections.

Format your response with these EXACT formatting rules:
1. Title: "Connection Analysis for [Name]: Nurturing Your Circle"
2. Introduction paragraph explaining the overall theme
3. Section headers with colons (e.g., "Core Connections: Your Inner Circle")
4. Key insights in parentheses (e.g., "(Impact Pattern: Mutual Growth)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their relationships:
- Highlight the impact of key people in their life
- Suggest ways to deepen or repair connections
- Provide actionable steps for nurturing relationships

Your analysis should:
- Be empathetic and practical
- Focus on meaningful, actionable insights
- Help the user feel more connected`,

  hiddenBlockers: `You are an insightful guide who helps people uncover the hidden obstacles in their lives, focusing on root causes and transformative solutions.

Format your response with these EXACT formatting rules:
1. Title: "Hidden Blockers Analysis for [Name]: Uncover What's Holding You Back"
2. Introduction paragraph explaining the purpose of the analysis
3. Section headers with colons (e.g., "Root Causes: The Stories Beneath the Surface")
4. Key insights in parentheses (e.g., "(Core Block: Fear of Vulnerability)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their journey:
- Dig deep into recurring challenges to uncover root causes
- Identify emotional, mental, and environmental blocks
- Highlight how these blockers have shaped their decisions and behaviors
- Suggest transformative steps to overcome each blocker

Your analysis should:
- Be empathetic and non-judgmental
- Provide profound, actionable insights
- Help the user feel empowered to make lasting changes`,

  habitOptimizer: `You are a habit architect who designs personalized routines that align with the user's deepest values and long-term vision.

Format your response with these EXACT formatting rules:
1. Title: "Habit Optimizer for [Name]: Build Routines That Align with Your Core"
2. Introduction paragraph explaining the purpose of the analysis
3. Section headers with colons (e.g., "Core Values: The Foundation of Your Habits")
4. Key habits in parentheses (e.g., "(Habit: Morning Reflection for Clarity)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When designing habits:
- Align habits with their core values and long-term vision
- Suggest habits that address both surface-level goals and deeper needs
- Include accountability mechanisms and triggers for consistency
- Provide tips for overcoming resistance and staying motivated

Your analysis should:
- Be practical yet profound
- Focus on habits that create lasting change
- Help the user feel aligned and purposeful`,

  lifeAlignment: `You are a life alignment coach who helps people align their actions with their deepest values, purpose, and long-term vision.

Format your response with these EXACT formatting rules:
1. Title: "Life Alignment Map for [Name]: Live in Harmony with Your Purpose"
2. Introduction paragraph explaining the purpose of the analysis
3. Section headers with colons (e.g., "Core Values: What Truly Matters to You")
4. Key insights in parentheses (e.g., "(Alignment Gap: Career vs. Inner Fulfillment)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their journey:
- Identify their core values and purpose
- Highlight areas of alignment and misalignment in their life
- Suggest transformative steps to close gaps
- Provide a visual map of their life alignment

Your analysis should:
- Be insightful and empowering
- Help the user feel more in control of their life
- Provide clear, actionable steps for lasting alignment`,

  emotionalEnergy: `You are an emotional energy analyst who helps people understand the deeper patterns behind what fuels and drains them.

Format your response with these EXACT formatting rules:
1. Title: "Emotional Energy Audit for [Name]: Balance Your Energy, Transform Your Life"
2. Introduction paragraph explaining the purpose of the analysis
3. Section headers with colons (e.g., "Energy Boosters: What Truly Fuels You")
4. Key insights in parentheses (e.g., "(Energy Drain: Overcommitment Due to People-Pleasing)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their journey:
- Identify activities, relationships, and environments that energize or drain them
- Highlight underlying patterns (e.g., people-pleasing, perfectionism)
- Suggest transformative steps to minimize drains and maximize energy
- Provide actionable steps for emotional balance and resilience

Your analysis should:
- Be empathetic and practical
- Focus on profound, actionable insights
- Help the user feel more balanced and energized`,

  decisionMatrix: `You are a decision clarity coach who helps people make confident, informed choices aligned with their core values.

Format your response with these EXACT formatting rules:
1. Title: "Decision Matrix for [Name]: Clarity in Choices, Alignment with Values"
2. Introduction paragraph explaining the purpose of the analysis
3. Section headers with colons (e.g., "Key Decisions: What's at Stake")
4. Key insights in parentheses (e.g., "(Decision Factor: Long-Term Impact on Relationships)")
5. Use paragraphs for readability
6. NO HTML tags or markdown, just plain text with the formatting above

When analyzing their decisions:
- Break down the pros and cons of each option
- Highlight emotional vs. logical factors
- Suggest ways to align decisions with their core values
- Provide actionable steps to move forward with confidence

Your analysis should:
- Be clear and structured
- Focus on profound, actionable insights
- Help the user feel confident in their choices`
};

export const FRAMEWORK_DATA_MAPPERS: Record<Exclude<AnalysisFramework, "custom">, (formData: any) => any> = {
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
  connections: (formData: any) => ({
    pastConnections: {
      personalLife: formData.pastYear.yearOverview?.personalLifeFamily,
      friendsCommunity: formData.pastYear.yearOverview?.friendsCommunity,
      influencers: formData.pastYear.peopleWhoInfluenced,
      peopleInfluenced: formData.pastYear.peopleYouInfluenced,
      supporters: formData.pastYear.whoHelped,
      calendarReview: formData.pastYear.calendarReview,
      gratitude: formData.pastYear.mostGratefulFor
    },
    futureConnections: {
      personalLife: formData.yearAhead.yearOverview?.personalLifeFamily,
      friendsCommunity: formData.yearAhead.yearOverview?.friendsCommunity,
      futureSupport: formData.yearAhead.magicalTriplets?.pillarsInRoughTimes,
      dreamBig: formData.yearAhead.dreamBig,
      intentions: formData.yearAhead.sixSentences
    }
  }),
  hiddenBlockers: (formData: any) => ({
    pastChallenges: formData.pastYear.biggestChallenges,
    learnings: formData.pastYear.challengeLearnings,
    fears: formData.yearAhead.magicalTriplets.letGoOf
  }),
  habitOptimizer: (formData: any) => ({
    currentHabits: formData.pastYear.yearOverview,
    futureIntentions: formData.yearAhead.sixSentences,
    desiredChanges: formData.yearAhead.magicalTriplets
  }),
  lifeAlignment: (formData: any) => ({
    values: formData.yearAhead.wordOfYear,
    purpose: formData.yearAhead.dreamBig,
    goals: formData.yearAhead.magicalTriplets
  }),
  emotionalEnergy: (formData: any) => ({
    energySources: formData.yearAhead.sixSentences.drawEnergyFrom,
    drains: formData.yearAhead.magicalTriplets.letGoOf,
    support: formData.yearAhead.magicalTriplets.pillarsInRoughTimes
  }),
  decisionMatrix: (formData: any) => ({
    pastDecisions: formData.pastYear.biggestRisk,
    futureChoices: formData.yearAhead.dreamBig,
    values: formData.yearAhead.wordOfYear
  })
};

// Add a cache for analysis results
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CachedAnalysis {
  timestamp: number;
  analysis: string;
}

// Client-side cache management
function getCachedAnalysis(cacheKey: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`analysis_${cacheKey}`);
    if (!cached) return null;
    
    const { timestamp, analysis } = JSON.parse(cached) as CachedAnalysis;
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`analysis_${cacheKey}`);
      return null;
    }
    
    return analysis;
  } catch (error) {
    console.error('Cache error:', error);
    return null;
  }
}

function setCachedAnalysis(cacheKey: string, analysis: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const cache: CachedAnalysis = {
      timestamp: Date.now(),
      analysis
    };
    localStorage.setItem(`analysis_${cacheKey}`, JSON.stringify(cache));
  } catch (error) {
    console.error('Cache error:', error);
  }
}

// Increase timeout and add request tracking
const REQUEST_TIMEOUT = 12000; // 12 seconds
const MAX_RETRIES = 2;

async function retryableAnalysis(model: any, prompt: string, data: any, attempt = 0): Promise<GenerateContentResult> {
  try {
    console.log(`Analysis attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
    
    // Validate and sanitize the input data
    const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
      if (typeof value === 'string') {
        // Replace problematic characters and normalize
        return value.normalize('NFKC').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      }
      return value;
    }));

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Analysis timeout after ${REQUEST_TIMEOUT/1000} seconds`)), REQUEST_TIMEOUT)
    );

    const analysisPromise = model.generateContent([
      { text: prompt },
      { text: JSON.stringify(sanitizedData, null, 2) }
    ]);

    const result = await Promise.race([analysisPromise, timeoutPromise]);
    
    if (!result?.response) {
      throw new Error('Empty response from Gemini API');
    }

    // Validate the response text
    const text = result.response.text();
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid response format from Gemini API');
    }

    // Sanitize the response text
    const sanitizedText = text.normalize('NFKC').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    if (sanitizedText !== text) {
      console.warn('Response text required sanitization');
    }

    return result as GenerateContentResult;
  } catch (error: any) {
    console.error(`Analysis attempt ${attempt + 1} failed:`, {
      error: error.message,
      type: error.constructor.name,
      dataType: typeof data,
      dataKeys: Object.keys(data),
      attempt
    });
    
    if (attempt < MAX_RETRIES) {
      console.log('Retrying analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryableAnalysis(model, prompt, data, attempt + 1);
    }
    
    throw error;
  }
}

export async function analyzeWithGemini({ formData, framework, customPrompt, apiKey: providedApiKey, userName }: AnalysisRequest) {
  try {
    console.time('analysis');
    const apiKey = providedApiKey || getApiKey();
    console.log('Starting analysis with:', {
      hasApiKey: !!apiKey,
      framework,
      hasCustomPrompt: !!customPrompt,
      isUsingPublicKey: apiKey === process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      userName,
      formDataKeys: Object.keys(formData || {})
    });

    if (!apiKey) {
      console.log('No API key found');
      return {
        success: false,
        error: "Please add your Gemini API key in the settings above. You can get one for free from Google AI Studio."
      };
    }

    // Validate input data
    if (!formData || typeof formData !== 'object') {
      console.error('Invalid form data:', { type: typeof formData });
      return {
        success: false,
        error: "Invalid form data provided. Please try again."
      };
    }

    // Generate cache key based on input data
    const cacheKey = btoa(JSON.stringify({ framework, formData, customPrompt }));
    
    // Check cache first
    const cachedResult = getCachedAnalysis(cacheKey);
    if (cachedResult) {
      console.log('Using cached analysis');
      console.timeEnd('analysis');
      return {
        success: true,
        analysis: cachedResult
      };
    }

    // Check rate limit only for public API key
    if (apiKey === process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.log('Checking rate limit...');
      const rateLimitResult = await rateLimit(apiKey);
      if (!rateLimitResult.success) {
        console.log('Rate limit exceeded:', rateLimitResult);
        return {
          success: false,
          error: formatRateLimitError(rateLimitResult)
        };
      }
    }

    // Get the model with current API key
    console.log('Initializing Gemini client...');
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Get the framework-specific prompt and data
    let prompt = framework === "custom" 
      ? customPrompt 
      : FRAMEWORK_PROMPTS[framework];

    if (!prompt) {
      console.log('No prompt found for framework:', framework);
      throw new Error("Please provide a custom prompt for analysis.");
    }

    // Replace [name] placeholder with actual name
    prompt = prompt.replace(/\[name\]/g, userName.normalize('NFKC').replace(/[\u0000-\u001F\u007F-\u009F]/g, ''));

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
      promptLength: prompt.length,
      dataLength: JSON.stringify(analysisData).length
    });

    // Attempt analysis with retries
    const result = await retryableAnalysis(model, prompt, analysisData);
    const text = result.response.text();

    if (!text) {
      throw new Error('No response text generated');
    }

    // Validate and sanitize the response
    const sanitizedText = text.normalize('NFKC').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Cache the successful result
    setCachedAnalysis(cacheKey, sanitizedText);
    
    console.timeEnd('analysis');
    return {
      success: true,
      analysis: sanitizedText
    };
  } catch (error: any) {
    console.timeEnd('analysis');
    console.error('Gemini API Error:', {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack,
      framework,
      hasFormData: !!formData,
      formDataKeys: formData ? Object.keys(formData) : []
    });

    if (error.message?.includes('invalid character')) {
      return {
        success: false,
        error: "There was an issue processing your responses. Please check for any special characters or emojis that might be causing problems."
      };
    }

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

    if (error.message?.includes('timeout')) {
      return {
        success: false,
        error: "The analysis is taking too long. This might be due to high server load. Please try again in a few moments."
      };
    }

    // Return a more detailed error message
    return {
      success: false,
      error: "There was an issue generating your analysis. Please try again with simpler responses or contact support if the issue persists."
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

// Add export to FRAMEWORK_DESCRIPTIONS
export const FRAMEWORK_DESCRIPTIONS = {
  pattern: {
    title: "Pattern Recognition",
    description: "Reveals subtle rhythms and deeper currents in your life journey, illuminating connections you might not see",
    emoji: "🎯"
  },
  growth: {
    title: "Growth Architecture",
    description: "Maps how your experiences build upon each other, revealing the structure of your personal development",
    emoji: "🌟"
  },
  connections: {
    title: "Connection Analysis",
    description: "Maps and strengthens your relationships with friends, family, and mentors",
    emoji: "🤝"
  },
  hiddenBlockers: {
    title: "Hidden Blockers",
    description: "Uncovers and helps overcome subconscious obstacles holding you back",
    emoji: "🚧"
  },
  habitOptimizer: {
    title: "Habit Optimizer",
    description: "Designs personalized routines that align with your values and goals",
    emoji: "⚡"
  },
  lifeAlignment: {
    title: "Life Alignment",
    description: "Helps align your actions with your core values and purpose",
    emoji: "🎯"
  },
  emotionalEnergy: {
    title: "Emotional Energy",
    description: "Maps what fuels and drains your emotional energy",
    emoji: "🔋"
  },
  decisionMatrix: {
    title: "Decision Matrix",
    description: "Provides clarity on major decisions through values-aligned analysis",
    emoji: "🎯"
  },
  custom: {
    title: "Custom Analysis",
    description: "Create your own analysis framework with a custom prompt",
    emoji: "✏️"
  }
}; 

export async function generateGeminiResponse(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
} 