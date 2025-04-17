import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { compare, hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/middleware/auth";

export type User = {
  id: number;
  username: string;
};

const prisma = new PrismaClient();

const userResponseSchema = t.Object({
  userId: t.Number(),
  username: t.String(),
});

const loginResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.Optional(t.String()),
  data: t.Optional(
    t.Object({
      token: t.String(),
      user: userResponseSchema,
    })
  ),
});

export const login = new Elysia({
  prefix: "/auth",
})
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET,
    })
  )
  .use(authMiddleware)
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const { username, password } = body;

      try {
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          return {
            success: false,
            message: "User or password incorrect",
          };
        }

        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
          return {
            success: false,
            message: "User or password incorrect",
          };
        }

        const token = await jwt.sign({
          userId: user.userId,
          username: user.username,
        });

        if (set.cookie) {
          set.cookie.token = {
            value: token,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          };
        }

        return {
          success: true,
          data: {
            token,
            user: {
              userId: user.userId,
              username: user.username,
            },
          },
        };
      } catch (error) {
        console.error("Error during login:", error);
        return {
          success: false,
          message: "Error processing request",
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
      response: loginResponseSchema,
    }
  )
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const { username, password } = body;

      try {
        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });

        const token = await jwt.sign({
          userId: user.userId,
          username: user.username,
        });

        if (set.cookie) {
          set.cookie.token = {
            value: token,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          };
        }

        return {
          success: true,
          data: {
            token,
            user: {
              userId: user.userId,
              username: user.username,
            },
          },
        };
      } catch (error) {
        console.error("Error during registration:", error);
        return {
          success: false,
          message: "Error processing request",
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
      response: loginResponseSchema,
    }
  )
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers.authorization;

    if (!authHeader) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    const token = authHeader;

    if (!token) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    try {
      const payload = await jwt.verify(token);

      if (!payload) {
        return {
          user: null,
          isAuthenticated: false,
        };
      }

      return {
        user: {
          userId: payload.userId,
          username: payload.username,
        },
        isAuthenticated: true,
      };
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }
  })
  .derive(({ user, isAuthenticated }) => ({
    getCurrentUser: () => user,
    checkAuth: () => isAuthenticated,
  }))
  .get("/verify-token", async ({ checkAuth, getCurrentUser, set }) => {
    if (!checkAuth()) {
      set.status = 401;
      return {
        success: false,
        user: null,
      };
    }

    const user = getCurrentUser();

    if (!user) return {
      success: false,
      user: null,
    };


    return {
      success: true,
      user: { userId: user.userId, username: user.username }
    };
  }, {
    headers: t.Object({
      authorization: t.String(),
    }),
  });
