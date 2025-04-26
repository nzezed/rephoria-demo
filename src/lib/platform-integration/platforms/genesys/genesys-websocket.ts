import WebSocket from 'ws'
import { EventEmitter } from 'events'

export class GenesysWebSocket extends EventEmitter {
  private ws: WebSocket | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private messageHandler: (message: any) => Promise<void>
  private authToken: string | null = null
  private connected: boolean = false

  constructor(messageHandler: (message: any) => Promise<void>) {
    super()
    this.messageHandler = messageHandler
  }

  async connect(authToken: string): Promise<void> {
    this.authToken = authToken

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://notifications.mypurecloud.com/streaming/notifications', {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
          },
        })

        this.ws.on('open', () => {
          this.connected = true
          this.startPingInterval()
          this.subscribe()
          resolve()
        })

        this.ws.on('message', async (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString())
            await this.handleMessage(message)
          } catch (error) {
            console.error('Error processing WebSocket message:', error)
          }
        })

        this.ws.on('close', () => {
          this.connected = false
          this.cleanup()
          this.scheduleReconnect()
        })

        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error)
          if (!this.connected) {
            reject(error)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async disconnect(): Promise<void> {
    this.cleanup()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping()
      }
    }, 30000) // Send ping every 30 seconds
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimeout && this.authToken) {
      this.reconnectTimeout = setTimeout(async () => {
        try {
          await this.connect(this.authToken!)
        } catch (error) {
          console.error('Failed to reconnect:', error)
          this.scheduleReconnect()
        }
      }, 5000) // Try to reconnect after 5 seconds
    }
  }

  private subscribe(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Subscribe to various topics
      const topics = [
        'v2.conversations.{id}',
        'v2.users.{id}.presence',
        'v2.analytics.queues.{id}',
      ]

      const subscribeMessage = {
        action: 'subscribe',
        topics: topics,
      }

      this.ws.send(JSON.stringify(subscribeMessage))
    }
  }

  private async handleMessage(message: any): Promise<void> {
    // Handle different types of messages
    if (message.topicName && message.eventBody) {
      await this.messageHandler(message)
    }
  }
} 