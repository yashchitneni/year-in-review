import type { AnalysisFramework } from "@/lib/gemini";
import type { SecureEncryption } from "@/lib/secure-encryption";

export type CheckInFrequency = "monthly" | "quarterly";

export interface Subscription {
  id: string;
  email: string;
  frequency: "monthly" | "quarterly";
  frameworks: string[];
  lastCheckIn: string | null;
  nextCheckIn: string;
  createdAt: string;
  status: "active" | "paused" | "cancelled";
  responses: any; // This will be SecureEncryption type when encrypted
  lastContentGeneration?: string | null;
}

export interface SubscriptionRequest {
  email: string;
  frequency: CheckInFrequency;
  frameworks: AnalysisFramework[];
  responses: SecureEncryption;
} 