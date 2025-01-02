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
import type { AnalysisDepth } from "@/types/check-in";
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData] = useAtom(formDataAtom);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>("comprehensive");

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

    setIsLoading(true);

    try {
      // Encrypt full responses
      const allData = {
        responses: {
          pastYear: formData.pastYear,
          yearAhead: formData.yearAhead,
          closing: formData.closing
        },
        frameworks: ["connections"] // We're focusing on connections framework
      };

      const encryptedData = await encryptSecurely(allData, encryptionKey);

      const response = await fetch("/api/check-ins/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          frequency,
          frameworks: ["connections"],
          responses: encryptedData,
          analysisDepth
        })
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      toast({
        title: "Successfully subscribed!",
        description: "You'll receive personalized connection check-ins based on your preferences.",
      });

      setEmail("");
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

  const CONNECTION_ANALYSIS_TYPES = {
    comprehensive: {
      title: "Comprehensive Connection Review",
      description: "Regular deep dives into your entire relationship landscape",
      features: [
        "Full relationship pattern analysis",
        "Progress on connection goals",
        "New connection opportunities"
      ]
    },
    focused: {
      title: "Key Relationship Focus",
      description: "Targeted analysis of your most important connections",
      features: [
        "Deep dive into primary relationships",
        "Specific action plans",
        "Progress tracking"
      ]
    },
    maintenance: {
      title: "Connection Maintenance",
      description: "Light-touch relationship check-ins",
      features: [
        "Quick relationship status updates",
        "Simple action reminders",
        "Celebration prompts"
      ]
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Stay Connected with Check-ins</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Receive personalized insights and reflections based on your YearCompass journey.
            Choose how you'd like to analyze and track your relationships over time.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Choose your connection analysis style
            </label>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(CONNECTION_ANALYSIS_TYPES).map(([type, config]) => (
                <label
                  key={type}
                  className={cn(
                    "flex flex-col p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                    analysisDepth === type && "border-primary bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="analysisDepth"
                      value={type}
                      checked={analysisDepth === type}
                      onChange={(e) => setAnalysisDepth(e.target.value as AnalysisDepth)}
                      className="h-4 w-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">{config.title}</div>
                      <div className="text-sm text-muted-foreground">{config.description}</div>
                    </div>
                  </div>
                  <ul className="mt-2 ml-7 text-sm text-muted-foreground list-disc">
                    {config.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>
          </div>

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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Subscribing..." : "Subscribe to Check-ins"}
        </Button>
      </form>
    </Card>
  );
} 