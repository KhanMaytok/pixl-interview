import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const users = new Elysia({
  prefix: "/users",
})
  .get('/', async ({ query }) => {
    if (query.userId) {
      const users = await prisma.user.findMany({
        where: {
          userId: {
            not: query.userId,
          },
        },
      });

      return users.map((user) => ({
        userId: user.userId,
        username: user.username,
      }));
    }

    const users = await prisma.user.findMany();
    return users.map((user) => ({
      userId: user.userId,
      username: user.username,
    }));
  }, {
    query: t.Optional(t.Object({
      userId: t.Optional(t.Number()),
    }))
  })
  .get('/:userId', async ({ params }) => {
    const user = await prisma.user.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user.userId,
      username: user.username,
    };
  }, {
    params: t.Object({
      userId: t.Number(),
    })
  });
