import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type AnalysisFramework = "pattern" | "growth" | "energy";

interface AnalysisRequest {
  formData: any;
  framework: AnalysisFramework;
}

const FRAMEWORK_PROMPTS = {
  pattern: `As an AI analyst reviewing YearCompass responses, analyze the following data for patterns and insights:

Please analyze for:
1. Recurring Themes: Identify 2-3 key themes that appear across different life areas
2. Success Patterns: Highlight behaviors or conditions that led to positive outcomes
3. Challenge Response Patterns: Note patterns in how challenges were approached
4. Hidden Connections: Point out non-obvious links between experiences
5. Growth Indicators: Identify areas showing clear progression`,

  growth: `As an AI growth analyst, examine these YearCompass responses to map the user's development:

Please analyze and provide:
1. Growth Foundation: Key strengths and support systems demonstrated
2. Building Blocks: How different accomplishments built upon each other
3. Support Structures: Most effective people, habits, or systems
4. Growth Catalysts: Key moments or decisions that accelerated development
5. Future Framework: How to build upon this foundation`,

  energy: `As an AI energy pattern analyst, create an energy flow assessment:

Please analyze and map:
1. Energy Sources: Activities, people, and situations that energized
2. Energy Drains: Patterns in what depleted energy
3. Peak Performance: Circumstances for best performance
4. Recovery Patterns: Effective methods for energy replenishment
5. Energy Management: Practical ways to optimize energy use`
};

export async function analyzeWithGemini({ formData, framework }: AnalysisRequest) {
  try {
    // Check rate limit (15 RPM, 1500 RPD)
    const rateLimitResult = await rateLimit();
    if (!rateLimitResult.success) {
      throw new Error("Rate limit exceeded. Please try again later or use your own API key.");
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the data for analysis
    const prompt = FRAMEWORK_PROMPTS[framework];
    const analysisData = {
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
    };

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
    return {
      success: false,
      error: error.message
    };
  }
} 