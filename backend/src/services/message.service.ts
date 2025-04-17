import { prisma } from '../db';

export const messageService = {
  async createMessage(content: string, senderId: number, receiverId: number) {
    // Ordenar los IDs para asegurar que siempre usamos el mismo chat
    const [firstUserId, secondUserId] = [senderId, receiverId].sort((a, b) => a - b);

    // Buscar o crear un chat entre los dos usuarios
    const chat = await prisma.chat.upsert({
      where: {
        senderId_receiverId: {
          senderId: firstUserId,
          receiverId: secondUserId
        }
      },
      create: {
        senderId: firstUserId,
        receiverId: secondUserId
      },
      update: {}
    });

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        content,
        chatId: chat.id,
        sentBy: senderId
      }
    });

    return message;
  },

  async getChatMessages(userId: number, otherUserId: number) {
    const [firstUserId, secondUserId] = [userId, otherUserId].sort((a, b) => a - b);

    // Primero encontramos el chat
    const chat = await prisma.chat.findFirst({
      where: {
        senderId: firstUserId,
        receiverId: secondUserId,
      }
    });

    if (!chat) return [];

    // Buscamos si hay una fecha de eliminación para este usuario
    const deletedChat = await prisma.trash.findFirst({
      where: {
        chatId: chat.id,
        userId: userId
      },
      select: {
        deletedAt: true
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // Obtenemos los mensajes con el filtro de fecha si existe
    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id,
        AND: [
          // Filtrar mensajes que no están eliminados para este usuario
          {
            OR: [
              { deletedFor: null },
              { deletedFor: { not: userId } }
            ]
          },
          // Solo mostrar mensajes posteriores a la eliminación del chat (si existe)
          ...(deletedChat ? [{
            createdAt: {
              gt: deletedChat.deletedAt
            }
          }] : [])
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return messages;
  },

  async editMessage(messageId: number, newContent: string, userId: number) {
    // Primero verificamos que el usuario sea el dueño del mensaje
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        sentBy: userId // Asegura que solo el que envió puede editar
      }
    });

    if (!message) {
      throw new Error('Message not found or you do not have permission to edit it');
    }

    // Actualizamos el mensaje
    return prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent,
        edited: true,
        editedAt: new Date(),
      }
    });
  },

  async deleteMessage(messageId: number, userId: number) {
    return prisma.message.update({
      where: { id: messageId },
      data: { deletedFor: userId }
    });
  }
};