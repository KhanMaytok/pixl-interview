'use client';

import { ChatArea } from '~/components/chats/area';
import { useAuth } from '~/hooks/auth';

export default function Home() {
	const { data, isLoading } = useAuth();

	if (isLoading) return <div>Loading...</div>;

	if (!data) return <div>No data</div>;

	return <ChatArea />
}
