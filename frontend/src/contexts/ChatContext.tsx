'use client';

import { createContext, useContext, useState, useCallback, type ReactNode, useMemo, useEffect } from 'react';
import { client } from '~/api/client';
import type { Contact, Message } from '~/types/contact';
import { useAuth } from '~/hooks/auth';
import { wsManager } from '~/lib/websocket';

interface SystemMessage {
  type: 'system';
  message: string;
  timestamp: Date;
}

type ChatMessage = Message | SystemMessage;

interface ChatContextType {
  receiver: Contact | null;
  senderId: number;
  setReceiver: (contact: Contact | null) => void;
  fetchChatMessages: (otherUserId: number) => Promise<unknown>;
  sendMessage: (message: string, receiverId: number) => Promise<unknown>;
  messages: ChatMessage[];
  clearContext: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: currentUser, isLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [receiver, setReceiver] = useState<Contact | null>(null);
  const [messageHistory, setMessageHistory] = useState<Record<string, ChatMessage[]>>({});

  const senderId = currentUser?.userId ? Number(currentUser.userId) : -1;

  // Conectar al WebSocket cuando el usuario está autenticado
  useEffect(() => {
    if (currentUser?.userId) {
      wsManager.connect(Number(currentUser.userId));
    }
  }, [currentUser?.userId]);

  // Manejar mensajes entrantes
  useEffect(() => {
    const handleMessage = (data: any) => {
      try {
        if (data.type === 'system') {
          const systemMessage: SystemMessage = {
            type: 'system',
            message: data.message,
            timestamp: new Date(data.timestamp)
          };
          setMessages(prev => [...prev, systemMessage]);
          return;
        }

        if (data.type === 'chat') {
          const chatMessage: Message = {
            id: data.timestamp.toString(),
            message: data.message,
            sender: data.sender ?? -1,
            receiver: Number(currentUser?.userId),
            timestamp: new Date(data.timestamp)
          };

          if (receiver && (data.sender === receiver.userId || data.sender === currentUser?.userId)) {
            setMessages(prev => [...prev, chatMessage]);
          }

          const chatId = [data.sender, Number(currentUser?.userId)].sort((a, b) => (a ?? 0) - (b ?? 0)).join('-');
          setMessageHistory(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), chatMessage]
          }));
        }
      } catch (e) {
        console.error('Error handling message:', e);
      }
    };

    wsManager.addMessageHandler(handleMessage);

    return () => {
      wsManager.removeMessageHandler(handleMessage);
    };
  }, [currentUser?.userId, receiver]);

  const sendMessage = useCallback(async (message: string, receiverId: number) => {
    if (!currentUser?.userId) return;

    try {
      wsManager.sendMessage(message, receiverId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [currentUser?.userId]);

  const fetchChatMessages = useCallback(async (otherUserId: number) => {
    if (isLoading || !currentUser?.userId) {
      console.log('Cannot fetch messages: isLoading or currentUser is null');
      return [];
    }

    try {
      console.log('Fetching messages for users:', currentUser.userId, otherUserId);

      const response = await client.api.messages.fetch.post({
        userId: currentUser.userId.toString(),
        otherUserId: otherUserId.toString()
      });

      console.log('Fetch messages response:', response);

      if (response?.data?.success && response.data?.data) {
        const formattedMessages: Message[] = Array.isArray(response.data.data)
          ? response.data.data.map((msg) => ({
            id: msg.id.toString(),
            message: msg.content,
            sender: msg.sentBy,
            receiver: Number(currentUser.userId),
            timestamp: msg.createdAt
          }))
          : [];

        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);
        return formattedMessages;
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, [currentUser?.userId, isLoading]);

  const clearContext = useCallback(() => {
    setMessages([]);
    setReceiver(null);
  }, []);

  return (
    <ChatContext.Provider value={ { receiver, setReceiver, fetchChatMessages, messages, senderId, sendMessage, clearContext } }>
      { children }
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 