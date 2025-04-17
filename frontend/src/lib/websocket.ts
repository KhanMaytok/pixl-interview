import type { EdenWS } from '@elysiajs/eden/treaty';
import { client } from '~/api/client';

type MessageHandler = (data: {
  type: string;
  message: string;
  timestamp: string;
  id?: string;
  sender?: number;
}) => void;

interface WSResponse {
  sender?: number;
  id?: number;
  message: string;
  type: string;
  timestamp: number;
}

interface WSMessage {
  message: string;
  receiver: number;
  type?: 'chat' | 'edit';
  messageId?: number;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private subscription: EdenWS<{
    body: WSMessage;
    params: Record<string, never>;
    query: {
      userId: number | null;
    };
    headers: Record<string, unknown>;
    response: WSResponse;
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

      this.subscription?.subscribe((msg: unknown) => {
        console.log('WebSocket message received:', msg);
        // @ts-ignore
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

  public editMessage(messageId: number, newContent: string, receiver: number) {
    if (!this.subscription) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      this.subscription.send({
        type: 'edit',
        messageId,
        message: newContent,
        receiver,
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }
}

export const wsManager = WebSocketManager.getInstance();