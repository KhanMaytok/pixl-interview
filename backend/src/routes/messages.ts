import { Elysia, t } from "elysia";
import { messageService } from "@/services/message.service";

export const messages = new Elysia({
  prefix: "/messages",
})
  .post("/chat", async ({ body }) => {
    const { userId, otherUserId, message } = body;

    try {
      const newMessage = await messageService.createMessage(message, Number.parseInt(userId), Number.parseInt(otherUserId));
      return {
        success: true,
        data: newMessage
      };
    } catch (error) {
      console.error("Error creating message:", error);
      return {
        success: false,
        error: "Failed to create message"
      };
    }
  }, {
    body: t.Object({
      userId: t.String(),
      otherUserId: t.String(),
      message: t.String()
    })
  }).post("/fetch", async ({ body }) => {
    const { userId, otherUserId } = body;

    try {
      const messages = await messageService.getChatMessages(
        Number.parseInt(userId),
        Number.parseInt(otherUserId)
      );

      console.log(messages);

      return {
        success: true,
        data: messages
      };
    } catch (error) {
      console.error("Error retrieving messages:", error);
      return {
        success: false,
        error: "Failed to retrieve messages"
      };
    }
  }, {
    body: t.Object({
      userId: t.String(),
      otherUserId: t.String()
    })
  });

