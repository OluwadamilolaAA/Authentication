import { create } from "zustand";
import { signUp, login as loginAPI, type SignupRole, type SignupData,  } from "@/api/auth";

interface AuthState {
  user: any | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  signup: (role: SignupRole, data: SignupData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  signup: async (role, data) => {
    try {
      const res = await signUp(role, data);
      set({ user: res.user, isAuthenticated: true });
    } catch (err: any) {
      throw err;
    }
  },

  login: async (email, password) => {
    try {
      const res = await loginAPI(email, password);
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
      });
    } catch (err: any) {
      throw err;
    }
  },

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
