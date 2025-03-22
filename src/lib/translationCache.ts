import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CacheEntry {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  translationSource: 'deepseek' | 'chatgpt';
  usageCount: number;
  lastUsed: Date;
}

export class TranslationCache {
  private static instance: TranslationCache;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_KEY_PREFIX = 'translation:';
  private readonly MEMORY_CACHE_SIZE = 1000; // Maximum number of entries in memory cache

  private constructor() {}

  public static getInstance(): TranslationCache {
    if (!TranslationCache.instance) {
      TranslationCache.instance = new TranslationCache();
    }
    return TranslationCache.instance;
  }

  private generateCacheKey(sourceText: string, sourceLanguage: string, targetLanguage: string): string {
    return `${this.CACHE_KEY_PREFIX}${sourceLanguage}:${targetLanguage}:${sourceText}`;
  }

  private async getFromDatabase(sourceText: string, sourceLanguage: string, targetLanguage: string): Promise<CacheEntry | null> {
    const { data, error } = await supabase
      .from('translation_cache')
      .select('*')
      .eq('source_text', sourceText)
      .eq('source_language', sourceLanguage)
      .eq('target_language', targetLanguage)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      sourceText: data.source_text,
      sourceLanguage: data.source_language,
      targetLanguage: data.target_language,
      translatedText: data.translated_text,
      translationSource: data.translation_source,
      usageCount: data.usage_count,
      lastUsed: new Date(data.last_used)
    };
  }

  private async saveToDatabase(entry: CacheEntry): Promise<void> {
    const { error } = await supabase
      .from('translation_cache')
      .upsert({
        source_text: entry.sourceText,
        source_language: entry.sourceLanguage,
        target_language: entry.targetLanguage,
        translated_text: entry.translatedText,
        translation_source: entry.translationSource,
        usage_count: entry.usageCount,
        last_used: entry.lastUsed.toISOString()
      });

    if (error) {
      console.error('Failed to save to database cache:', error);
    }
  }

  private async updateUsageCount(sourceText: string, sourceLanguage: string, targetLanguage: string): Promise<void> {
    const { error } = await supabase.rpc('update_translation_cache_usage', {
      p_source_text: sourceText,
      p_source_language: sourceLanguage,
      p_target_language: targetLanguage
    });

    if (error) {
      console.error('Failed to update usage count:', error);
    }
  }

  private manageMemoryCacheSize(): void {
    if (this.memoryCache.size > this.MEMORY_CACHE_SIZE) {
      // Remove least recently used entries
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime());
      
      const entriesToRemove = entries.slice(0, entries.length - this.MEMORY_CACHE_SIZE);
      entriesToRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  public async get(sourceText: string, sourceLanguage: string, targetLanguage: string): Promise<CacheEntry | null> {
    const cacheKey = this.generateCacheKey(sourceText, sourceLanguage, targetLanguage);
    
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry) {
      memoryEntry.lastUsed = new Date();
      memoryEntry.usageCount++;
      return memoryEntry;
    }

    // Check database cache
    const dbEntry = await this.getFromDatabase(sourceText, sourceLanguage, targetLanguage);
    if (dbEntry) {
      // Update memory cache
      this.memoryCache.set(cacheKey, dbEntry);
      this.manageMemoryCacheSize();
      
      // Update usage count in database
      await this.updateUsageCount(sourceText, sourceLanguage, targetLanguage);
      
      return dbEntry;
    }

    return null;
  }

  public async set(entry: CacheEntry): Promise<void> {
    const cacheKey = this.generateCacheKey(entry.sourceText, entry.sourceLanguage, entry.targetLanguage);
    
    // Update memory cache
    this.memoryCache.set(cacheKey, entry);
    this.manageMemoryCacheSize();
    
    // Update database cache
    await this.saveToDatabase(entry);
  }

  public async clear(): Promise<void> {
    this.memoryCache.clear();
    const { error } = await supabase.from('translation_cache').delete().neq('id', '');
    if (error) {
      console.error('Failed to clear database cache:', error);
    }
  }
} 