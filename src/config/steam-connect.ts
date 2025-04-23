export const STEAM_CONNECT_CONFIG = {
  apiEndpoint: process.env.STEAM_CONNECT_API_ENDPOINT || 'https://api.steam-connect.com',
  apiKey: process.env.STEAM_CONNECT_API_KEY,
  region: process.env.STEAM_CONNECT_REGION || 'EU',
  
  // Integration settings
  channels: {
    voice: true,
    chat: true,
    email: true,
    whatsapp: true,
    sms: true
  },
  
  // Default routing settings
  routing: {
    defaultQueue: 'general',
    skillBasedRouting: true,
    overflowThreshold: 5 // minutes
  }
};

export interface SteamConnectSession {
  sessionId: string;
  channel: 'voice' | 'chat' | 'email' | 'whatsapp' | 'sms';
  agentId?: string;
  customerId?: string;
  queueId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'transferred';
}

export interface SteamConnectAgent {
  id: string;
  name: string;
  email: string;
  skills: string[];
  status: 'available' | 'busy' | 'offline';
  currentSessions: string[];
}

export interface SteamConnectQueue {
  id: string;
  name: string;
  skills: string[];
  agents: string[];
  waitingCustomers: number;
  averageWaitTime: number;
} 