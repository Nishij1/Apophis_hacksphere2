import { supabase } from './supabase/client';

export interface CachedTranslation {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  translationSource: 'deepseek' | 'chatgpt';
  usageCount: number;
  lastUsed: Date;
  medicalTerms?: Array<{
    term: string;
    explanation: string;
  }>;
}

export interface TranslationCache {
  id: number;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  medical_terms: Array<{
    term: string;
    explanation: string;
  }>;
  created_at: string;
}

export class TranslationCacheService {
  static async get(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationCache | null> {
    try {
      const { data, error } = await supabase
        .from('translation_cache')
        .select('*')
        .eq('source_text', sourceText)
        .eq('source_language', sourceLanguage)
        .eq('target_language', targetLanguage)
        .maybeSingle();

      if (error) {
        console.error('Error fetching from cache:', error);
        return null;
      }

      if (data) {
        return {
          ...data,
          medical_terms: data.medical_terms || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error in translation cache get:', error);
      return null;
    }
  }

  static async set(
    sourceText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string,
    medicalTerms: Array<{ term: string; explanation: string }>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('translation_cache')
        .insert({
          source_text: sourceText,
          translated_text: translatedText,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          medical_terms: medicalTerms
        });

      if (error) {
        console.error('Error saving to cache:', error);
      }
    } catch (error) {
      console.error('Error in translation cache set:', error);
    }
  }
}