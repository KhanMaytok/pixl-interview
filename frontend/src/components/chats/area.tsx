'use client';

import { Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useChatContext } from '~/contexts/ChatContext';
import type { Message } from '~/types/contact';

export function ChatArea() {
	const { sendMessage, senderId, receiver, messages } = useChatContext();
	const [message, setMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: Queremos que cuando hay nuevos mensajes, se desplace el scroll al final
	useEffect(() => {
		scrollToBottom();
	}, [messages.length]);

	const handleSendMessage = () => {
		if (!message.trim() || !receiver) return;
		sendMessage(message.trim(), receiver.userId);
		setMessage('');
	};

	if (!receiver) {
		return (
			<div className='flex-1 flex items-center justify-center bg-gray-50'>
				<div className='text-center text-gray-500'>
					<p>Select a contact to start chatting</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex-1 flex flex-col'>
			<div className='p-4 border-b bg-white flex items-center'>
				<Avatar>
					<AvatarImage
						src={ '/placeholder.svg' }
					/>
					<AvatarFallback>{ receiver.username.charAt(0) }</AvatarFallback>
				</Avatar>
				<div className='ml-3'>
					<h2 className='font-medium'>{ receiver.username }</h2>
				</div>
			</div>
			<div className='flex-1 p-4 overflow-y-auto bg-gray-50'>
				{ messages.length === 0 ? (
					<div className='h-full flex items-center justify-center text-gray-500'>
						<p>No messages yet. Start the conversation!</p>
					</div>
				) : (
					<div className='space-y-4'>
						{ messages.map(msg => {
							// Verificar si es un mensaje del sistema
							if ('type' in msg && msg.type === 'system') {
								return (
									<div key={ msg.timestamp.getTime() } className='flex justify-center'>
										<div className='bg-gray-100 text-gray-600 p-2 rounded-lg text-sm'>
											{ msg.message }
										</div>
									</div>
								);
							}

							// Es un mensaje de chat normal
							const chatMsg = msg as Message;
							return (
								<div
									key={ chatMsg.id }
									className={ `flex ${chatMsg.sender === senderId ? 'justify-end' : 'justify-start'}` }
								>
									<div
										className={ `max-w-[70%] p-3 rounded-lg ${chatMsg.sender === senderId
											? 'bg-blue-500 text-white'
											: 'bg-white text-gray-800'
											}` }
									>
										<p>{ chatMsg.message }</p>
										<span
											className={ `text-xs ${chatMsg.sender === senderId ? 'text-blue-100' : 'text-gray-500'
												} block text-right mt-1` }
										>
											{ new Date(chatMsg.timestamp).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											}) }
										</span>
									</div>
								</div>
							);
						}) }
						<div ref={ messagesEndRef } />
					</div>
				) }
			</div>
			<div className='p-4 border-t bg-white'>
				<div className='flex items-center'>
					<Input
						placeholder='Type a message...'
						value={ message }
						onChange={ e => setMessage(e.target.value) }
						onKeyDown={ e => {
							if (e.key === 'Enter') {
								handleSendMessage();
							}
						} }
					/>
					<Button
						className='ml-2'
						onClick={ handleSendMessage }
						disabled={ !message.trim() }
					>
						<Send className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	);
}
