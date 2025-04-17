
import type { EdenWS } from '@elysiajs/eden/treaty';
import { client } from '~/api/client';

type MessageHandler = (data: any) => void;

class WebSocketManager {
  private static instance: WebSocketManager;
  private subscription: EdenWS<{
    body: {
      message: string;
      receiver: number;
    };
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    params: {};
    query: {
      userId: number | null;
    };
    headers: unknown;
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    response: {};
  }> | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private userId: number | null = null;

  private constructor() { }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(userId: number) {
    if (this.userId === userId && this.subscription) {
      return; // Ya está conectado con este usuario
    }

    this.userId = userId;

    // Cerrar la conexión anterior si existe
    if (this.subscription) {
      this.subscription.close();
    }

    try {
      this.subscription = client.api.ws.chat.subscribe({
        query: {
          userId: userId,
        },
      });

      this.subscription.subscribe((msg: unknown) => {
        console.log('WebSocket message received:', msg);
        // biome-ignore lint/complexity/noForEach: <explanation>
        this.messageHandlers.forEach(handler => handler(msg.data));
      });

      console.log('WebSocket connected for user:', userId);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  public disconnect() {
    if (this.subscription) {
      this.subscription.close();
      this.subscription = null;
      this.userId = null;
      console.log('WebSocket disconnected');
    }
  }

  public addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
  }

  public sendMessage(message: string, receiver: number) {
    if (!this.subscription) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      this.subscription.send({
        message,
        receiver,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

export const wsManager = WebSocketManager.getInstance();