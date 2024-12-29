"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import type { AnalysisFramework } from "@/lib/gemini";

const FRAMEWORK_DESCRIPTIONS = {
  pattern: "Identifies recurring themes, success patterns, and hidden connections in your responses",
  growth: "Maps your development journey, highlighting strengths, catalysts, and future potential",
  energy: "Analyzes your energy patterns, peak performance conditions, and optimization strategies"
};

export default function AIAnalysis() {
  const [formData] = useAtom(formDataAtom);
  const [selectedFramework, setSelectedFramework] = useState<AnalysisFramework | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFramework) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          framework: selectedFramework
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(FRAMEWORK_DESCRIPTIONS) as AnalysisFramework[]).map((framework) => (
          <Card
            key={framework}
            className={`p-4 cursor-pointer hover:border-primary transition-colors ${
              selectedFramework === framework ? "border-primary" : ""
            }`}
            onClick={() => setSelectedFramework(framework)}
          >
            <h3 className="text-lg font-semibold capitalize mb-2">{framework} Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {FRAMEWORK_DESCRIPTIONS[framework]}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleAnalyze}
          disabled={!selectedFramework || isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {analysis && (
        <Card className="p-6 whitespace-pre-wrap">
          <h3 className="text-xl font-semibold mb-4 capitalize">
            {selectedFramework} Analysis Results
          </h3>
          <div className="prose max-w-none">
            {analysis}
          </div>
        </Card>
      )}
    </div>
  );
} 