"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Wand2, Key, ChevronDown, ChevronUp, ExternalLink, Check, X, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { AnalysisFramework } from "@/lib/gemini";
import { saveApiKey } from "@/lib/gemini";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

// Framework-specific styles
const FRAMEWORK_STYLES = {
  pattern: {
    gradient: "bg-gradient-to-br from-rose-50 to-rose-100",
    accent: "text-rose-600",
    border: "border-rose-200",
    icon: "🎯 bg-rose-100"
  },
  growth: {
    gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    accent: "text-emerald-600",
    border: "border-emerald-200",
    icon: "🌱 bg-emerald-100"
  },
  tarot: {
    gradient: "bg-gradient-to-br from-purple-50 to-purple-100",
    accent: "text-purple-600",
    border: "border-purple-200",
    icon: "🔮 bg-purple-100"
  },
  mantra: {
    gradient: "bg-gradient-to-br from-amber-50 to-amber-100",
    accent: "text-amber-600",
    border: "border-amber-200",
    icon: "✨ bg-amber-100"
  },
  hero: {
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    accent: "text-blue-600",
    border: "border-blue-200",
    icon: "⚔️ bg-blue-100"
  },
  quest: {
    gradient: "bg-gradient-to-br from-teal-50 to-teal-100",
    accent: "text-teal-600",
    border: "border-teal-200",
    icon: "🗺️ bg-teal-100"
  },
  constellation: {
    gradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    accent: "text-indigo-600",
    border: "border-indigo-200",
    icon: "✨ bg-indigo-100"
  },
  custom: {
    gradient: "bg-gradient-to-br from-gray-50 to-gray-100",
    accent: "text-gray-600",
    border: "border-gray-200",
    icon: "✏️ bg-gray-100"
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
  const [hasAttemptedAnalysis, setHasAttemptedAnalysis] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // Load saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      try {
        console.log('Saving API key...');
        saveApiKey(trimmedKey);
        setShowSaveSuccess(true);
        setError(null);
        
        // Verify the key was saved
        const savedKey = localStorage.getItem('gemini_api_key');
        console.log('API Key saved status:', {
          keySaved: !!savedKey,
          keyMatches: savedKey === trimmedKey
        });

        setTimeout(() => {
          setShowSaveSuccess(false);
          setShowApiKeyInput(false);
        }, 2000);
      } catch (error) {
        console.error('Error saving API key:', error);
        setError("Failed to save API key. Please try again.");
      }
    } else {
      setError("Please enter a valid API key");
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    saveApiKey('');
    setShowSaveSuccess(true);
    setError(null); // Clear any existing errors
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  // Add state for cached results
  const [cachedResults, setCachedResults] = useState<Record<AnalysisFramework, string | null>>({
    pattern: null,
    growth: null,
    tarot: null,
    mantra: null,
    hero: null,
    quest: null,
    constellation: null,
    custom: null
  });

  const handleAnalyze = async () => {
    if (!selectedFramework) return;
    if (selectedFramework === "custom" && !customPrompt.trim()) {
      setError("Please enter a custom prompt for analysis.");
      return;
    }

    // Check if we have any responses to analyze
    if (!formData.pastYear.calendarReview && !formData.yearAhead.dreamBig) {
      setError("Please fill out some responses before analyzing.");
      return;
    }

    // If we have a cached result and not forcing refresh, use it
    if (cachedResults[selectedFramework] && !isLoading) {
      setAnalysis(cachedResults[selectedFramework]);
      setIsResultOpen(true);
      return;
    }

    setHasAttemptedAnalysis(true);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Get the current API key
      const currentApiKey = localStorage.getItem('gemini_api_key');
      
      console.log('Starting analysis...', {
        framework: selectedFramework,
        hasCustomPrompt: !!customPrompt,
        hasApiKey: !!currentApiKey,
        hasResponses: {
          pastYear: !!formData.pastYear,
          yearAhead: !!formData.yearAhead
        }
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": currentApiKey || ''
        },
        body: JSON.stringify({
          formData,
          framework: selectedFramework,
          customPrompt: selectedFramework === "custom" ? customPrompt : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Analysis failed:', data);
        throw new Error(data.error || "Failed to analyze");
      }

      setAnalysis(data.analysis);
      // Cache the result
      setCachedResults(prev => ({
        ...prev,
        [selectedFramework]: data.analysis
      }));
      setHasAttemptedAnalysis(false);
      setIsResultOpen(true);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to force a new analysis
  const handleRefreshAnalysis = async () => {
    if (!selectedFramework) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const currentApiKey = localStorage.getItem('gemini_api_key');
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": currentApiKey || ''
        },
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
      // Update cache with new result
      setCachedResults(prev => ({
        ...prev,
        [selectedFramework]: data.analysis
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // Helper function to format titles and special terms
    const formatSpecialTerms = (line: string) => {
      // Replace <strong>text</strong> patterns
      line = line.replace(/<\/?strong>/g, '**');
      
      // Handle special terms in parentheses and asterisks
      return line.split(/(\*\*[^*]+\*\*|\([^)]+\))/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={i} className={`font-semibold ${selectedFramework && FRAMEWORK_STYLES[selectedFramework].accent}`}>
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith('(') && part.endsWith(')')) {
          return (
            <span key={i} className={`font-semibold ${selectedFramework && FRAMEWORK_STYLES[selectedFramework].accent}`}>
              {part}
            </span>
          );
        }
        return part;
      });
    };

    return text
      .split('\n')
      .map((line, i) => {
        // Clean the line of any HTML tags first
        line = line.replace(/<\/?[^>]+(>|$)/g, '');
        
        // Main title (e.g., "A Tarot Reading for Yash: The Architect of Serendipity")
        if (line.includes("A Tarot Reading for") || line.includes("A Pattern Analysis for")) {
          return (
            <h1 key={i} className="text-3xl font-bold mb-6">
              {formatSpecialTerms(line)}
            </h1>
          );
        }

        // Section headers with colons (e.g., "Past Influences: The Sower and the Harvest")
        if (line.match(/^[^:]+:[^:]+$/)) {
          const [title, subtitle] = line.split(':').map(s => s.trim());
          return (
            <h2 key={i} className={`text-2xl font-bold mt-8 mb-4 ${selectedFramework && FRAMEWORK_STYLES[selectedFramework].accent}`}>
              {formatSpecialTerms(title)}
              {subtitle && (
                <span className="text-gray-600 font-normal ml-2">
                  : {formatSpecialTerms(subtitle)}
                </span>
              )}
            </h2>
          );
        }

        // Regular paragraphs with special term formatting
        if (line.trim()) {
          return (
            <p key={i} className="my-4 leading-relaxed">
              {formatSpecialTerms(line)}
            </p>
          );
        }

        return null;
      })
      .filter(Boolean);
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
                Your responses will be analyzed using Google Gemini AI. A shared API key is available for everyone to use. 
                For guaranteed access during high-traffic periods, you can optionally use your own API key.
              </p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              >
                {showApiKeyInput ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Optional API Key Settings
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Use Your Own API Key (Optional)
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
                <label className="text-sm font-medium text-blue-900">Your Personal API Key (Optional)</label>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Get Your Own Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your personal Gemini API key (optional)"
                  className="flex-1 bg-white border-blue-200"
                />
                <Button 
                  onClick={handleSaveApiKey} 
                  variant="secondary"
                  className="shrink-0"
                >
                  Save Key
                </Button>
                {apiKey && (
                  <Button 
                    onClick={handleClearApiKey}
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-xs text-blue-600">
                Your API key is stored locally and never sent to our servers.
                {!apiKey && " The shared API key will be used by default."}
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

      {error && hasAttemptedAnalysis && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <Dialog open={isResultOpen && !!analysis} onOpenChange={setIsResultOpen}>
        <DialogContent className={cn(
          "max-w-3xl max-h-[80vh] overflow-y-auto",
          selectedFramework && FRAMEWORK_STYLES[selectedFramework].gradient,
          selectedFramework && FRAMEWORK_STYLES[selectedFramework].border
        )}>
          <button
            onClick={() => setIsResultOpen(false)}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                selectedFramework && FRAMEWORK_STYLES[selectedFramework].icon
              )}>
                {selectedFramework && FRAMEWORK_DESCRIPTIONS[selectedFramework].emoji}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {selectedFramework && FRAMEWORK_DESCRIPTIONS[selectedFramework].title} Results
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedFramework && FRAMEWORK_DESCRIPTIONS[selectedFramework].description}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <div className={cn(
            "mt-6 prose prose-slate max-w-none",
            selectedFramework && `prose-headings:${FRAMEWORK_STYLES[selectedFramework].accent}`
          )}>
            {analysis && formatAnalysis(analysis)}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Analysis generated by Google Gemini AI
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefreshAnalysis}
                disabled={isLoading}
                className="px-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Analysis
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsResultOpen(false)}
                className="px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 