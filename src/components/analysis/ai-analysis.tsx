"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Wand2, Key, ChevronDown, ChevronUp, ExternalLink, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { AnalysisFramework } from "@/lib/gemini";
import { saveApiKey } from "@/lib/gemini";

const FRAMEWORK_DESCRIPTIONS = {
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
  tarot: {
    title: "Tarot Journey",
    description: "Illuminates the archetypal forces and mythic patterns at play in your personal journey",
    emoji: "🔮"
  },
  mantra: {
    title: "Manifestation Mantras",
    description: "Crafts powerful phrases that crystallize your deep truths and future possibilities",
    emoji: "✨"
  },
  hero: {
    title: "Hero's Journey",
    description: "Transforms your experiences into an epic narrative that reveals deeper meaning and purpose",
    emoji: "📚"
  },
  quest: {
    title: "Quest Map",
    description: "Creates an adventure map of your journey, revealing hidden paths and unexpected connections",
    emoji: "🗺️"
  },
  constellation: {
    title: "Constellation Map",
    description: "Maps your experiences into celestial patterns, revealing the cosmic dance of your journey",
    emoji: "💫"
  },
  custom: {
    title: "Custom Analysis",
    description: "Create your own analysis framework with a custom prompt",
    emoji: "✏️"
  }
};

export default function AIAnalysis() {
  const [formData] = useAtom(formDataAtom);
  const [selectedFramework, setSelectedFramework] = useState<AnalysisFramework | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    saveApiKey(apiKey.trim());
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
      setShowApiKeyInput(false);
    }, 2000);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    saveApiKey('');
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  const handleAnalyze = async () => {
    if (!selectedFramework) return;
    if (selectedFramework === "custom" && !customPrompt.trim()) {
      setError("Please enter a custom prompt for analysis.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          framework: selectedFramework,
          customPrompt: selectedFramework === "custom" ? customPrompt : undefined
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
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="mt-1 text-blue-500">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">About AI Analysis</h3>
              <p className="text-sm text-blue-700 mb-2">
              Your responses will be analyzed using Google Gemini AI. A community API key is available, 
              but for guaranteed access during busy periods, we recommend using your personal key.
              </p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              >
                {showApiKeyInput ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide API Key Settings
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show API Key Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {showApiKeyInput && (
          <div className="mt-4 pl-8">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-900">Your Gemini API Key</label>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="flex-1 bg-white border-blue-200"
                />
                {apiKey ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={handleSaveApiKey}
                      className="whitespace-nowrap"
                      disabled={showSaveSuccess}
                    >
                      {showSaveSuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Saved!
                        </>
                      ) : (
                        'Save Key'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleClearApiKey}
                      className="whitespace-nowrap text-red-600 hover:text-red-700"
                    >
                      Clear
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowApiKeyInput(false)}
                    className="whitespace-nowrap"
                  >
                    Use Shared Key
                  </Button>
                )}
              </div>
              <p className="text-xs text-blue-600">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(FRAMEWORK_DESCRIPTIONS) as [AnalysisFramework, typeof FRAMEWORK_DESCRIPTIONS[keyof typeof FRAMEWORK_DESCRIPTIONS]][]).map(([framework, { title, description, emoji }]) => (
          <Card
            key={framework}
            className={`p-4 cursor-pointer hover:border-primary transition-colors ${
              selectedFramework === framework ? "border-primary" : ""
            }`}
            onClick={() => {
              setSelectedFramework(framework);
              setError(null);
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{emoji}</span>
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </Card>
        ))}
      </div>

      {selectedFramework === "custom" && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Custom Prompt</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Write your own prompt for analyzing your year review. You'll have access to all your responses in pastYear and yearAhead sections.
          </p>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Example: Analyze my year and identify the key themes, challenges, and opportunities. What patterns emerge from my responses?"
            className="min-h-[150px] mb-2"
          />
          <div className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Be specific about what insights you're looking for. The more detailed your prompt, the better the analysis.
          </div>
        </Card>
      )}

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
              {selectedFramework === "custom" ? (
                <Wand2 className="mr-2 h-4 w-4" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
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
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">
              {FRAMEWORK_DESCRIPTIONS[selectedFramework!].emoji}
            </span>
            <h3 className="text-xl font-semibold">
              {FRAMEWORK_DESCRIPTIONS[selectedFramework!].title} Results
            </h3>
          </div>
          <div className="prose max-w-none">
            {analysis}
          </div>
        </Card>
      )}
    </div>
  );
} 