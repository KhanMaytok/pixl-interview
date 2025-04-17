'use client';

import { useState } from "react";
import { ChatArea } from "~/components/chats/area";
import { Sidebar } from "~/components/chats/sidebar";
import { ChatProvider } from "~/contexts/ChatContext";
import { useAuth } from "~/hooks/auth";
import { useUsers } from "~/hooks/useContacts";

export default function ChatLayout({ children }: { children: React.ReactNode }) {

  const { data: user } = useAuth();


  const { data: contacts = [], isLoading } = useUsers(Number(user?.userId));
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return <div className='flex h-screen bg-gray-50'>No user</div>;

  if (isLoading) return <div className='flex h-screen bg-gray-50'>Loading...</div>;

  if (!contacts) return <div className='flex h-screen bg-gray-50'>
    <Sidebar
      contacts={ [] }
      searchQuery={ searchQuery }
      onSearchChange={ setSearchQuery }
    />
    <ChatArea />
  </div>

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ChatProvider>
      <div className='flex h-screen bg-gray-50 w-full'>
        <Sidebar
          contacts={ filteredContacts }
          searchQuery={ searchQuery }
          onSearchChange={ setSearchQuery }
        />
        { children }
      </div>
    </ChatProvider>
  );
}
