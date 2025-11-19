import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Store OAuth clients for each user
const userClients = new Map<string, OAuth2Client>();

export function createGmailOAuthClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || 'http://localhost:5000/api/auth/callback/gmail'
  );
}

export function getGmailAuthUrl(): string {
  const oauth2Client = createGmailOAuthClient();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent'
  });
}

export async function setGmailTokens(userId: string, code: string) {
  const oauth2Client = createGmailOAuthClient();
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // Store the client for this user
  userClients.set(userId, oauth2Client);
  
  return tokens;
}

export function getGmailClient(userId: string) {
  const oauth2Client = userClients.get(userId);
  if (!oauth2Client) {
    throw new Error('Gmail not connected for this user. Please connect Gmail first.');
  }
  
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// For backward compatibility with existing code
export async function getUncachableGmailClient(userId?: string) {
  if (!userId) {
    throw new Error('User ID required for Gmail access');
  }
  return getGmailClient(userId);
}

export function isGmailConnected(userId: string): boolean {
  return userClients.has(userId);
}