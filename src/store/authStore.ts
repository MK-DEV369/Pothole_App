import { create } from 'zustand';
import set from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: Error | null;
}

const handleError = (error: Error) => {
  console.error('Auth error:', error);
  set((state) => ({ ...state, error }));
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        set({ user: profile, loading: false });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleError(err);
      } else {
        handleError(new Error(String(err)));
      }
    }
  },
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            points: 0,
          });
        if (profileError) throw profileError;
        set({ 
          user: { 
            id: data.user.id, 
            email: data.user.email!, 
            points: 0, 
            created_at: new Date().toISOString(), 
            is_admin: false 
          }, 
          loading: false 
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleError(err);
      } else {
        handleError(new Error(String(err)));
      }
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleError(err);
      } else {
        handleError(new Error(String(err)));
      }
    }
  }
}));
