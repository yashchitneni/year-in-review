import { NextResponse } from 'next/server';
import { analyzeWithGemini, type AnalysisFramework } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { formData, framework } = await request.json();

    if (!formData || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await analyzeWithGemini({
      formData,
      framework: framework as AnalysisFramework
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 429 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 