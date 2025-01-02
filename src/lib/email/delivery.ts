import { Resend } from 'resend';
import type { GeneratedContent } from '../content-generation/pipeline';
import type { Subscription, CheckInFrequency } from '@/types/check-in';
import { generateConnectionEmail, generateTestEmail } from './templates';

// Initialize Resend with API key
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

// Use verified domain for all environments
const FROM_EMAIL = 'Year In Review <checkins@yash.is>';

export interface EmailDeliveryResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

interface FeaturedConnection {
  name: string;
  context: string;
  suggestedAction: string;
  conversationStarter: string;
}

function selectFeaturedConnections(content: GeneratedContent, frequency: CheckInFrequency): FeaturedConnection[] {
  // For now, we'll just take the first 3 connections
  // TODO: Implement proper rotation and prioritization logic
  const connections: FeaturedConnection[] = [];
  
  // Parse the analysis text to extract connections
  const analysisText = content.analysis || '';
  const sections = analysisText.split('\n\n');
  
  for (const section of sections) {
    if (section.match(/^[A-Za-z]+:/)) {
      const [name] = section.split(':');
      const roleMatch = section.match(/Role\s*:\s*([^\n]+)/);
      const impactMatch = section.match(/Moments of Impact\s*:\s*([^\n]+)/);
      const planMatch = section.match(/Outreach Plan\s*:\s*([^\n]+)/);
      
      if (roleMatch && impactMatch && planMatch) {
        connections.push({
          name: name.trim(),
          context: impactMatch[1],
          suggestedAction: planMatch[1].split('.')[0], // Take first sentence of plan
          conversationStarter: roleMatch[1]
        });
      }
    }
    
    // Limit to 3 connections per email
    if (connections.length === 3) break;
  }
  
  return connections;
}

export async function sendCheckInEmail(
  subscription: Subscription,
  content: GeneratedContent
): Promise<EmailDeliveryResult> {
  try {
    const resend = getResendClient();
    const { email, frequency } = subscription;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://year-in-review.vercel.app';
    
    const featuredConnections = selectFeaturedConnections(content, frequency);
    
    const emailContent = generateConnectionEmail({
      ...content,
      featuredConnections,
      frequency
    }, baseUrl, email);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your ${frequency === 'monthly' ? 'Monthly' : 'Quarterly'} Connection Check-In`,
      html: emailContent,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.id
    };
  } catch (error: any) {
    console.error('Failed to send check-in email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to send a test email
export async function sendTestEmail(email: string): Promise<EmailDeliveryResult> {
  try {
    const resend = getResendClient();
    const emailContent = generateTestEmail(email);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Test Email from Year In Review',
      html: emailContent
    });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.id
    };
  } catch (error: any) {
    console.error('Failed to send test email:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 