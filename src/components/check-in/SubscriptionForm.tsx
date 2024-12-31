"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { AnalysisFramework } from "@/lib/gemini";
import { FRAMEWORK_DESCRIPTIONS } from "@/lib/gemini";
import { generateEncryptionKey, encryptSecurely } from "@/lib/secure-encryption";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubscriptionFormProps {
  className?: string;
  selectedFrameworks: AnalysisFramework[];
}

export function SubscriptionForm({ className, selectedFrameworks }: SubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "quarterly">("monthly");
  const [selectedInsights, setSelectedInsights] = useState<AnalysisFramework[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData] = useAtom(formDataAtom);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [sharedInsights, setSharedInsights] = useState<{[key: string]: string[]}>({});
  const [showInsightPreview, setShowInsightPreview] = useState(false);

  // Generate encryption key when component mounts
  useEffect(() => {
    async function initializeKey() {
      const key = await generateEncryptionKey();
      setEncryptionKey(key);
    }
    initializeKey();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!encryptionKey) {
      toast({
        title: "Error",
        description: "Encryption key not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (selectedInsights.length === 0) {
      toast({
        title: "Select frameworks",
        description: "Please select at least one framework to receive insights.",
        variant: "destructive"
      });
      return;
    }

    // Validate that selected frameworks have insights
    const missingInsights = selectedInsights.filter(
      framework => !sharedInsights[framework] || sharedInsights[framework].length === 0
    );
    
    if (missingInsights.length > 0) {
      toast({
        title: "Missing insights",
        description: `No insights found for: ${missingInsights.map(f => FRAMEWORK_DESCRIPTIONS[f].title).join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Encrypt full responses
      const allData = {
        responses: {
          pastYear: formData.pastYear,
          yearAhead: formData.yearAhead,
          closing: formData.closing
        },
        frameworks: selectedInsights
      };

      const encryptedData = await encryptSecurely(allData, encryptionKey);

      const response = await fetch("/api/check-ins/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          frequency,
          frameworks: selectedInsights,
          responses: encryptedData
        })
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      toast({
        title: "Successfully subscribed!",
        description: "You'll receive personalized check-ins based on your preferences.",
      });

      setEmail("");
      setSelectedInsights([]);
      setSharedInsights({});
    } catch (error) {
      toast({
        title: "Failed to subscribe",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract key insights for each selected framework
  const handleFrameworkSelect = (framework: AnalysisFramework, checked: boolean) => {
    if (checked) {
      setSelectedInsights(prev => [...prev, framework]);
      
      // Extract relevant insights based on framework
      let insights: string[] = [];
      switch (framework) {
        case "tarot":
          if (formData.pastYear.calendarReview) {
            insights.push(formData.pastYear.calendarReview);
          }
          if (formData.yearAhead.secretWish) {
            insights.push(formData.yearAhead.secretWish);
          }
          break;
        case "pattern":
          if (formData.pastYear.biggestSurprise) {
            insights.push(formData.pastYear.biggestSurprise);
          }
          if (formData.pastYear.biggestCompletion) {
            insights.push(formData.pastYear.biggestCompletion);
          }
          break;
        case "growth":
          if (formData.yearAhead.sixSentences?.drawEnergyFrom) {
            insights.push(formData.yearAhead.sixSentences.drawEnergyFrom);
          }
          if (formData.yearAhead.sixSentences?.beBravest) {
            insights.push(formData.yearAhead.sixSentences.beBravest);
          }
          break;
        case "mantra":
          if (formData.yearAhead.magicalTriplets?.loveAboutSelf) {
            insights.push(...formData.yearAhead.magicalTriplets.loveAboutSelf.filter(Boolean));
          }
          break;
        // Add other frameworks as needed
      }
      
      const validInsights = insights.filter(Boolean);
      if (validInsights.length === 0) {
        toast({
          title: "No insights found",
          description: `No relevant insights found for ${FRAMEWORK_DESCRIPTIONS[framework].title}. Please fill out the related sections first.`,
          variant: "destructive"
        });
        setSelectedInsights(prev => prev.filter(f => f !== framework));
        return;
      }
      
      setSharedInsights(prev => ({
        ...prev,
        [framework]: validInsights
      }));
    } else {
      setSelectedInsights(prev => prev.filter(f => f !== framework));
      setSharedInsights(prev => {
        const newInsights = { ...prev };
        delete newInsights[framework];
        return newInsights;
      });
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Stay Connected with Check-ins</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Receive personalized insights and reflections based on your YearCompass responses.
            We'll use framework-specific insights to generate meaningful check-ins while keeping your full responses private.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Which insights would you like to revisit?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedFrameworks.map(framework => (
                <label
                  key={framework}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedInsights.includes(framework) && "border-primary bg-muted"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedInsights.includes(framework)}
                    onChange={(e) => handleFrameworkSelect(framework, e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-xl">{FRAMEWORK_DESCRIPTIONS[framework].emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{FRAMEWORK_DESCRIPTIONS[framework].title}</div>
                    <div className="text-xs text-muted-foreground">
                      {sharedInsights[framework]?.length > 0 ? 
                        `${sharedInsights[framework].length} insights will be used for personalization` :
                        "Select to share relevant insights"
                      }
                    </div>
                  </div>
                  {sharedInsights[framework]?.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setShowInsightPreview(true)}
                    >
                      Preview
                    </Button>
                  )}
                </label>
              ))}
            </div>
          </div>

          {showInsightPreview && (
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Insights Preview</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsightPreview(false)}
                >
                  Close
                </Button>
              </div>
              <ScrollArea className="h-[200px]">
                {Object.entries(sharedInsights).map(([framework, insights]) => (
                  <div key={framework} className="mb-4">
                    <h5 className="font-medium mb-2">
                      {FRAMEWORK_DESCRIPTIONS[framework as AnalysisFramework].title}
                    </h5>
                    <ul className="list-disc pl-4 space-y-2">
                      {insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="frequency">
                Check-in Frequency
              </label>
              <Select
                value={frequency}
                onValueChange={(value: "monthly" | "quarterly") => setFrequency(value)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isLoading || selectedInsights.length === 0}>
          {isLoading ? "Subscribing..." : "Subscribe to Check-ins"}
        </Button>
      </form>
    </Card>
  );
} 