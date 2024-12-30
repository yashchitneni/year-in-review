import { NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, framework, customPrompt } = body;

    // Get API key from client's localStorage through a custom header
    const headersList = headers();
    const clientApiKey = headersList.get('x-gemini-key');

    // Add the API key to the analysis request
    const result = await analyzeWithGemini({
      formData,
      framework,
      customPrompt,
      apiKey: clientApiKey // Pass the API key to the function
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 