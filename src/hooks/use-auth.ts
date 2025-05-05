import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      login: async (token) => {
        set({ token });
      },
      logout: async () => {
        set({ token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 