'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '~/contexts/ChatContext';
import { ChatArea } from '~/components/chats/area';
import { useContact } from '~/hooks/useContact';

export default function ChatPage() {
  const { chatId } = useParams();
  const { data: user, isLoading } = useContact(Number(chatId));
  const { fetchChatMessages, setReceiver } = useChatContext();

  useEffect(() => {
    if (user) {
      setReceiver(user.data);
    }
  }, [user, setReceiver]);

  useEffect(() => {
    const chatIdNum = Number(chatId);
    if (!Number.isNaN(chatIdNum)) {
      fetchChatMessages(chatIdNum);
    }
  }, [chatId, fetchChatMessages]);


  if (isLoading) {
    return <div className="flex h-screen">
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p>Loading data</p>
        </div>
      </div>
    </div>
  }

  return (
    <ChatArea />
  );
} 