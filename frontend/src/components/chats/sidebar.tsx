'use client';
import { LogOut, Search, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { Contact } from '~/types/contact';
import Link from 'next/link';
import { cn } from '~/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '~/components/ui/input';
import { useEffect } from 'react';
import { useChatContext } from '~/contexts/ChatContext';
interface SidebarProps {
	contacts: Contact[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

export function Sidebar({ contacts, searchQuery, onSearchChange }: SidebarProps) {
	const path = usePathname();
	const router = useRouter();
	const { clearContext } = useChatContext();
	// Quiero escuchar la tecla ESC para salir de la ruta actual
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
		<div className='w-1/5 border-r bg-white'>
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
					<Link
						href={ `/chats/${contact.userId}` }
						key={ contact.userId }
						className={ cn('w-full p-4 hover:bg-gray-50 flex justify-start items-center gap-3', {
							'bg-gray-50': path === `/chats/${contact.userId}`,
						}) }
					>
						<div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
							{ contact.username[0].toUpperCase() }
						</div>
						<div className='text-left'>
							<div className='font-medium'>{ contact.username }</div>
						</div>
					</Link>
				)) }
			</div>
		</div>
	);
}

function UserMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='rounded-full'>
					<Avatar className='h-8 w-8'>
						<AvatarImage src='/placeholder.svg?height=32&width=32' alt='User' />
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem>
					<User className='mr-2 h-4 w-4' />
					<span>Profile</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Settings className='mr-2 h-4 w-4' />
					<span>Settings</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<LogOut className='mr-2 h-4 w-4' />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
