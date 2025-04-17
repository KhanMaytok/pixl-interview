import type { User } from "./auth";

export type AuthContext = {
  user: User | null;
  isAuthenticated: boolean;
  getCurrentUser: () => User | null;
  checkAuth: () => boolean;
}; 