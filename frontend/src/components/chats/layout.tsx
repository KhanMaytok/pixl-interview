'use client';

import { useState } from 'react';
import { ChatArea } from '~/components/chats/area';
import { Sidebar } from '~/components/chats/sidebar';
import { useUsers } from '~/hooks/useContacts';
import type { Contact } from '~/types/contact';

type ChatProps = {
	user: Contact
}

export function ChatLayout({ user }: ChatProps) {
	const { data: contacts = [], isLoading } = useUsers(user.userId);
	const [searchQuery, setSearchQuery] = useState('');

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
		<div className='flex h-screen bg-gray-50'>
			<Sidebar
				contacts={ filteredContacts }
				searchQuery={ searchQuery }
				onSearchChange={ setSearchQuery }
			/>
			<ChatArea />
		</div>
	);
}
