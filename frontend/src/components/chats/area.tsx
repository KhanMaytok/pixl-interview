'use client';

import { Edit, MoreVertical, Send, Trash, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useChatContext } from '~/contexts/ChatContext';
import type { Message } from '~/types/contact';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { wsManager } from '~/lib/websocket';
import { Textarea } from '~/components/ui/textarea';

export function ChatArea() {
	const { sendMessage, senderId, receiver, messages, deleteMessage } = useChatContext();
	const [message, setMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editingMessageText, setEditingMessageText] = useState('');

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

	const handleEditMessage = (msg: Message) => {
		setEditingMessageId(Number(msg.id));
		setEditingMessageText(msg.message);
	};

	const handleSaveEdit = () => {
		if (editingMessageId && receiver) {
			wsManager.editMessage(editingMessageId, editingMessageText, receiver.userId);
			setEditingMessageId(null);
			setEditingMessageText('');
		}
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
							const isEditing = editingMessageId === Number(chatMsg.id);
							return (
								<div
									key={ chatMsg.id }
									className={ `flex group flex-row items-center space-y-2 ${chatMsg.sender === senderId ? 'justify-end' : 'justify-start'}` }
								>
									{ isEditing ? (
										<div className="flex items-center gap-2">
											<Input
												value={ editingMessageText }
												onChange={ e => setEditingMessageText(e.target.value) }
												onKeyDown={ e => {
													if (e.key === 'Enter') {
														handleSaveEdit();
													}
												} }
											/>
											<Button onClick={ handleSaveEdit } disabled={ !editingMessageText.trim() }>
												Save
											</Button>
										</div>
									) : (
										<div
											className={ `max-w-[70%] p-3 rounded-lg ${chatMsg.sender === senderId
												? 'bg-blue-500 text-white'
												: 'bg-white text-gray-800'
												}` }
										>
											<p>{ chatMsg.message }</p>
											<div className="flex items-center justify-end gap-2 mt-1">
												{ chatMsg.edited && (
													<span className={ `text-xs ${chatMsg.sender === senderId ? 'text-blue-100' : 'text-gray-500'}` }>
														(edited)
													</span>
												) }
												<span
													className={ `text-xs ${chatMsg.sender === senderId ? 'text-blue-100' : 'text-gray-500'
														}` }
												>
													{ new Date(chatMsg.timestamp).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													}) }
												</span>
											</div>
										</div>
									) }
									{ chatMsg.sender === senderId && (

										<div className='relative'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														className="h-8 w-8 p-0"
														size="icon"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{
														isEditing ? (
															<DropdownMenuItem
																onClick={ () => setEditingMessageId(null) }
																className="cursor-pointer"
															>
																<X className="mr-2 h-4 w-4" />
																<span>Cancel</span>
															</DropdownMenuItem>
														) : (
															<>
																<DropdownMenuItem
																	onClick={ () => handleEditMessage(chatMsg) }
																	className="cursor-pointer"
																>
																	<Edit className="mr-2 h-4 w-4" />
																	<span>Edit</span>
																</DropdownMenuItem>

																<DropdownMenuItem
																	onClick={ () => deleteMessage(chatMsg.id) }
																	className="cursor-pointer text-red-600"
																>
																	<Trash className="mr-2 h-4 w-4" />
																	<span>Delete</span>
																</DropdownMenuItem>
															</>
														) }
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									) }
								</div>
							);
						}) }
						<div ref={ messagesEndRef } />
					</div>
				) }
			</div>
			<div className='p-4 border-t bg-white h-1/9'>
				<div className='flex h-full items-start'>
					<Textarea
						className='w-full h-full'
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
