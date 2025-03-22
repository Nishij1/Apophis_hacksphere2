import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Translation {
  id: string;
  user_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

interface TranslationState {
  translations: Translation[];
  loading: boolean;
  error: string | null;
  saveTranslation: (translation: Omit<Translation, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  fetchTranslations: () => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  translations: [],
  loading: false,
  error: null,
  saveTranslation: async (translation) => {
    try {
      set({ loading: true, error: null });
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase.from('translations').insert([
        {
          user_id: user.user.id,
          ...translation,
        },
      ]);

      if (error) throw error;
      await get().fetchTranslations();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchTranslations: async () => {
    try {
      set({ loading: true, error: null });
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ translations: data as Translation[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  deleteTranslation: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchTranslations();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));