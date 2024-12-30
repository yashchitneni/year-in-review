"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import type { AnalysisFramework } from "@/lib/gemini";

interface SubscriptionFormProps {
  className?: string;
  selectedFrameworks: AnalysisFramework[];
}

export function SubscriptionForm({ className, selectedFrameworks }: SubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInsights, setSelectedInsights] = useState<AnalysisFramework[]>(selectedFrameworks);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/check-ins/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          frequency,
          frameworks: selectedInsights 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set up journey continuation");
      }

      toast({
        title: "Journey continuation set!",
        description: "We'll send you new insights based on your responses.",
        duration: 5000,
      });

      setEmail("");
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFramework = (framework: AnalysisFramework) => {
    setSelectedInsights(prev => 
      prev.includes(framework) 
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    );
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-blue-200 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1 text-blue-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-1">Continue Your Journey</h3>
          <p className="text-sm text-blue-700 mb-4">
            Track your progress and discover new perspectives based on your responses.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-blue-900">Which insights would you like to revisit?</p>
              <div className="grid gap-3">
                {selectedFrameworks.map(framework => (
                  <div key={framework} className="flex items-center space-x-2">
                    <Checkbox 
                      id={framework}
                      checked={selectedInsights.includes(framework)}
                      onCheckedChange={() => toggleFramework(framework)}
                    />
                    <label htmlFor={framework} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {framework.charAt(0).toUpperCase() + framework.slice(1)} Journey
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-blue-900 mb-1.5 block">
                    How often would you like to reflect?
                  </label>
                  <Select
                    value={frequency}
                    onValueChange={setFrequency}
                  >
                    <SelectTrigger className="bg-white border-blue-200">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-blue-900 mb-1.5 block">
                    Where should we send your insights?
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-blue-200"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || selectedInsights.length === 0} 
                className="self-end"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-blue-600">
              You can adjust or stop your reflections at any time.
            </p>
          </form>
        </div>
      </div>
    </Card>
  );
} 