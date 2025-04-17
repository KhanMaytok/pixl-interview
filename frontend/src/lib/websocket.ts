import { client } from '~/api/client';

type MessageHandler = (data: any) => void;

class WebSocketManager {
  private static instance: WebSocketManager;
  private subscription: any = null;
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

      this.subscription.subscribe((msg: any) => {
        console.log('WebSocket message received:', msg);
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