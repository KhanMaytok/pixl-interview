import { Elysia } from "elysia";
import { ws } from "@/routes/ws";
import { login } from "@/routes/auth";
import { users } from "@/routes/users";
import { authMiddleware } from "@/middleware/auth";
import { messages } from "@/routes/messages";
import cors from "@elysiajs/cors";
import { chats } from "@/routes/chats";
export const PORT = 6969;

// Create the application with auth middleware
export const app = new Elysia({
  prefix: '/api'
})
  .use(cors())
  .use(authMiddleware)
  .get("/", () => "Hello Elysia")
  .use(ws)
  .use(login)
  .use(users)
  .use(messages)
  .use(chats)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${PORT}`
);

export type App = typeof app;