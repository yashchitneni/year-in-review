import type { GeneratedContent } from '../content-generation/pipeline';
import type { CheckInFrequency } from '@/types/check-in';

interface FeaturedConnection {
  name: string;
  context: string;
  suggestedAction: string;
  conversationStarter: string;
}

interface ConnectionEmailContent extends GeneratedContent {
  featuredConnections: FeaturedConnection[];
  frequency: CheckInFrequency;
}

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #374151;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .header {
    text-align: center;
    padding: 20px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .content {
    padding: 20px 0;
  }
  .section {
    margin-bottom: 30px;
  }
  .section-title {
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 15px;
  }
  .insight-item {
    background: #f3f4f6;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
  }
  .question-item {
    background: #f0f9ff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
  }
  .footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #e5e7eb;
    font-size: 14px;
    color: #6b7280;
  }
  .button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    margin-top: 15px;
  }
  .connection-card {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .connection-name {
    font-size: 24px;
    font-weight: 600;
    color: #be185d;
    margin-bottom: 12px;
  }
  .connection-detail {
    margin: 8px 0;
    padding-left: 20px;
    position: relative;
  }
  .connection-detail:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #be185d;
  }
`;

function generateConnectionSection(connections: FeaturedConnection[], frequency: CheckInFrequency): string {
  return `
    <div class="section">
      <h2 class="section-title">Featured Connections for Today</h2>
      ${connections.map(connection => `
        <div class="connection-card">
          <div class="connection-name">${connection.name}</div>
          <div class="connection-detail">Context: ${connection.context}</div>
          <div class="connection-detail">Suggested Action: ${connection.suggestedAction}</div>
          <div class="connection-detail">Conversation Starter: ${connection.conversationStarter}</div>
        </div>
      `).join('')}
      <p style="text-align: center; color: #6b7280; margin-top: 20px;">
        These connections were selected for your ${frequency === 'daily' ? 'daily' : frequency === 'monthly' ? 'monthly' : 'quarterly'} check-in.
      </p>
    </div>
  `;
}

export function generateConnectionEmail(content: ConnectionEmailContent, baseUrl: string, email: string): string {
  const { frequency, featuredConnections } = content;
  
  const frequencyText = frequency === 'daily' ? 'Daily' : frequency === 'monthly' ? 'Monthly' : 'Quarterly';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Connection Check-In</title>
        <style>
          ${baseStyles}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #1f2937; margin: 0;">Your ${frequencyText} Connection Check-In</h1>
            <p style="color: #6b7280; margin-top: 10px;">Building stronger relationships through intentional connection</p>
          </div>
          
          <div class="content">
            ${generateConnectionSection(featuredConnections, frequency)}
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; margin-bottom: 15px;">
                Take action on these connections this ${frequency === 'daily' ? 'day' : frequency === 'monthly' ? 'month' : 'quarter'} to strengthen your relationships.
              </p>
              <a href="${baseUrl}/settings?email=${encodeURIComponent(email)}" class="button">
                Update Preferences
              </a>
            </div>
          </div>

          <div class="footer">
            <p>
              You're receiving this email because you subscribed to connection check-ins.
              <br>
              <a href="${baseUrl}/settings?email=${encodeURIComponent(email)}">Update preferences</a> or <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}">unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateTestEmail(email: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
        <style>
          ${baseStyles}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #1f2937; margin: 0;">Test Email</h1>
            <p style="color: #6b7280; margin-top: 10px;">Verifying email delivery system</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="insight-item">
                This is a test email to verify the email delivery system is working correctly.
              </div>
              <div class="insight-item">
                If you received this, the email system is properly configured! 🎉
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is a test email. No action required.</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 