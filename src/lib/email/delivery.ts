import { Resend } from 'resend';
import type { GeneratedContent } from '../content-generation/pipeline';
import type { Subscription } from '@/types/check-in';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain for all environments
const FROM_EMAIL = 'Year In Review <checkins@yash.is>';

export interface EmailDeliveryResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

function formatInsights(insights: string[]): string {
  return insights
    .map((insight, index) => `${index + 1}. ${insight}`)
    .join('\n\n');
}

function formatQuestions(questions: string[]): string {
  return questions
    .map((question, index) => `${index + 1}. ${question}`)
    .join('\n\n');
}

export async function sendCheckInEmail(
  subscription: Subscription,
  content: GeneratedContent
): Promise<EmailDeliveryResult> {
  try {
    const { email } = subscription;
    const { insights, followUpQuestions, framework } = content;

    const emailContent = `
      <h1>Your ${framework} Check-In Insights</h1>
      
      <h2>🔮 Key Insights</h2>
      <p style="white-space: pre-line">${formatInsights(insights)}</p>
      
      <h2>❓ Reflection Questions</h2>
      <p style="white-space: pre-line">${formatQuestions(followUpQuestions)}</p>
      
      <hr />
      
      <p>
        <small>
          To update your preferences or unsubscribe, 
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings?email=${encodeURIComponent(email)}">click here</a>
        </small>
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your ${framework} Journey Check-In`,
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
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Test Email from Year In Review',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the email delivery system is working correctly.</p>
        <p>If you received this, the email system is properly configured! 🎉</p>
      `
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