import { NextResponse } from 'next/server';
import { getGeminiClient, AnalysisFramework, FRAMEWORK_PROMPTS, FRAMEWORK_DATA_MAPPERS } from '@/lib/gemini';
import { GenerateContentResult } from '@google/generative-ai';

// Set a reasonable timeout
const TIMEOUT_DURATION = 25000; // 25 seconds

// Helper function to timeout a promise
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Analysis timed out')), ms)
    )
  ]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, framework, customPrompt } = body;
    const apiKey = request.headers.get('x-gemini-key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Please add your Gemini API key in the settings above' },
        { status: 400 }
      );
    }

    const client = getGeminiClient(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get the framework-specific prompt and data
    const prompt = framework === 'custom' 
      ? customPrompt 
      : FRAMEWORK_PROMPTS[framework as Exclude<AnalysisFramework, "custom">];

    if (!prompt) {
      console.log('No prompt found for framework:', framework);
      return NextResponse.json(
        { error: 'Please provide a valid framework or custom prompt for analysis.' },
        { status: 400 }
      );
    }

    // Map the data according to the framework
    const analysisData = framework === 'custom'
      ? {
          pastYear: formData.pastYear,
          yearAhead: formData.yearAhead
        }
      : FRAMEWORK_DATA_MAPPERS[framework as Exclude<AnalysisFramework, "custom">](formData);

    try {
      const result = await timeoutPromise(
        model.generateContent([
          prompt,
          JSON.stringify(analysisData, null, 2)
        ]),
        TIMEOUT_DURATION
      ) as GenerateContentResult;

      const text = result.response.text();

      if (!text) {
        throw new Error('No response generated');
      }

      return NextResponse.json({ analysis: text });
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      if (error.message === 'Analysis timed out') {
        return NextResponse.json(
          { error: 'Analysis took too long. Please try again.' },
          { status: 504 }
        );
      }

      // Check for specific error types
      if (error.message?.includes('unregistered callers') || 
          error.message?.includes('API key') ||
          error.message?.includes('consumer identity')) {
        return NextResponse.json(
          { error: "Please check your Gemini API key in the settings above. Make sure it's valid and active." },
          { status: 400 }
        );
      }
      
      if (error.message?.includes('403')) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your API key or try getting a new one from Google AI Studio." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate analysis. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 