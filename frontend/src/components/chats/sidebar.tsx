'use client';
import { Search, Trash } from 'lucide-react';
import { Button } from '~/components/ui/button';

import type { Contact } from '~/types/contact';
import Link from 'next/link';
import { cn } from '~/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '~/components/ui/input';
import { useEffect } from 'react';
import { useChatContext } from '~/contexts/ChatContext';
import { useAuth } from '~/hooks/auth';
interface SidebarProps {
	contacts: Contact[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

export function Sidebar({ contacts, searchQuery, onSearchChange }: SidebarProps) {
	const path = usePathname();
	const router = useRouter();
	const { data: currentUser } = useAuth();

	const { clearContext, deleteChat } = useChatContext();
	// Quiero escuchar la tecla ESC para salir de la ruta actual
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				router.push('/chats');
				router.refresh();
				clearContext();
			}
		};

		window.addEventListener('keydown', handleEscape);

		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	}, [router]);

	return (
		<div className='w-1/5 border-r bg-white h-screen justify-between flex flex-col'>
			<div className='p-4 flex items-center gap-2'>
				<Button variant='ghost' size='icon'>
					<Search className='h-4 w-4' />
				</Button>
				<Input
					type='text'
					placeholder='Search contacts...'
					value={ searchQuery }
					onChange={ (e) => onSearchChange(e.target.value) }
					className='w-full p-2 border rounded'
				/>
			</div>
			<div className='overflow-y-auto h-[calc(100vh-4rem)]'>
				{ contacts.map((contact) => (
					<div key={ contact.userId } className={ cn('w-full p-4 hover:bg-gray-50 flex justify-start items-center gap-3', {
						'bg-gray-50': path === `/chats/${contact.userId}`,
					}) }>
						<Link
							className='flex items-center justify-start gap-2 w-full'
							href={ `/chats/${contact.userId}` }

						>
							<div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
								{ contact.username[0].toUpperCase() }
							</div>
							<div className='text-left'>
								<div className='font-medium'>{ contact.username }</div>
							</div>
						</Link>
						<Button variant='ghost' size='icon' onClick={ () => {
							deleteChat(contact.userId);
							router.push('/chats');
							router.refresh();
							clearContext();
						} }>
							<Trash />
						</Button>
					</div>
				)) }
			</div>

			<div className='text-center text-sm text-gray-500 rounded-md bg-gray-100/50 m-4 p-4'>
				Connected as { currentUser?.username }
			</div>
		</div>
	);
}

