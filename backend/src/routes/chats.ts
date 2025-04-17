import { prisma } from "@/db";
import Elysia, { t } from "elysia";

export const chats = new Elysia()
  .delete('/chats', async ({ body }) => {
    const { userId, otherUserId } = body;
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [{ senderId: userId, receiverId: otherUserId }, { senderId: otherUserId, receiverId: userId }],
      },
    });

    if (!chat) {
      return { success: false, message: 'Chat not found' };
    }

    await prisma.trash.create({
      data: {
        userId: userId,
        chatId: chat.id,
      },
    });

    return { success: true, message: 'Chat deleted' };
  },
    {
      body: t.Object({
        userId: t.Number(),
        otherUserId: t.Number(),
      }),
    }
  );
