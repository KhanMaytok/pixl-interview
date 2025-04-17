import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

// Define the user type that will be available in the request context
export type User = {
  id: string;
  email: string;
};

export type Derived = {
  getCurrentUser: () => User | null;
  checkAuth: () => boolean;
};

// Create the auth middleware
export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET, // Make sure to set this in your .env
    })
  )
  .derive(async ({ jwt, headers }) => {
    const token = headers.authorization;

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
        user: payload as User,
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
  }));