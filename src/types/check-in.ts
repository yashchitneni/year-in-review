import type { AnalysisFramework } from "@/lib/gemini";
import type { SecureEncryption } from "@/lib/secure-encryption";

export type CheckInFrequency = "daily" | "monthly" | "quarterly";
export type AnalysisDepth = "comprehensive" | "focused" | "maintenance";

export interface Subscription {
  id: string;
  email: string;
  frequency: CheckInFrequency;
  frameworks: string[];
  lastCheckIn: string | null;
  nextCheckIn: string;
  createdAt: string;
  status: "active" | "paused" | "cancelled";
  responses: any; // This will be SecureEncryption type when encrypted
  lastContentGeneration?: string | null;
  analysisDepth: AnalysisDepth;
}

export interface SubscriptionRequest {
  email: string;
  frequency: CheckInFrequency;
  frameworks: AnalysisFramework[];
  responses: SecureEncryption;
} 