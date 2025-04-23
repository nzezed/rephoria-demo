import { STEAM_CONNECT_CONFIG, SteamConnectSession, SteamConnectAgent, SteamConnectQueue } from '../config/steam-connect';

class SteamConnectService {
  private apiKey?: string;
  private apiEndpoint: string;
  private initialized: boolean = false;

  constructor() {
    this.apiEndpoint = STEAM_CONNECT_CONFIG.apiEndpoint;
  }

  private initialize() {
    if (!this.initialized) {
      if (!STEAM_CONNECT_CONFIG.apiKey) {
        throw new Error('Steam Connect API key is required');
      }
      this.apiKey = STEAM_CONNECT_CONFIG.apiKey;
      this.initialized = true;
    }
  }

  // Session management
  async createSession(channel: SteamConnectSession['channel'], customerId: string): Promise<SteamConnectSession> {
    this.initialize();
    try {
      const response = await fetch(`${this.apiEndpoint}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          customerId,
          queueId: STEAM_CONNECT_CONFIG.routing.defaultQueue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Steam Connect session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Steam Connect session:', error);
      throw error;
    }
  }

  // Agent management
  async getAvailableAgents(): Promise<SteamConnectAgent[]> {
    this.initialize();
    try {
      const response = await fetch(`${this.apiEndpoint}/agents?status=available`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available agents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available agents:', error);
      return [];
    }
  }

  // Queue management
  async getQueueStatus(queueId: string): Promise<SteamConnectQueue> {
    this.initialize();
    try {
      const response = await fetch(`${this.apiEndpoint}/queues/${queueId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queue status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching queue status:', error);
      return {
        id: queueId,
        name: 'General',
        skills: [],
        agents: [],
        waitingCustomers: 0,
        averageWaitTime: 0,
      };
    }
  }

  // Session transfer
  async transferSession(sessionId: string, targetAgentId: string): Promise<SteamConnectSession> {
    this.initialize();
    try {
      const response = await fetch(`${this.apiEndpoint}/sessions/${sessionId}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAgentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transfer session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error transferring session:', error);
      throw error;
    }
  }

  // Real-time updates using WebSocket
  subscribeToUpdates(callback: (update: any) => void): WebSocket {
    this.initialize();
    const ws = new WebSocket(`${this.apiEndpoint.replace('http', 'ws')}/realtime`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'auth',
        apiKey: this.apiKey,
      }));
    };

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      callback(update);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}

export const steamConnectService = new SteamConnectService(); 