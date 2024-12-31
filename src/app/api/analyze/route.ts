import { NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, framework, customPrompt, userName } = body;
    const apiKey = request.headers.get('x-gemini-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const result = await analyzeWithGemini({
      formData,
      framework,
      customPrompt,
      apiKey,
      userName
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ analysis: result.analysis });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 