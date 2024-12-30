export type CheckInFrequency = 'monthly' | 'quarterly';

export interface Subscription {
  email: string;
  frequency: CheckInFrequency;
  createdAt: string;
  status: 'active' | 'paused' | 'unsubscribed';
  lastCheckIn: string | null;
}

export interface SubscriptionPreferences {
  emailFormat: 'html' | 'text';
  timezone: string;
  reminderTypes: ('goals' | 'milestones' | 'insights')[];
}

export interface CheckInContent {
  type: CheckInFrequency;
  content: string;
  generatedAt: string;
  goals: string[];
  insights: string[];
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  error?: string;
} 