import { supabase, isSupabaseConfigured } from './supabase';
import { RateLimiter } from './rateLimiter';
import { TranslationCache } from './translationCache';

// API Configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Validate environment variables
const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_DEEPSEEK_API_KEY',
    'VITE_OPENAI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
}

interface TranslationResponse {
  translatedText: string;
  source: 'deepseek' | 'chatgpt';
  error?: string;
}

export class AITranslationService {
  private static instance: AITranslationService;
  private isDeepSeekAvailable: boolean = true;
  private rateLimiter: RateLimiter;
  private translationCache: TranslationCache;

  private constructor() {
    validateEnvironment();
    this.rateLimiter = RateLimiter.getInstance();
    this.translationCache = TranslationCache.getInstance();
  }

  public static getInstance(): AITranslationService {
    if (!AITranslationService.instance) {
      AITranslationService.instance = new AITranslationService();
    }
    return AITranslationService.instance;
  }

  private async translateWithDeepSeek(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Check rate limit before making the request
      const hasTokens = await this.rateLimiter.checkRateLimit('deepseek');
      if (!hasTokens) {
        throw new Error('Rate limit exceeded for DeepSeek');
      }

      const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!deepseekKey) {
        throw new Error('DeepSeek API key is not configured');
      }

      console.log('Making DeepSeek API request...');
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a medical translator. Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}. Maintain medical terminology accuracy.`
            },
            {
              role: 'user',
              content: request.text
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('DeepSeek API error response:', errorData);
        throw new Error(`DeepSeek API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log('DeepSeek API response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }
      
      // Consume rate limit token after successful translation
      await this.rateLimiter.consumeRateLimit('deepseek');
      
      return {
        translatedText: data.choices[0].message.content,
        source: 'deepseek'
      };
    } catch (error) {
      console.error('DeepSeek translation error:', error);
      this.isDeepSeekAvailable = false;
      throw error;
    }
  }

  private async translateWithChatGPT(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Check rate limit before making the request
      const hasTokens = await this.rateLimiter.checkRateLimit('chatgpt');
      if (!hasTokens) {
        throw new Error('Rate limit exceeded for ChatGPT');
      }

      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      console.log('Making ChatGPT API request...');
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a medical translator. Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}. Maintain medical terminology accuracy.`
            },
            {
              role: 'user',
              content: request.text
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ChatGPT API error response:', errorData);
        throw new Error(`ChatGPT API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log('ChatGPT API response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from ChatGPT API');
      }
      
      // Consume rate limit token after successful translation
      await this.rateLimiter.consumeRateLimit('chatgpt');
      
      return {
        translatedText: data.choices[0].message.content,
        source: 'chatgpt'
      };
    } catch (error) {
      console.error('ChatGPT translation error:', error);
      throw error;
    }
  }

  public async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Validate request
      if (!request.text || !request.sourceLanguage || !request.targetLanguage) {
        throw new Error('Missing required translation parameters');
      }

      // Check cache first
      const cachedTranslation = await this.translationCache.get(
        request.text,
        request.sourceLanguage,
        request.targetLanguage
      );

      if (cachedTranslation) {
        console.log('Using cached translation');
        return {
          translatedText: cachedTranslation.translatedText,
          source: cachedTranslation.translationSource
        };
      }

      // Try DeepSeek first if available
      if (this.isDeepSeekAvailable) {
        try {
          const result = await this.translateWithDeepSeek(request);
          
          // Cache the result
          await this.translationCache.set({
            sourceText: request.text,
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage,
            translatedText: result.translatedText,
            translationSource: result.source,
            usageCount: 1,
            lastUsed: new Date()
          });
          
          return result;
        } catch (error: any) {
          if (error.message === 'Rate limit exceeded for DeepSeek') {
            console.log('DeepSeek rate limit exceeded, falling back to ChatGPT');
          } else {
            console.log('Falling back to ChatGPT due to DeepSeek error:', error.message);
          }
        }
      }

      // Fallback to ChatGPT
      const result = await this.translateWithChatGPT(request);
      
      // Cache the result
      await this.translationCache.set({
        sourceText: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        translatedText: result.translatedText,
        translationSource: result.source,
        usageCount: 1,
        lastUsed: new Date()
      });
      
      return result;
    } catch (error) {
      // Log the translation attempt to Supabase
      await this.logTranslationError(request, error);
      throw new Error('Translation failed with both services');
    }
  }

  private async logTranslationError(request: TranslationRequest, error: any) {
    try {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Skipping error logging.');
        return;
      }

      await supabase.from('translation_errors').insert({
        source_text: request.text,
        source_language: request.sourceLanguage,
        target_language: request.targetLanguage,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log translation error:', logError);
    }
  }
} 