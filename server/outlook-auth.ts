import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

// Store access tokens for each user
const userTokens = new Map<string, string>();

class CustomAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

export function getOutlookAuthUrl(): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/auth/callback/outlook');
  const scopes = encodeURIComponent('https://graph.microsoft.com/Mail.Read offline_access');
  
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scopes}&` +
    `response_mode=query`;
}

export async function setOutlookTokens(userId: string, code: string) {
  const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  const params = new URLSearchParams();
  params.append('client_id', process.env.MICROSOFT_CLIENT_ID!);
  params.append('client_secret', process.env.MICROSOFT_CLIENT_SECRET!);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/auth/callback/outlook');
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  });
  
  const tokens = await response.json();
  
  if (tokens.access_token) {
    userTokens.set(userId, tokens.access_token);
  }
  
  return tokens;
}

export function getOutlookClient(userId: string) {
  const accessToken = userTokens.get(userId);
  if (!accessToken) {
    throw new Error('Outlook not connected for this user. Please connect Outlook first.');
  }
  
  const authProvider = new CustomAuthProvider(accessToken);
  return Client.initWithMiddleware({ authProvider });
}

// For backward compatibility with existing code
export async function getUncachableOutlookClient(userId?: string) {
  if (!userId) {
    throw new Error('User ID required for Outlook access');
  }
  return getOutlookClient(userId);
}

export function isOutlookConnected(userId: string): boolean {
  return userTokens.has(userId);
}