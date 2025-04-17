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
    // Ordenar los IDs para buscar el chat correcto
    const [firstUserId, secondUserId] = [userId, otherUserId].sort((a, b) => a - b);

    const chat = await prisma.chat.findFirst({
      where: {
        senderId: firstUserId,
        receiverId: secondUserId
      },
      include: {
        messages: {
          where: {
            OR: [
              { deletedFor: null },
              { deletedFor: { not: userId } }
            ]
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    return chat?.messages || [];
  },

  async deleteMessage(messageId: number, userId: number) {
    return prisma.message.update({
      where: { id: messageId },
      data: { deletedFor: userId }
    });
  }
};